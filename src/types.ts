export type MenuCategory = 'Burgers' | 'Pasta' | 'Chicken' | 'Wraps' | 'Sides' | 'Drinks' | 'Starters' | 'Mains' | 'Desserts' | 'Beverages';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  isAvailable: boolean;
  dietaryTags: string[];
  image?: string;
}

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Seated';
export type ReservationSource = 'Website Direct' | 'AI Chatbot';

export interface Reservation {
  id: string;
  bookingReference?: string;
  customerName: string;
  contactPhone: string;
  contactEmail: string;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:MM
  guestCount: number;
  specialRequests?: string;
  status: ReservationStatus;
  source: ReservationSource;
  createdAt: string;
  updatedAt?: string;
}

export interface RestaurantInfo {
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
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  reservationCreated?: Reservation;
  suggestedPrompts?: string[];
}
