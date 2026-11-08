# MiniKitchen Project Documentation

## 1. Project overview

MiniKitchen is a restaurant website and reservation-management demo for the fictional MiniKitchen restaurant in Colombo, Sri Lanka. It includes:

- A responsive public website with restaurant information, opening hours, menu availability, and table reservations.
- An admin dashboard for reviewing reservations, changing reservation status, and maintaining menu items.
- A restaurant chatbot that answers menu and restaurant questions and can collect reservation details.

**Live website:** <https://minikitchen.netlify.app>  
**Source repository:** <https://github.com/asloof-haqqani/minikitchen-restaurant-platform>  
**Admin page:** <https://minikitchen.netlify.app/admin/login>

## 2. Technology

- React, TypeScript, Vite, and Tailwind CSS for the web application.
- Express and TypeScript for the API.
- Google Gemini through `@google/genai` for AI chat when an API key is configured.
- Netlify Functions to host the production API.
- Netlify Blobs for shared persistent production data.
- JSON file storage for local development.

## 3. Installation and local development

### Requirements

- Node.js (use a current supported LTS release).
- npm.

### Setup

1. Clone the repository and enter its folder:

   ```sh
   git clone https://github.com/asloof-haqqani/minikitchen-restaurant-platform.git
   cd minikitchen-restaurant-platform
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env`. Set the desired local values; see the environment-variable table below.
4. Start the application:

   ```sh
   npm run dev
   ```

5. Open <http://localhost:3000>.

The Express server serves the website and API together during local development. The first server start creates `data/db.json` from the demo seed data if the file does not exist.

### Quality checks

```sh
npm run lint
npm test
npm run build
```

`npm run lint` runs the TypeScript compiler without emitting files.

## 4. Environment variables

Copy `.env.example` to `.env` for local use. In Netlify, set production variables under **Project configuration → Environment variables**. Never commit `.env` or put server secrets in a variable prefixed with `VITE_`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional | Server-side Google Gemini API key. Enables real AI responses and AI-assisted reservation collection. If omitted or unavailable, the chatbot uses its built-in rule-based fallback. |
| `ADMIN_USERNAME` | Optional locally; recommended in production | Admin login name. Defaults to `admin`. |
| `ADMIN_PASSWORD` | Required for production admin login | Admin password. The local demo fallback is `minikitchen2026`; set a private production value instead. |
| `ADMIN_TOKEN_SECRET` | Required for production admin login | Stable, private HMAC signing secret for admin sessions. Keep the same value between deploys and function instances. |
| `DATA_DIR` | Optional | Local path for `db.json`. Defaults to the repository's `data` directory. Netlify production data uses Netlify Blobs instead. |
| `VITE_API_URL` | Optional | API origin embedded at frontend build time when hosting the API separately. Leave blank for the same-site Netlify Function setup. |
| `FRONTEND_URL` | Only for a separate API origin | Comma-separated allowed frontend origins for the API CORS policy. Not needed when the frontend and API are served from the same Netlify site. |

### Admin access

For local development only, the default demo credentials are:

- Username: `admin`
- Password: `minikitchen2026`

Production credentials are configured in Netlify environment variables and should be shared only with assessment reviewers through the submission channel. The API issues signed, expiring admin tokens. This is a demonstration authentication flow, not a production identity-management system.

## 5. Data setup and persistence

### Local development

- The API stores data in `data/db.json` by default.
- If the file is absent, the server creates it using the included sample restaurant, menu, and reservation data.
- The entire `data/` directory is ignored by Git so local customer data is not committed.
- To restore demo data, use the authenticated **Reset Demo Database** action in the admin dashboard. This replaces the current local dataset with the initial demo dataset.

### Netlify production

- The Netlify Function stores the database snapshot in the site-wide Netlify Blobs store named `minikitchen-data`, under the key `db.json`.
- Each API invocation loads the shared snapshot before processing the request. Successful data-changing requests save the updated snapshot back to Blobs.
- This avoids relying on the function's temporary local filesystem and makes menu and reservation changes available across function invocations.
- The production store is JSON-backed and is **not MongoDB**.

The database contains restaurant information, menu items, reservations, and contact messages. Reservations have a booking reference, contact details, date, time, party size, source, status, and timestamps.

## 6. AI chatbot configuration

1. Create an API key through Google AI Studio or another supported Gemini account.
2. Add it as `GEMINI_API_KEY` in Netlify's **Functions/runtime** environment scope. For local testing, add it to `.env`.
3. Redeploy after changing a Netlify environment variable.
4. Open the public site's chatbot and ask a restaurant or menu question to verify the integration.

The API supplies the chatbot with the current restaurant information and menu. For a booking request, the chatbot collects the guest's full name, a phone number or email, reservation date, preferred time, and number of guests. It creates a reservation only after the required details are available.

If Gemini is not configured or is temporarily unavailable, the API falls back to rule-based answers and reservation detail collection. AI-created and fallback-created reservations are always **Pending**; only an admin can change their status.

## 7. Deployment to Netlify

The repository is configured to deploy the frontend and API together.

### Netlify dashboard

1. Connect the GitHub repository `asloof-haqqani/minikitchen-restaurant-platform` to Netlify.
2. Use the repository's `netlify.toml` settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Function directory: `netlify/functions`
   - `/api/*` requests are routed to the API function; other routes use the SPA entry point.
3. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a stable private `ADMIN_TOKEN_SECRET` for the production context.
4. Configure `GEMINI_API_KEY` if real Gemini responses are required.
5. Trigger a production deploy after setting the environment variables.
6. Verify the homepage, menu, admin login, menu management, reservation submission, and chatbot booking flow.

### Netlify CLI

After authenticating with Netlify and linking the repository to the site:

```sh
npm install
npm run build
netlify deploy --prod
```

Set environment variables through the Netlify dashboard or the Netlify CLI before deploying. Keep all secrets private.

## 8. Key workflows

### Direct website reservation

1. A guest submits their name, contact details, date, time, and guest count through the reservation form.
2. The frontend sends the request to `POST /api/reservations`.
3. The API validates the request, assigns a booking reference, and saves it with **Pending** status.
4. An authenticated admin can review it in the dashboard and confirm, reject, or otherwise update its status.

### Chatbot reservation

1. A guest asks to reserve a table in chat.
2. The chatbot asks for any missing required details.
3. Once the details are complete, the API saves the booking with a booking reference and **Pending** status.
4. The admin reviews and updates the reservation. The chatbot does not confirm reservations.

### Admin and menu management

1. An admin signs in at `/admin/login`.
2. The dashboard lists reservations, including each booking reference. The list refreshes periodically while the dashboard is open and when the page regains focus.
3. The admin can update reservation status and add, edit, remove, or change the availability of menu items.
4. Menu changes are returned by the API to the public menu. Changes persist in the local JSON file during local development and in Netlify Blobs in production.

### Reservation status lookup

Guests can use their booking reference and the phone number or email associated with the booking on the reservation page to check customer-facing reservation status.

## 9. API overview

The production API is available under `https://minikitchen.netlify.app/api/`. Common routes include:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/menu` | Read the public menu. |
| `GET` | `/api/restaurant` | Read restaurant information. |
| `POST` | `/api/reservations` | Submit a direct reservation; initial status is Pending. |
| `POST` | `/api/chat` | Ask the chatbot a question or provide reservation details. |
| `POST` | `/api/admin/login` | Sign in and receive an admin token. |
| `GET` | `/api/reservations` | List reservations; requires an admin token. |
| `PATCH` | `/api/reservations/:id/status` | Update a reservation status; requires an admin token. |

Protected admin requests use the token in the `Authorization: Bearer <token>` header.

## 10. Notes and limitations

- Netlify Blobs is persistent key/value storage, but this project stores a whole JSON snapshot rather than using a relational database.
- The admin authentication is designed for an assessment/demo and should be replaced with a suitable identity provider for a real restaurant.
- Gemini availability and usage depend on the configured Google AI account and its current quota.
- Never commit API keys, passwords, signing secrets, or real customer data.
