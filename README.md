# Broken Arrow

Broken Arrow is split into two apps:

- `ba-workcenter`: the React + Vite frontend that is deployed on Vercel( You can access the client from the given link: https://ba-workcenter.vercel.app)
- `ba-api`: the Express API that powers event types, availability, public booking pages, and bookings(You can access the API source from the given link: https://github.com/Tankenstein2005/ba-api)

This repository already contains both projects. The important deployment detail is that the Vercel frontend cannot call `localhost` on your computer. If you want the deployed app to use an API running on your machine, you must:

1. run `ba-api` locally
2. expose it through a public HTTPS tunnel
3. point the Vercel frontend at that tunnel URL
4. allow that frontend origin in the API CORS config through environment variables

## Project flow

The request flow in this repo works like this:

1. The Vercel frontend in `ba-workcenter` reads `VITE_API_URL`.
2. Every frontend request is sent to that URL for paths like `/health`, `/event-types`, `/bookings`, and `/public/:slug`.
3. The Express app in `ba-api` serves those routes under `/api`.
4. The API supports three storage behaviors:
   - `STORAGE_MODE=database`: always use MySQL
   - `STORAGE_MODE=demo`: always use in-memory demo data
   - `STORAGE_MODE=auto`: use MySQL when reachable, otherwise fall back to demo data

The backend health endpoint at `/api/health` reports which storage mode is active.

## What matters for the Vercel deployment

The deployed frontend only works properly when `VITE_API_URL` points to a publicly reachable API base URL.
- `http://localhost:4000/api`
- `http://127.0.0.1:4000/api`
- any private LAN address that the public internet cannot reach

## Local API setup

### 1. Install dependencies

Run these commands from the repo root:

```powershell
cd ba-api
npm install
```

If you also want to run the frontend locally for comparison:

```powershell
cd ba-workcenter
npm install
```

### 2. Create the API env file

Copy [ba-api/.env.example](ba-api\.env.example) to `ba-api/.env`.

Recommended starting point:

```env
PORT=4000
CLIENT_URL=http://localhost:443
CLIENT_URLS=http://localhost:5173,http://localhost:443,https://your-frontend.vercel.app
DATABASE_URL=
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=BrokenArrowDB
STORAGE_MODE=database
FORCE_DEMO_DATA=false
PROFILE_NAME=Broken Arrow Studio
PROFILE_TAGLINE=Design sessions, discovery calls, and project check-ins.
DEFAULT_TIMEZONE=Asia/Kolkata
```

Notes:

- `CLIENT_URLS` is important for CORS. Add your real Vercel frontend domain here.
- If you use an ngrok or preview domain for the frontend, add that too.
- `DB_NAME` should match the database created by the SQL schema. The bundled schema creates `BrokenArrowDB`.
- `FORCE_DEMO_DATA=true` overrides normal storage selection and forces demo mode.

### 3. Prepare MySQL

The API expects MySQL. The schema file is [ba-api/sql/schema.sql](ba-api\sql\schema.sql).

To initialize the schema:

```powershell
cd ba-api
npm run db:init
```

This creates:

- database `BrokenArrowDB`
- `event_types`
- `booking_questions`
- `availability_rules`
- `availability_overrides`
- `bookings`

Optional demo seed data is available in [ba-api/sql/seed.sql](ba-api\sql\seed.sql). That file is not run automatically by npm scripts, so apply it manually in MySQL if you want sample records in the real database.

### 4. Start the API locally

```powershell
cd ba-api
npm run dev
```

The API listens on:

```text
http://localhost:4000
```

Useful health check:

```text
http://localhost:4000/api/health
```

If `STORAGE_MODE=auto` and the database is unavailable, the API will still boot and fall back to in-memory demo data.

## Expose the local API to the internet

Because the frontend is deployed on Vercel, your local API needs a public URL.

This repository already includes `ngrok.exe` in [ngrok-v3-stable-windows-amd64/ngrok.exe](ngrok-v3-stable-windows-amd64\ngrok.exe), so ngrok is the easiest option on this machine.

### ngrok

Start the API first, then open a second terminal from the repo root and run:

```powershell
.\ngrok-v3-stable-windows-amd64\ngrok.exe http 4000
```

ngrok will give you a public HTTPS URL like:

```text
https://abc123.ngrok-free.app
```

Your API base URL for the frontend is then:

```text
https://abc123.ngrok-free.app/api
```

The frontend already sends the `ngrok-skip-browser-warning: true` header, so the existing client code is prepared for ngrok.

## Point the Vercel frontend at the local API

The frontend reads `VITE_API_URL` from its deployment environment.

Set this in the `ba-workcenter` Vercel project:

```env
VITE_API_URL=https://abc123.ngrok-free.app/api
```

Important:

- include `/api` at the end
- redeploy the frontend after changing the env var
- if you rotate tunnels, update the env var again

If you prefer to use the Vercel rewrite in [ba-workcenter/vercel.json](ba-workcenter\vercel.json), update that rewrite target as well. In practice, `VITE_API_URL` is the more direct and reliable switch because the frontend client uses it explicitly.

## CORS configuration for the deployed frontend

The API accepts requests only from allowed origins. That logic lives in [ba-api/src/app.js](ba-api\src\app.js).

To let the Vercel frontend call your locally hosted API, make sure `ba-api/.env` includes the actual deployed frontend origin in `CLIENT_URLS`.

Example:

```env
CLIENT_URLS=http://localhost:5173,http://localhost:443,https://ba-workcenter.vercel.app,https://your-project-name.vercel.app
```

If the frontend is on a preview deployment, add that preview domain too. The API supports wildcard-style entries such as:

```env
CLIENT_URLS=https://ba-workcenter.vercel.app,https://ba-workcenter-*.vercel.app,https://ba-workcenter-git-*.vercel.app
```

After changing `CLIENT_URLS`, restart the local API.

## Recommended end-to-end workflow

For the deployed Vercel app to use your machine-hosted backend:

1. Start MySQL.
2. Run `npm run db:init` in `ba-api` if the schema is not created yet.
3. Configure `ba-api/.env` with the correct MySQL credentials and frontend origins.
4. Start the API with `npm run dev`.
5. Start ngrok with `.\ngrok-v3-stable-windows-amd64\ngrok.exe http 4000`.
6. Copy the public HTTPS URL and append `/api`.
7. Set `VITE_API_URL` in the Vercel `ba-workcenter` project to that value.
8. Redeploy the frontend.
9. Open the deployed site and verify that dashboard data and public booking pages load successfully.

## Local frontend workflow

If you run the frontend locally, the project currently behaves differently from the deployed app:

- [ba-workcenter/src/api/client.js](ba-workcenter\src\api\client.js) defaults local development to `https://ba-api.vercel.app` unless `VITE_API_URL` is set
- [ba-workcenter/vite.config.js](ba-workcenter\vite.config.js) also proxies `/api` to `https://ba-api.vercel.app`

If you want the local frontend to hit your local API instead, create `ba-workcenter/.env` with:

```env
VITE_API_URL=http://localhost:4000/api
```

Then run:

```powershell
cd ba-workcenter
npm run dev
```

## Troubleshooting

### The deployed app cannot reach the API

Check:

- the tunnel is still running
- `VITE_API_URL` uses the current public HTTPS URL
- the URL includes `/api`
- the frontend was redeployed after the env var change

### The browser shows a CORS error

Check:

- the frontend origin is present in `CLIENT_URLS`
- the API was restarted after editing `.env`
- you are using the exact protocol and hostname of the deployed frontend

### The dashboard loads but only shows demo data

Call `/api/health` and inspect the JSON response.

If `activeMode` is `demo`, then one of these is true:

- `STORAGE_MODE=demo`
- `FORCE_DEMO_DATA=true`
- `STORAGE_MODE=auto` and MySQL is unreachable

### `npm run db:init` succeeds but the API still cannot query data

Check that:

- MySQL is still running
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` match the server you initialized
- `DB_NAME` is `BrokenArrowDB` unless you changed the schema script

## File map

- [README.md](README.md): setup and hosting guide
- [ba-api/.env.example](ba-api\.env.example): backend env template
- [ba-api/src/config/env.js](ba-api\src\config\env.js): backend env parsing
- [ba-api/src/app.js](ba-api\src\app.js): CORS and Express app wiring
- [ba-api/src/routes/index.js](ba-api\src\routes\index.js): API routes
- [ba-api/src/services/systemService.js](ba-api\src\services\systemService.js): health and storage reporting
- [ba-api/sql/schema.sql](ba-api\sql\schema.sql): MySQL schema
- [ba-workcenter/src/api/client.js](ba-workcenter\src\api\client.js): frontend API base URL logic
- [ba-workcenter/vercel.json](ba-workcenter\vercel.json): frontend rewrites

## Short version

If the question is simply "How do I make the Vercel app use my local API?", the answer is:

1. Run `ba-api` locally on port `4000`.
2. Expose port `4000` with ngrok.
3. Set Vercel `VITE_API_URL` to `https://your-ngrok-url/api`.
4. Add your Vercel frontend domain to `CLIENT_URLS` in `ba-api/.env`.
5. Restart the API and redeploy the frontend.
