import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
  }

  next();
});
app.use(express.json());

// Persistent Data Storage Path
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
const bookingLookupAttempts = new Map<string, { count: number; resetAt: number }>();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  restaurant: {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    openingHours: {
      weekday: string;
      weekend: string;
      sunday: string;
    };
    policy: string;
  };
  menu: Array<{
    id: string;
    name: string;
    category: 'Starters' | 'Mains' | 'Desserts' | 'Beverages';
    description: string;
    price: number;
    isAvailable: boolean;
    dietaryTags: string[];
    image?: string;
  }>;
  reservations: Array<{
    id: string;
    bookingReference?: string;
    customerName: string;
    contactPhone: string;
    contactEmail: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    specialRequests?: string;
    status: 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Seated';
    source: 'Website Direct' | 'AI Chatbot';
    createdAt: string;
    updatedAt?: string;
  }>;
  messages?: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    status: string;
  }>;
}

function generateBookingReference(reservations: DBStructure['reservations']): string {
  const knownReferences = new Set(
    reservations.map((reservation) => reservation.bookingReference).filter(Boolean)
  );
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const reference = `MK-${new Date().getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
    if (!knownReferences.has(reference)) return reference;
  }
  throw new Error('Unable to generate a unique booking reference.');
}

function normalizeContact(value: unknown): string {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length === 11) digits = `0${digits.slice(2)}`;
  return digits;
}

function isValidLookupContact(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || normalizeContact(value).length >= 7;
}

function signAdminToken(payload: string): string {
  return crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
}

function createAdminToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  })).toString('base64url');
  return `${payload}.${signAdminToken(payload)}`;
}

function isValidAdminToken(token: string): boolean {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = Buffer.from(signAdminToken(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      username?: string;
      expiresAt?: number;
    };
    return decoded.username === (process.env.ADMIN_USERNAME || 'admin')
      && typeof decoded.expiresAt === 'number'
      && decoded.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: () => void): void {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !isValidAdminToken(token)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}

function requireAdminForProtectedRoutes(req: Request, res: Response, next: () => void): void {
  if (req.path === '/admin/login') {
    next();
    return;
  }

  const method = req.method;
  const pathName = req.path;
  const protectedRoute =
    pathName.startsWith('/admin/') ||
    (pathName === '/reservations' && method === 'GET') ||
    (pathName.startsWith('/reservations/') && method !== 'POST') ||
    (pathName === '/menu' && method !== 'GET') ||
    (pathName.startsWith('/menu/') && method !== 'GET') ||
    (pathName === '/contact' && method === 'GET') ||
    (pathName === '/restaurant' && method !== 'GET') ||
    pathName === '/seed/reset';

  if (protectedRoute) {
    requireAdmin(req, res, next);
    return;
  }
  next();
}

app.use('/api', requireAdminForProtectedRoutes);

// Initial Seed Data with generated photography & curated dishes
const INITIAL_DATA: DBStructure = {
  messages: [],
  restaurant: {
    name: 'MiniKitchen',
    tagline: 'Good Food, Great Moments.',
    address: 'Colombo, Sri Lanka',
    phone: '+94 76 673 7844',
    email: 'info@minikitchen.lk',
    openingHours: {
      weekday: 'Mon – Sun | 11:00 AM – 10:00 PM',
      weekend: 'Mon – Sun | 11:00 AM – 10:00 PM',
      sunday: 'Mon – Sun | 11:00 AM – 10:00 PM',
    },
    policy: 'Freshly prepared meals, a cozy atmosphere and a table always ready for you.',
  },
  menu: [
    // --- 1. BURGERS ---
    {
      id: 'm1',
      name: 'Classic Burger',
      category: 'Burgers' as any,
      description: 'Juicy grilled beef patty, cheese, lettuce, tomato and our special sauce.',
      price: 1250,
      isAvailable: true,
      dietaryTags: ["Chef's Special"],
      image: '/public/assets/crops/dish_burger.png',
    },
    {
      id: 'm2',
      name: 'Cheese Burger',
      category: 'Burgers' as any,
      description: 'Double cheese, grilled patty and fresh veggies.',
      price: 1450,
      isAvailable: true,
      dietaryTags: ['Popular'],
      image: '/src/assets/images/food_cheese_burger_1793979902653.jpg',
    },
    {
      id: 'm3',
      name: 'Spicy Chicken Burger',
      category: 'Burgers' as any,
      description: 'Crispy chicken, spicy mayo and fresh lettuce.',
      price: 1350,
      isAvailable: false,
      dietaryTags: ['Spicy'],
      image: '/src/assets/images/food_spicy_chicken_burger_1793979918005.jpg',
    },
    {
      id: 'm11',
      name: 'Double Smash Beef Burger',
      category: 'Burgers' as any,
      description: 'Double seared beef patties, melted cheddar, caramelized onions, crisp pickles and secret sauce.',
      price: 1850,
      isAvailable: true,
      dietaryTags: ["Chef's Special", 'Popular'],
      image: '/src/assets/images/smash_beef_burger_1794144185428.jpg',
    },
    {
      id: 'm12',
      name: 'BBQ Bacon Gourmet Burger',
      category: 'Burgers' as any,
      description: 'Smoky beef patty, crisp smoked bacon, aged cheddar and house bourbon barbecue glaze.',
      price: 1750,
      isAvailable: true,
      dietaryTags: ['Popular'],
      image: '/src/assets/images/food_classic_burger_1793943077745.jpg',
    },

    // --- 2. PASTA ---
    {
      id: 'm4',
      name: 'Creamy Pasta',
      category: 'Pasta' as any,
      description: 'Rich and creamy pasta with herbs and parmesan.',
      price: 1650,
      isAvailable: true,
      dietaryTags: ['Vegetarian', "Chef's Special"],
      image: '/public/assets/crops/dish_pasta.png',
    },
    {
      id: 'm5',
      name: 'Chicken Alfredo',
      category: 'Pasta' as any,
      description: 'Creamy Alfredo with grilled chicken and mushrooms.',
      price: 1750,
      isAvailable: true,
      dietaryTags: ['Popular'],
      image: '/src/assets/images/food_chicken_alfredo_1793979932174.jpg',
    },
    {
      id: 'm6',
      name: 'Spicy Arrabiata',
      category: 'Pasta' as any,
      description: 'Classic tomato based pasta with a spicy kick.',
      price: 1550,
      isAvailable: true,
      dietaryTags: ['Vegetarian', 'Spicy'],
      image: '/src/assets/images/food_spicy_arrabiata_1793979947855.jpg',
    },
    {
      id: 'm13',
      name: 'Signature Truffle Tagliatelle',
      category: 'Pasta' as any,
      description: 'Handmade egg tagliatelle tossed in wild black truffle cream and aged Parmigiano Reggiano.',
      price: 2150,
      isAvailable: true,
      dietaryTags: ["Chef's Special", 'Vegetarian'],
      image: '/src/assets/images/food_signature_truffle_pasta_1793941744497.jpg',
    },

    // --- 3. CHICKEN ---
    {
      id: 'm7',
      name: 'Grilled Chicken',
      category: 'Chicken' as any,
      description: 'Tender marinated flame-grilled chicken cuts served with golden crispy fries.',
      price: 1950,
      isAvailable: true,
      dietaryTags: ['Gluten-Free', 'Popular'],
      image: '/src/assets/images/food_grilled_chicken_1793943077429.jpg',
    },
    {
      id: 'm14',
      name: 'Flame-Grilled Peri Peri Chicken',
      category: 'Chicken' as any,
      description: "Char-grilled half chicken basted in African bird's eye chili, garlic, fresh cilantro and lemon herbs.",
      price: 2050,
      isAvailable: true,
      dietaryTags: ['Spicy', "Chef's Special"],
      image: '/src/assets/images/peri_peri_chicken_1794144200612.jpg',
    },
    {
      id: 'm15',
      name: 'Herb Roasted Half Chicken',
      category: 'Chicken' as any,
      description: 'Slow-roasted chicken infused with rosemary, thyme, garlic butter and savory pan jus reduction.',
      price: 2250,
      isAvailable: false,
      dietaryTags: ['Gluten-Free'],
      image: '/public/assets/crops/dish_chicken.png',
    },

    // --- 4. WRAPS ---
    {
      id: 'm8',
      name: 'Chicken Wrap',
      category: 'Wraps' as any,
      description: 'Golden toasted wrap with tender spiced chicken, garden salad, and garlic aioli.',
      price: 1100,
      isAvailable: true,
      dietaryTags: ['Popular'],
      image: '/src/assets/images/food_chicken_wrap_1793943077739.jpg',
    },
    {
      id: 'm16',
      name: 'Gourmet Beef Shawarma Wrap',
      category: 'Wraps' as any,
      description: 'Tender spiced sirloin beef, pickled turnips, fresh parsley, tomatoes and creamy garlic tahini in warm pita.',
      price: 1450,
      isAvailable: true,
      dietaryTags: ["Chef's Special", 'Popular'],
      image: '/src/assets/images/beef_shawarma_wrap_1794144201442.jpg',
    },
    {
      id: 'm17',
      name: 'Falafel & Hummus Wrap',
      category: 'Wraps' as any,
      description: 'Crispy golden chickpea falafels, smoked paprika hummus, pickled cucumbers and lemon tahini.',
      price: 1050,
      isAvailable: true,
      dietaryTags: ['Vegetarian'],
      image: '/public/assets/crops/dish_wrap.png',
    },

    // --- 5. SIDES ---
    {
      id: 'm9',
      name: 'BBQ Wings',
      category: 'Sides' as any,
      description: 'Crispy glazed chicken wings tossed in rich honey barbecue sauce and sesame seeds.',
      price: 1450,
      isAvailable: true,
      dietaryTags: ["Chef's Special"],
      image: '/src/assets/images/food_bbq_wings_1793943079103.jpg',
    },
    {
      id: 'm18',
      name: 'Truffle Parmesan Fries',
      category: 'Sides' as any,
      description: 'Golden hand-cut fries drizzled with aromatic black truffle oil, grated parmesan and garlic aioli.',
      price: 950,
      isAvailable: true,
      dietaryTags: ['Vegetarian', 'Popular'],
      image: '/src/assets/images/truffle_fries_1794144234391.jpg',
    },
    {
      id: 'm19',
      name: 'Citrus Burrata Salad',
      category: 'Sides' as any,
      description: 'Creamy burrata cheese, citrus orange slices, heirloom tomatoes, fresh basil and balsamic reduction.',
      price: 1350,
      isAvailable: true,
      dietaryTags: ['Vegetarian', "Chef's Special"],
      image: '/src/assets/images/food_citrus_burrata_1793941745148.jpg',
    },

    // --- 6. DRINKS ---
    {
      id: 'm10',
      name: 'Iced Latte',
      category: 'Drinks' as any,
      description: 'Double shot espresso pulled fresh over chilled milk, ice cubes, and caramel drizzle.',
      price: 750,
      isAvailable: true,
      dietaryTags: ['Vegetarian'],
      image: '/src/assets/images/food_iced_latte_1793943078034.jpg',
    },
    {
      id: 'm20',
      name: 'Wild Berry Bliss Mojito',
      category: 'Drinks' as any,
      description: 'Muddled wild raspberries and blueberries, fresh garden mint, Persian lime and chilled sparkling soda.',
      price: 850,
      isAvailable: true,
      dietaryTags: ['Vegetarian', 'Popular'],
      image: '/src/assets/images/berry_bliss_mojito_1794144215709.jpg',
    },
    {
      id: 'm21',
      name: 'Passion Fruit Sparkler',
      category: 'Drinks' as any,
      description: 'Tropical passion fruit pulp shaken with lemon zest, mint sprigs and crisp sparkling water.',
      price: 780,
      isAvailable: true,
      dietaryTags: ['Vegetarian'],
      image: '/src/assets/images/berry_bliss_mojito_1794144215709.jpg',
    },

    // --- 7. DESSERTS ---
    {
      id: 'm22',
      name: 'Molten Chocolate Lava Cake',
      category: 'Desserts' as any,
      description: 'Warm dark Belgian chocolate cake with an oozing molten center, fresh raspberries and vanilla bean gelato.',
      price: 1150,
      isAvailable: true,
      dietaryTags: ["Chef's Special", 'Vegetarian', 'Popular'],
      image: '/src/assets/images/chocolate_lava_cake_1794144216052.jpg',
    },
    {
      id: 'm23',
      name: 'Caramelized Apple Tart',
      category: 'Desserts' as any,
      description: 'Flaky butter pastry layered with cinnamon-spiced caramelized apples, toasted almonds and salted caramel.',
      price: 980,
      isAvailable: true,
      dietaryTags: ['Vegetarian'],
      image: '/src/assets/images/chocolate_lava_cake_1794144216052.jpg',
    },
  ],
  reservations: [
    {
      id: 'res-seed-1',
      customerName: 'Asloof Haqqani',
      contactPhone: '0766737844',
      contactEmail: 'haqqani.mza@gmail.com',
      reservationDate: '2026-11-07',
      reservationTime: '19:00',
      guestCount: 4,
      specialRequests: 'Cozy table requested via MiniKitchen AI Assistant.',
      status: 'Pending',
      source: 'AI Chatbot',
      createdAt: '2026-11-05T14:20:00Z',
    },
    {
      id: 'res-seed-2',
      customerName: 'Fathima Rizna',
      contactPhone: '0771234567',
      contactEmail: 'fathima.r@example.com',
      reservationDate: '2026-11-07',
      reservationTime: '20:00',
      guestCount: 3,
      specialRequests: 'Birthday dinner celebration.',
      status: 'Confirmed',
      source: 'Website Direct',
      createdAt: '2026-11-05T16:10:00Z',
    },
    {
      id: 'res-seed-3',
      customerName: 'Naveen Perera',
      contactPhone: '0719876543',
      contactEmail: 'naveen.p@example.com',
      reservationDate: '2026-11-08',
      reservationTime: '13:00',
      guestCount: 2,
      specialRequests: 'Window table requested.',
      status: 'Pending',
      source: 'AI Chatbot',
      createdAt: '2026-11-05T18:45:00Z',
    },
    {
      id: 'res-seed-4',
      customerName: 'Devinda Silva',
      contactPhone: '0789998877',
      contactEmail: 'devinda@example.com',
      reservationDate: '2026-11-06',
      reservationTime: '18:30',
      guestCount: 2,
      specialRequests: 'Cancelled by customer.',
      status: 'Cancelled',
      source: 'Website Direct',
      createdAt: '2026-11-04T12:00:00Z',
    },
  ],
};

// Database helper functions
function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = JSON.parse(JSON.stringify(INITIAL_DATA)) as DBStructure;
      for (const reservation of initial.reservations) {
        reservation.bookingReference = generateBookingReference(initial.reservations);
        reservation.updatedAt = reservation.createdAt;
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const db = JSON.parse(raw) as DBStructure;
    let migrated = false;
    for (const reservation of db.reservations) {
      if (!reservation.bookingReference) {
        reservation.bookingReference = generateBookingReference(db.reservations);
        migrated = true;
      }
      if (!reservation.updatedAt) {
        reservation.updatedAt = reservation.createdAt;
        migrated = true;
      }
    }
    if (migrated) writeDB(db);
    return db;
  } catch (err) {
    console.error('Error reading or migrating db.json:', err);
    throw err;
  }
}

function writeDB(data: DBStructure): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
    throw err;
  }
}

// Initialize DB if not present
readDB();

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Restaurant Info
app.get('/api/restaurant', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.restaurant);
});

app.put('/api/restaurant', (req: Request, res: Response) => {
  const db = readDB();
  const { name, tagline, address, phone, email, openingHours, policy } = req.body;
  
  db.restaurant = {
    name: name !== undefined ? String(name).trim() : db.restaurant.name,
    tagline: tagline !== undefined ? String(tagline).trim() : db.restaurant.tagline,
    address: address !== undefined ? String(address).trim() : db.restaurant.address,
    phone: phone !== undefined ? String(phone).trim() : db.restaurant.phone,
    email: email !== undefined ? String(email).trim() : db.restaurant.email,
    openingHours: openingHours || db.restaurant.openingHours,
    policy: policy !== undefined ? String(policy).trim() : db.restaurant.policy,
  };

  writeDB(db);
  res.json(db.restaurant);
});

// Menu Endpoints
app.get('/api/menu', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.menu);
});

app.post('/api/menu', (req: Request, res: Response) => {
  const { name, category, description, price, isAvailable, dietaryTags, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  const db = readDB();
  const newItem = {
    id: 'm-' + Date.now().toString(36),
    name: String(name).trim(),
    category: category || 'Mains',
    description: String(description || '').trim(),
    price: Number(price),
    isAvailable: isAvailable !== false,
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
    image: image ? String(image).trim() : undefined,
  };

  db.menu.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.menu.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const existing = db.menu[index];
  const { name, category, description, price, isAvailable, dietaryTags, image } = req.body;

  db.menu[index] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    category: category !== undefined ? category : existing.category,
    description: description !== undefined ? String(description).trim() : existing.description,
    price: price !== undefined ? Number(price) : existing.price,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable,
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : existing.dietaryTags,
    image: image !== undefined ? (image ? String(image).trim() : undefined) : existing.image,
  };

  writeDB(db);
  res.json(db.menu[index]);
});

app.patch('/api/menu/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const item = db.menu.find((m) => m.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  item.isAvailable = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !item.isAvailable;
  writeDB(db);
  res.json(item);
});

app.delete('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.menu = db.menu.filter((m) => m.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// Reservation Endpoints
app.get('/api/reservations', (_req: Request, res: Response) => {
  const db = readDB();
  // Return sorted newest first
  const sorted = [...db.reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.post('/api/reservations', (req: Request, res: Response) => {
  const {
    customerName,
    contactPhone,
    contactEmail,
    reservationDate,
    reservationTime,
    guestCount,
    specialRequests,
    source,
  } = req.body;

  const parsedDate = new Date(`${reservationDate}T00:00:00.000Z`);
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const todayDate = now.toISOString().slice(0, 10);
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(String(reservationDate))
    && Number.isFinite(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === reservationDate;
  if (
    typeof customerName !== 'string' || customerName.trim().length < 2 ||
    !reservationDate || !reservationTime ||
    !Number.isInteger(Number(guestCount)) || Number(guestCount) < 1 || Number(guestCount) > 30 ||
    normalizeContact(contactPhone).length < 7 ||
    !isValidDate ||
    String(reservationDate) < todayDate
  ) {
    return res.status(400).json({
      error: 'Please provide valid reservation details, including a future date, contact number, and party size.',
    });
  }

  const db = readDB();
  const createdAt = new Date().toISOString();
  const newReservation = {
    id: 'res-' + Date.now().toString(36),
    bookingReference: generateBookingReference(db.reservations),
    customerName: String(customerName).trim(),
    contactPhone: String(contactPhone || '').trim(),
    contactEmail: String(contactEmail || '').trim(),
    reservationDate: String(reservationDate).trim(),
    reservationTime: String(reservationTime).trim(),
    guestCount: Math.max(1, Number(guestCount) || 1),
    specialRequests: specialRequests ? String(specialRequests).trim() : '',
    status: 'Pending' as const, // Always Pending upon initial submission!
    source: (source === 'AI Chatbot' ? 'AI Chatbot' : 'Website Direct') as 'Website Direct' | 'AI Chatbot',
    createdAt,
    updatedAt: createdAt,
  };

  db.reservations.unshift(newReservation);
  writeDB(db);
  res.status(201).json(newReservation);
});

app.post('/api/reservations/check', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const now = Date.now();
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const attempt = bookingLookupAttempts.get(clientIp);
  if (!attempt || attempt.resetAt <= now) {
    bookingLookupAttempts.set(clientIp, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    attempt.count += 1;
    if (attempt.count > 8) {
      res.setHeader('Retry-After', String(Math.ceil((attempt.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many booking lookups. Please try again later.' });
    }
  }

  const bookingReference = typeof req.body?.bookingReference === 'string'
    ? req.body.bookingReference.trim().toUpperCase()
    : '';
  const rawContact = typeof req.body?.contact === 'string' ? req.body.contact.trim() : '';
  const contact = normalizeContact(rawContact);
  const emailContact = rawContact.toLowerCase();
  const genericError = 'No matching reservation was found. Please check your booking reference and contact number.';
  if (!/^MK-\d{4}-\d{6}$/.test(bookingReference) || !isValidLookupContact(rawContact)) {
    return res.status(404).json({ error: genericError });
  }

  const reservation = readDB().reservations.find((item) => {
    const phoneMatches = Boolean(contact) && normalizeContact(item.contactPhone) === contact;
    const emailMatches = Boolean(emailContact) && item.contactEmail?.toLowerCase() === emailContact;
    return item.bookingReference === bookingReference && (phoneMatches || emailMatches);
  });
  if (!reservation) return res.status(404).json({ error: genericError });

  return res.json({
    bookingReference: reservation.bookingReference,
    customerName: reservation.customerName,
    reservationDate: reservation.reservationDate,
    reservationTime: reservation.reservationTime,
    guestCount: reservation.guestCount,
    status: reservation.status,
  });
});

app.patch('/api/reservations/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Seated'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid reservation status.' });
  }

  const db = readDB();
  const reservation = db.reservations.find((r) => r.id === id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  reservation.status = status;
  reservation.updatedAt = new Date().toISOString();

  writeDB(db);
  res.json(reservation);
});

app.delete('/api/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.reservations = db.reservations.filter((r) => r.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// Contact Form API
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  // Validate fields
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter a valid full name (at least 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ error: 'Please select an inquiry subject.' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: 'Your message must be at least 10 characters long.' });
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({ error: 'Message cannot exceed 2000 characters.' });
  }

  const db = readDB();
  if (!db.messages) db.messages = [];

  const newContactMessage = {
    id: 'msg-' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'Unread',
  };

  db.messages.unshift(newContactMessage);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: "Thank you for contacting MiniKitchen! We've received your message and will get back to you soon.",
    id: newContactMessage.id,
  });
});

app.get('/api/contact', (_req: Request, res: Response) => {
  const db = readDB();
  res.json(db.messages || []);
});

// Admin Auth
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin login is not configured.' });
  }
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'minikitchen2026';
  const supplied = Buffer.from(String(password || ''));
  const expected = Buffer.from(expectedPassword);
  if (
    username === expectedUsername &&
    supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected)
  ) {
    return res.json({
      success: true,
      token: createAdminToken(expectedUsername),
      admin: {
        username: expectedUsername,
        name: 'Executive Chef & Maitre d\'',
        role: 'Administrator',
      },
    });
  }
  return res.status(401).json({ error: 'Invalid credentials.' });
});

// -------------------------------------------------------------
// ASSIGNMENT SPECIFIC ADMIN API WORKFLOW (Section 7)
// -------------------------------------------------------------

// GET /api/admin/dashboard: Retrieve dashboard statistics
app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
  const db = readDB();
  const totalReservations = db.reservations.length;
  const pendingReservations = db.reservations.filter((r) => r.status === 'Pending').length;
  const confirmedReservations = db.reservations.filter((r) => r.status === 'Confirmed').length;
  const rejectedReservations = db.reservations.filter((r) => r.status === 'Rejected' || r.status === 'Cancelled').length;
  const totalMenuItems = db.menu.length;
  const availableMenuItems = db.menu.filter((m) => m.isAvailable).length;

  const recentReservations = [...db.reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  res.json({
    totalReservations,
    pendingReservations,
    confirmedReservations,
    rejectedReservations,
    totalMenuItems,
    availableMenuItems,
    recentReservations,
  });
});

// GET /api/admin/reservations: Retrieve reservations
app.get('/api/admin/reservations', (_req: Request, res: Response) => {
  const db = readDB();
  const sorted = [...db.reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

// PATCH /api/admin/reservations/:id: Update reservation status
app.patch('/api/admin/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Seated'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid reservation status.' });
  }

  const db = readDB();
  const reservation = db.reservations.find((r) => r.id === id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found.' });
  reservation.status = status;
  reservation.updatedAt = new Date().toISOString();

  writeDB(db);
  res.json(reservation);
});

// DELETE /api/admin/reservations/:id: Delete reservation
app.delete('/api/admin/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.reservations = db.reservations.filter((r) => r.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// POST /api/admin/menu: Add menu item
app.post('/api/admin/menu', (req: Request, res: Response) => {
  const { name, category, description, price, isAvailable, dietaryTags, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  const db = readDB();
  const newItem = {
    id: 'm-' + Date.now().toString(36),
    name: String(name).trim(),
    category: category || 'Mains',
    description: String(description || '').trim(),
    price: Number(price),
    isAvailable: isAvailable !== false,
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
    image: image ? String(image).trim() : undefined,
  };

  db.menu.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

// PUT /api/admin/menu/:id: Edit menu item
app.put('/api/admin/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.menu.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const existing = db.menu[index];
  const { name, category, description, price, isAvailable, dietaryTags, image } = req.body;

  db.menu[index] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    category: category !== undefined ? category : existing.category,
    description: description !== undefined ? String(description).trim() : existing.description,
    price: price !== undefined ? Number(price) : existing.price,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : existing.isAvailable,
    dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : existing.dietaryTags,
    image: image !== undefined ? (image ? String(image).trim() : undefined) : existing.image,
  };

  writeDB(db);
  res.json(db.menu[index]);
});

// PATCH /api/admin/menu/:id/availability: Change availability
app.patch('/api/admin/menu/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  const item = db.menu.find((m) => m.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  item.isAvailable = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : !item.isAvailable;
  writeDB(db);
  res.json(item);
});

// DELETE /api/admin/menu/:id: Delete menu item
app.delete('/api/admin/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDB();
  db.menu = db.menu.filter((m) => m.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// Reset Demo Data
app.post('/api/seed/reset', (_req: Request, res: Response) => {
  writeDB(INITIAL_DATA);
  res.json({ success: true, message: 'Database reset to default seed data.' });
});

// -------------------------------------------------------------
// AI CHATBOT + RESERVATION AUTOMATION (Gemini API)
// -------------------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const userMessage: string = (
      body.message ||
      (Array.isArray(body.messages) && body.messages[body.messages.length - 1]?.text) ||
      ''
    ).trim();

    // Normalize incoming multi-turn history from any format
    const rawHistory = body.history || body.conversationHistory || body.messages || [];
    const normalizedHistory: Array<{ sender: string; text: string }> = [];
    if (Array.isArray(rawHistory)) {
      for (const item of rawHistory) {
        if (!item) continue;
        const sender = item.sender || (item.role === 'model' ? 'assistant' : item.role) || 'user';
        const text = item.text || (item.parts && item.parts[0]?.text) || '';
        if (text && typeof text === 'string') {
          normalizedHistory.push({ sender, text });
        }
      }
    }

    const db = readDB();
    const currentMenu = db.menu;
    const restaurant = db.restaurant;

    // Check if Gemini API Key is configured and valid
    const apiKey = process.env.GEMINI_API_KEY;
    const isRealKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.startsWith('MY_'));

    if (isRealKey && apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Format current menu for prompt context
        const menuSummary = currentMenu
          .map(
            (m) =>
              `- ${m.name} (${m.category}) - Rs. ${m.price} [${m.isAvailable ? 'AVAILABLE' : 'SOLD OUT / UNAVAILABLE'}]: ${m.description} (${m.dietaryTags.join(', ')})`
          )
          .join('\n');

        const systemInstruction = `You are the charming, attentive, and professional AI Concierge & Host for MiniKitchen, an artisanal restaurant in Colombo, Sri Lanka.
Restaurant Information:
- Name: ${restaurant.name}
- Tagline: ${restaurant.tagline}
- Address: ${restaurant.address}
- Phone: ${restaurant.phone}
- Email: ${restaurant.email}
- Opening Hours: ${restaurant.openingHours.weekday}
- Policy: ${restaurant.policy}

Live Food & Drink Menu:
${menuSummary}

CRITICAL RESERVATION RULE:
1. When a guest wants to book or reserve a table, collect all 5 details:
   (a) Customer full name
   (b) Contact phone or email
   (c) Date of reservation (YYYY-MM-DD or spoken date)
   (d) Preferred dining time
   (e) Number of guests
2. You must NEVER automatically confirm reservations yourself!
3. When and ONLY when all 5 details are provided, call the 'bookReservation' tool. The reservation will be saved as 'Pending' for admin confirmation.
`;

        const bookReservationTool = {
          name: 'bookReservation',
          description: 'Register a customer table reservation once all 5 details (customer name, contact phone or email, date, time, and guest count) are gathered. The status will strictly be Pending.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              customerName: { type: Type.STRING, description: 'Customer full name' },
              contactInfo: { type: Type.STRING, description: 'Customer contact phone number or email' },
              reservationDate: { type: Type.STRING, description: 'Date of reservation in YYYY-MM-DD format.' },
              reservationTime: { type: Type.STRING, description: 'Time of reservation, e.g. 8:00 PM or 20:00' },
              guestCount: { type: Type.INTEGER, description: 'Number of dining guests' },
              specialRequests: { type: Type.STRING, description: 'Any dietary requests or notes' },
            },
            required: ['customerName', 'contactInfo', 'reservationDate', 'reservationTime', 'guestCount'],
          },
        };

        const chatContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const item of normalizedHistory.slice(-8)) {
          chatContents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }

        if (
          chatContents.length === 0 ||
          chatContents[chatContents.length - 1].parts[0]?.text !== userMessage
        ) {
          chatContents.push({
            role: 'user',
            parts: [{ text: userMessage }],
          });
        }

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 8s')), 8000)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: chatContents,
            config: {
              systemInstruction,
              tools: [{ functionDeclarations: [bookReservationTool] }],
            },
          }),
          timeoutPromise,
        ]);

        let newReservationCreated: DBStructure['reservations'][0] | null = null;
        let finalReply = response.text || '';

        const candidates = response.candidates;
        const functionCalls = candidates?.[0]?.content?.parts?.filter((p) => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
          for (const part of functionCalls) {
            if (part.functionCall?.name === 'bookReservation') {
              const args = part.functionCall.args as {
                customerName: string;
                contactInfo: string;
                reservationDate: string;
                reservationTime: string;
                guestCount: number;
                specialRequests?: string;
              };

              const latestDB = readDB();
              const createdAt = new Date().toISOString();
              const createdRes: DBStructure['reservations'][0] = {
                id: 'res-ai-' + Date.now().toString(36),
                bookingReference: generateBookingReference(latestDB.reservations),
                customerName: args.customerName || 'Guest',
                contactPhone: args.contactInfo?.includes('@') ? '' : args.contactInfo || '',
                contactEmail: args.contactInfo?.includes('@') ? args.contactInfo : '',
                reservationDate: args.reservationDate || new Date().toISOString().split('T')[0],
                reservationTime: args.reservationTime || '8:00 PM',
                guestCount: Math.max(1, Number(args.guestCount) || 2),
                specialRequests: args.specialRequests ? `${args.specialRequests} (via MiniKitchen AI)` : 'Booked via MiniKitchen AI Chatbot',
                status: 'Pending', // MANDATORY Pending status!
                source: 'AI Chatbot',
                createdAt,
                updatedAt: createdAt,
              };

              latestDB.reservations.unshift(createdRes);
              writeDB(latestDB);
              newReservationCreated = createdRes;

              finalReply = `Wonderful! I have submitted your table reservation for **${createdRes.guestCount} ${createdRes.guestCount === 1 ? 'guest' : 'guests'}** on **${createdRes.reservationDate}** at **${createdRes.reservationTime}** under **${createdRes.customerName}** (${args.contactInfo || restaurant.phone}).\n\nYour booking reference is **${createdRes.bookingReference}**. Your reservation is **Pending** while our team reviews it.`;
            }
          }
        }

        if (!newReservationCreated) {
          const parsed = handleChatFallback(userMessage, normalizedHistory, readDB());
          if (parsed.reservation) {
            newReservationCreated = parsed.reservation;
            finalReply = parsed.reply;
          }
        }

        return res.json({
          reply: finalReply || 'How may I assist your dining experience at MiniKitchen today?',
          reservation: newReservationCreated,
        });
      } catch (err) {
        console.error('Gemini API call bypassed or timed out, executing intelligent NLP fallback:', err);
      }
    }

    // -------------------------------------------------------------
    // INTELLIGENT RULE-BASED FALLBACK (100% Reliable Parsing)
    // -------------------------------------------------------------
    const fallbackResult = handleChatFallback(userMessage, normalizedHistory, db);
    return res.json(fallbackResult);
  } catch (chatError) {
    console.error('Error handling /api/chat:', chatError);
    return res.status(200).json({
      reply: 'Hello from MiniKitchen! I can assist with reservations or our seasonal menu. What date and time would you prefer?',
      reservation: null,
    });
  }
});

// Helper for fallback chat when API key is missing or offline
function handleChatFallback(
  text: string,
  history: Array<{ sender: string; text: string }>,
  db: DBStructure
): { reply: string; reservation: DBStructure['reservations'][0] | null } {
  const userTurns = (history || [])
    .filter((h) => h.sender === 'user')
    .map((h) => h.text);
  const allUserTexts = [...userTurns, text];
  let combined = allUserTexts.join(' | ');
  const lowerText = text.toLowerCase().trim();

  // 1. General Questions & FAQ
  if (lowerText.includes('hour') || lowerText.includes('open') || lowerText.includes('close')) {
    return {
      reply: `MiniKitchen Opening Hours:\n• Mon – Sun: 11:00 AM – 10:00 PM\n\nWould you like me to reserve a table for you?`,
      reservation: null,
    };
  }

  if (lowerText.includes('where') || lowerText.includes('address') || lowerText.includes('location')) {
    return {
      reply: `We are located in Colombo, Sri Lanka. You can reach our front desk at ${db.restaurant.phone} or email ${db.restaurant.email}. Would you like to reserve a table?`,
      reservation: null,
    };
  }

  if (lowerText.includes('menu') || lowerText.includes('recommend') || lowerText.includes('special')) {
    const available = db.menu.filter((m) => m.isAvailable).slice(0, 4);
    const names = available.map((m) => `• ${m.name} (Rs. ${m.price}) – ${m.description}`).join('\n');
    return {
      reply: `Here are some of our guest favorites today:\n${names}\n\nAll dishes are freshly prepared at MiniKitchen. Would you like to book a table to try them?`,
      reservation: null,
    };
  }

  // 2. High-Precision Entity Extraction
  let extractedName = '';
  let extractedContact = '';
  let extractedDate = '';
  let extractedTime = '';
  let extractedGuests = 0;

  // A. Contact: Email or Phone Number (supports Sri Lankan 07XXXXXXXX, +94, or international)
  const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    extractedContact = emailMatch[0].trim();
    combined = combined.replace(emailMatch[0], ' ');
  }

  const phoneMatch = combined.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\b0\d{9}\b/);
  if (!extractedContact && phoneMatch) {
    extractedContact = phoneMatch[0].trim();
    combined = combined.replace(phoneMatch[0], ' ');
  }

  // B. Date: Extract BEFORE time so numbers like 2026.11.23 are never mistaken for time!
  // YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = combined.match(/\b(202\d)[.\-\/](0?[1-9]|1[0-2])[.\-\/](0?[1-9]|[12]\d|3[01])\b/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    extractedDate = `${y}-${m}-${d}`;
    combined = combined.replace(ymdMatch[0], ' ');
  } else {
    // DD.MM.YYYY
    const dmyMatch = combined.match(/\b(0?[1-9]|[12]\d|3[01])[.\-\/](0?[1-9]|1[0-2])[.\-\/](202\d)\b/);
    if (dmyMatch) {
      extractedDate = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
      combined = combined.replace(dmyMatch[0], ' ');
    } else if (/\btomorrow\b/i.test(combined)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      extractedDate = d.toISOString().split('T')[0];
      combined = combined.replace(/\btomorrow\b/i, ' ');
    } else if (/\b(today|tonight)\b/i.test(combined)) {
      extractedDate = new Date().toISOString().split('T')[0];
      combined = combined.replace(/\b(today|tonight)\b/i, ' ');
    } else {
      const monthMatch = combined.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(202\d))?\b/i);
      if (monthMatch) {
        const months: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
        const m = String(months[monthMatch[1].toLowerCase().slice(0, 3)]).padStart(2, '0');
        const d = monthMatch[2].padStart(2, '0');
        const y = monthMatch[3] || '2026';
        extractedDate = `${y}-${m}-${d}`;
        combined = combined.replace(monthMatch[0], ' ');
      }
    }
  }

  // C. Time: e.g. 8.00pm, 8.00 pm, 8:00pm, 8:00 pm, 8pm, 8 pm, 20:00, 20.00
  const timeMatch = combined.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b|\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/i);
  if (timeMatch) {
    if (timeMatch[3]) {
      const h = timeMatch[1];
      const m = timeMatch[2] || '00';
      const ampm = timeMatch[3].toUpperCase();
      extractedTime = `${h}:${m} ${ampm}`;
    } else if (timeMatch[4]) {
      const h = parseInt(timeMatch[4], 10);
      const m = timeMatch[5];
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      extractedTime = `${h12}:${m} ${ampm}`;
    }
    combined = combined.replace(timeMatch[0], ' ');
  }

  // D. Guests: e.g. "for 3", "3 people", "party of 3", "3 guests", "table for 3"
  const guestMatch = combined.match(/(?:for|party of|table for)\s*(\d{1,2})|\b(\d{1,2})\s*(?:people|guests|persons|pax|guest)\b/i);
  if (guestMatch) {
    extractedGuests = parseInt(guestMatch[1] || guestMatch[2], 10);
  }

  // E. Explicit Name: "name Asloof Haqqani", "name: Asloof Haqqani", "my name is Asloof Haqqani", "under Asloof Haqqani"
  const explicitName = combined.match(/(?:(?:my\s+)?name\s*(?:is|:)?|under|for|i am)\s+([A-Za-z]+(?:\s+[A-Za-z]+){1,3})/i);
  if (explicitName && !/(?:table|booking|reservation|people|guest|phone|contact)/i.test(explicitName[1])) {
    extractedName = explicitName[1].trim();
  }

  // F. Token/Comma Fallback (handles comma-separated inputs: "Asloof haqqani, 0766737844, 2026.11.23, 8.00pm, 3")
  for (const t of allUserTexts) {
    const parts = t.split(/[,;\n|]+/).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      // If guests still 0, check if part is a single number 1-30
      if (!extractedGuests && /^\d{1,2}$/.test(part)) {
        const n = parseInt(part, 10);
        if (n >= 1 && n <= 30) extractedGuests = n;
      }
      // If name still empty, check if part is 2-4 alphabetic words
      if (!extractedName && /^[A-Za-z]+(?:\s+[A-Za-z]+){1,3}$/.test(part)) {
        if (!/^(table|book|reserve|reservation|guest|people|today|tomorrow|friday|saturday|sunday|name)$/i.test(part)) {
          extractedName = part;
        }
      }
    }
  }

  // Format name with proper capitalization
  if (extractedName) {
    extractedName = extractedName
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // Determine if user has initiated a reservation request
  const hasReservationIntent =
    lowerText.includes('book') ||
    lowerText.includes('reserve') ||
    lowerText.includes('table') ||
    lowerText.includes('reservation') ||
    lowerText.includes('party') ||
    extractedGuests > 0 ||
    Boolean(extractedDate) ||
    Boolean(extractedTime) ||
    Boolean(extractedName);

  if (hasReservationIntent) {
    const missing: string[] = [];
    if (!extractedName) missing.push('your full name');
    if (!extractedContact) missing.push('a contact phone number or email');
    if (!extractedDate) missing.push('the reservation date');
    if (!extractedTime) missing.push('your preferred dining time');
    if (!extractedGuests) missing.push('the number of guests');

    // ALL 5 DETAILS RECEIVED -> SAVE AS PENDING RESERVATION!
    if (missing.length === 0) {
      const createdAt = new Date().toISOString();
      const createdRes: DBStructure['reservations'][0] = {
        id: 'res-ai-' + Date.now().toString(36),
        bookingReference: generateBookingReference(db.reservations),
        customerName: extractedName,
        contactPhone: extractedContact.includes('@') ? '' : extractedContact,
        contactEmail: extractedContact.includes('@') ? extractedContact : '',
        reservationDate: extractedDate,
        reservationTime: extractedTime,
        guestCount: extractedGuests,
        specialRequests: 'Booked via MiniKitchen AI Chatbot',
        status: 'Pending', // MANDATORY Pending status!
        source: 'AI Chatbot',
        createdAt,
        updatedAt: createdAt,
      };

      db.reservations.unshift(createdRes);
      writeDB(db);

      return {
        reply: `Excellent! I have registered your reservation for **${extractedGuests} ${extractedGuests === 1 ? 'guest' : 'guests'}** on **${extractedDate}** at **${extractedTime}** under **${extractedName}** (${extractedContact}).\n\nYour booking reference is **${createdRes.bookingReference}**. Your reservation is **Pending** while our team reviews it.`,
        reservation: createdRes,
      };
    }

    // Acknowledge what we have gathered so far
    const gathered: string[] = [];
    if (extractedName) gathered.push(`Name: ${extractedName}`);
    if (extractedContact) gathered.push(`Contact: ${extractedContact}`);
    if (extractedDate) gathered.push(`Date: ${extractedDate}`);
    if (extractedTime) gathered.push(`Time: ${extractedTime}`);
    if (extractedGuests) gathered.push(`Guests: ${extractedGuests}`);

    const contextPrefix = gathered.length > 0
      ? `I've noted: ${gathered.join(', ')}.\n\n`
      : 'I would be delighted to arrange a table for you at MiniKitchen!\n\n';

    return {
      reply: `${contextPrefix}To complete your reservation request, could you please provide: ${missing.join(', ')}?`,
      reservation: null,
    };
  }

  // Friendly default prompt
  return {
    reply: `Hello and welcome to MiniKitchen! I can answer questions about our menu, opening hours, or assist you in reserving a table. How can I help you today?`,
    reservation: null,
  };
}

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MiniKitchen Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
