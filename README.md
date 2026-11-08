# MiniKitchen

MiniKitchen is a restaurant website and admin demo with a menu, direct reservations, reservation management, and a Gemini-powered chatbot that can create Pending reservations.

## Technology

- React, TypeScript, Vite, and Tailwind CSS
- Express and TypeScript API
- Google Gemini through `@google/genai`
- Temporary JSON-file storage (`data/db.json` locally; a Render persistent disk when deployed). MongoDB is not yet connected.

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
| `GEMINI_API_KEY` | Render/server | Gemini API key; keep private and never expose it with a `VITE_` prefix. |
| `ADMIN_USERNAME` | Render/server | Admin login name. Defaults to `admin` for local demo use. |
| `ADMIN_PASSWORD` | Render/server | Admin login password. Defaults to `minikitchen2026` locally; set a strong private value in Render. |
| `ADMIN_TOKEN_SECRET` | Render/server | HMAC signing secret for admin tokens. Render generates this in the blueprint. |
| `FRONTEND_URL` | Render/server | Exact Netlify site origin allowed by the API CORS policy. |
| `DATA_DIR` | Render/server | Directory for `db.json`; Render blueprint mounts persistent storage at `/var/data`. |
| `VITE_API_URL` | Netlify build | Base URL of the deployed Express API, e.g. `https://minikitchen-api.onrender.com`. Leave blank for local development. |

## Admin demo login

- Username: `admin`
- Password: `minikitchen2026`

Local demo login: `admin` / `minikitchen2026`. Configure strong `ADMIN_USERNAME` and `ADMIN_PASSWORD` values in Render; admin API requests require an expiring server-signed token. This remains a demo auth implementation, not a substitute for a production identity provider.

## Reservation and chatbot workflow

1. A direct website reservation is submitted to `POST /api/reservations` and saved with `Pending` status.
2. The chatbot calls `POST /api/chat`. With a valid Gemini key, Gemini can answer restaurant/menu questions and gather reservation details; the server creates the reservation only after required details are available.
3. AI-created reservations are always saved as `Pending`. An admin can review and change the status from the dashboard.
4. The API reads and writes `db.json`. In deployment, the file is stored on the Render persistent disk so it survives service restarts and redeploys. This is temporary JSON persistence, not MongoDB; migrate to MongoDB before claiming the MongoDB requirement is satisfied.
5. A customer can check status on the Reserve page with their booking reference and the phone number or email used for the booking. Lookup returns only customer-facing fields, is rate-limited, and is not cached.

## Deploy

This repository includes `netlify.toml` for the frontend and `render.yaml` for the Express API.

### Backend on Render

1. Push the repository to GitHub and create a Render Blueprint from it, or create a Node web service using the settings in `render.yaml`.
2. The blueprint configures the API to listen on Render's `PORT`, builds the Vite static assets for Express's production setup, and mounts a 1 GB persistent disk at `/var/data`.
3. Set `GEMINI_API_KEY` to your private Gemini API key in Render's environment settings.
4. Set `FRONTEND_URL` to the exact public Netlify origin, for example `https://your-site.netlify.app`.
5. Deploy and note the API service URL.

The Render `starter` service and persistent disk are paid resources; check current Render pricing before creating them. Do not deploy the JSON-backed API on an ephemeral filesystem if reservation data must persist.

### Frontend on Netlify

1. Import the GitHub repository into Netlify. The included `netlify.toml` sets the build command to `npm run build` and publishes `dist`.
2. Add the environment variable `VITE_API_URL` with the Render API origin, e.g. `https://minikitchen-api.onrender.com` (no trailing slash).
3. Trigger a new deploy after adding or changing the variable. Vite embeds this value at build time.
4. Set Render's `FRONTEND_URL` to the final Netlify URL and redeploy/restart the API.
5. Test reservations, login, reservation status changes, menu edits, availability, persistence after restart, and a chatbot booking end-to-end.

Do not commit `.env` files, API keys, or other credentials. `.env.example` contains variable names only.
