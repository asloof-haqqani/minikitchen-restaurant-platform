# MiniKitchen

MiniKitchen is a restaurant website and admin demo with a menu, direct reservations, reservation management, and a Gemini-powered chatbot that can create Pending reservations. The Express API runs locally and is exposed as a Netlify Function in production.

## Technology

- React, TypeScript, Vite, and Tailwind CSS
- Express and TypeScript API
- Google Gemini through `@google/genai`
- JSON-file storage (`data/db.json` locally) and Netlify Blobs in production for shared, persistent menu and reservation data. MongoDB is not connected.

## Run locally

Prerequisite: Node.js.

```sh
npm install
```

Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to enable Gemini. The API uses `./data/db.json` by default. Then start the app:

```sh
npm run dev
```

The Express server serves both the Vite app and API at `http://localhost:3000`.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Netlify Function | Optional Gemini API key; keep private and never expose it with a `VITE_` prefix. |
| `ADMIN_USERNAME` | Netlify Function | Admin login name. Defaults to `admin` for local demo use. |
| `ADMIN_PASSWORD` | Netlify Function | Required for production admin login. Set a private value in Netlify environment variables; local demo defaults to `minikitchen2026`. |
| `ADMIN_TOKEN_SECRET` | Netlify Function | Stable HMAC signing secret for admin tokens. Set a private random value in Netlify environment variables. |
| `FRONTEND_URL` | Netlify Function | Exact frontend origin allowed by the API CORS policy; normally unnecessary for the same-site Netlify Function. |
| `DATA_DIR` | Server | Optional directory for local `db.json`; Netlify production data is stored in Netlify Blobs. |
| `VITE_API_URL` | Netlify build | Optional separate API origin. Leave blank to use the same-site Netlify Function. |

## Admin demo login

- Username: `admin`
- Password: `minikitchen2026`

Local demo login: `admin` / `minikitchen2026`. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a stable `ADMIN_TOKEN_SECRET` in Netlify's environment variables before using production admin login. Admin API requests require an expiring server-signed token. This remains a demo auth implementation, not a substitute for a production identity provider.

The production API is hosted by a Netlify Function at `/api/*`; no separate paid server is required. The Function loads and saves the shared database snapshot in Netlify Blobs, rather than relying on its temporary local filesystem. The admin dashboard refreshes reservations every 15 seconds while open and when the page regains focus.

## Reservation and chatbot workflow

1. A direct website reservation is submitted to `POST /api/reservations` and saved with `Pending` status.
2. The chatbot calls `POST /api/chat`. With a valid Gemini key, Gemini can answer restaurant/menu questions and gather reservation details; the server creates the reservation only after required details are available.
3. AI-created reservations are always saved as `Pending`. An admin can review and change the status from the dashboard.
4. The API reads and writes `db.json` locally. In Netlify, each invocation loads the latest snapshot from Netlify Blobs and saves successful changes back to the shared store. This is persistent JSON storage, not MongoDB; migrate to MongoDB before claiming the MongoDB requirement is satisfied.
5. A customer can check status on the Reserve page with their booking reference and the phone number or email used for the booking. Lookup returns only customer-facing fields, is rate-limited, and is not cached.

## Deploy

This repository deploys the frontend and API together on Netlify.

1. Import the GitHub repository into Netlify. The included `netlify.toml` builds the Vite frontend and publishes `dist`, and routes `/api/*` to the Netlify Function.
2. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a stable private `ADMIN_TOKEN_SECRET` in Netlify environment variables. Set `GEMINI_API_KEY` to enable real AI responses and chatbot bookings.
3. Trigger a deploy after changing environment variables. Netlify Blobs is used by the Function for shared persistent menu and reservation data.
4. Test reservations, login, reservation status changes, menu edits, availability, persistence across separate requests, and a chatbot booking end-to-end.

Do not commit `.env` files, API keys, or other credentials. `.env.example` contains variable names only.
