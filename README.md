# TimelessTreasures - Full Stack on Vercel

This project is configured to deploy **frontend + backend API together on Vercel**.

- Frontend: React + Vite
- Backend API: Express serverless function (`/api`)
- Database: PostgreSQL (cloud, via `DATABASE_URL`)
- Auth: JWT + bcrypt
- Modules: Login, Signup, Repair, Exchange, Sell, Resell, Contact Us, Checkout Orders

## What is already implemented

- Full auth flow (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Data creation APIs for all requested modules:
  - `/api/repair`
  - `/api/exchange`
  - `/api/sell`
  - `/api/resell`
  - `/api/contact-us`
  - `/api/orders` (checkout with name, phone, address, payment option)
- Product "Buy Now" opens checkout page and stores order in DB
- Automatic schema creation on startup (tables are created if missing)

## CORS (simple explanation)

You were confused about CORS, so this setup keeps it simple:

- On Vercel, frontend and API run under the same project domain.
- Requests are made to same-origin `/api/...`.
- CORS is effectively not a blocker in this setup.
- API still uses permissive `cors({ origin: true })` to avoid local/dev issues.

## Required environment variables

Set these in **Vercel Project Settings -> Environment Variables**:

- `DATABASE_URL` = your PostgreSQL connection string
- `JWT_SECRET` = long random secret
- `NODE_ENV` = `production`
- `VITE_API_URL` = leave empty for same-domain API (recommended)

For local development, create `.env` from `.env.example`.

## Run locally (full stack)

1. Install dependencies:

```bash
npm install
npm --prefix server install
```

2. Create `.env` in root:

```env
VITE_API_URL=
JWT_SECRET=replace-with-a-long-random-string
DATABASE_URL=postgres://username:password@host:5432/database
```

3. Start frontend + backend:

```bash
npm run dev:full
```

4. Open frontend URL shown by Vite (usually `http://localhost:5173`).

5. API health:
- `http://localhost:3001/api/health`

## How to check database data

Use any PostgreSQL tool (recommended: Neon dashboard SQL editor, Supabase SQL editor, or pgAdmin).

Example SQL:

```sql
SELECT * FROM users ORDER BY id DESC LIMIT 20;
SELECT * FROM sell_listings ORDER BY id DESC LIMIT 20;
SELECT * FROM resell_listings ORDER BY id DESC LIMIT 20;
SELECT * FROM exchange_posts ORDER BY id DESC LIMIT 20;
SELECT * FROM repair_requests ORDER BY id DESC LIMIT 20;
SELECT * FROM contact_messages ORDER BY id DESC LIMIT 20;
SELECT * FROM orders ORDER BY id DESC LIMIT 20;
```

## Deploy to Vercel (final detailed steps)

1. Push latest code to GitHub.
2. In Vercel, import/select this repository.
3. Framework preset: `Vite`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
7. Click Deploy.
8. After deploy, test:
   - `https://your-domain.vercel.app/`
   - `https://your-domain.vercel.app/api/health`
   - Signup -> Login -> Create Sell/Resell/Exchange/Repair -> Contact Us -> Buy Now checkout.

## API endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/repair`
- `POST /api/exchange`
- `POST /api/sell`
- `POST /api/resell`
- `POST /api/contact-us`
- `POST /api/orders`
