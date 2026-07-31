# FunService

FunService is a full-stack home services marketplace built with React.js, Node.js, Express.js, and Supabase PostgreSQL.

Tagline: **All Services. One Click.**

## Features

- Responsive React frontend with modern white and blue service marketplace UI
- Service search, category filtering, booking modal, payment options, booking timeline, history, support chat, FAQ, and login/signup screens
- Express REST API with JWT auth, bcrypt password hashing, Supabase-backed models, services, bookings, payments, support messages, and admin routes
- Dummy Razorpay-style payment flow and optional WhatsApp agent webhook simulation

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Update the Supabase settings and `JWT_SECRET` in `backend/.env`. To send OTP and
support emails, also set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
`RESEND_SUPPORT_TO`.

3. Start the backend:

```bash
npm run dev:backend
```

4. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Admin panel local dev: run `npm run dev:admin --prefix frontend` and open `http://localhost:5174`.

## Deployment

Customer frontend runs on Vercel and builds only `frontend/dist`.

- Vercel build command: `npm run build --prefix frontend`
- Vercel output directory: `frontend/dist`
- Vercel environment:
  - `VITE_API_URL=https://YOUR_RENDER_SERVICE_URL/api`
  - `VITE_ADMIN_URL=https://YOUR_RENDER_SERVICE_URL/owner`

Backend and admin panel run together on Render. Render builds the admin panel into
`admin/dist`, then `backend/server.js` serves that admin app for non-API routes
and keeps the backend under `/api`.

- Render build command: `npm install --prefix frontend && npm install --prefix backend && npm run build:admin --prefix frontend`
- Render start command: `node backend/server.js`
- Render environment:
  - `NODE_ENV=production`
  - `VITE_PUBLIC_SITE_URL=https://YOUR_VERCEL_SITE_URL`
  - `CLIENT_URL=https://YOUR_VERCEL_SITE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`

## Backend API

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`, `/api/auth/request-otp`, `/api/auth/verify-otp`, `/api/auth/google`
- Services: `/api/services`
- Bookings: `/api/bookings`
- Payments: `/api/payment`
- Support: `/api/support`
- Admin: `/api/admin`

## Seed Services

After configuring Supabase:

```bash
npm run seed --prefix backend
```
## Database credentials

Keep database credentials in `backend/.env` only. Do not commit real usernames,
passwords, tokens, or API keys to GitHub.

```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-backend-only-service-role-key
```
