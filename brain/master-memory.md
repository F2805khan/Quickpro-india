# brain/master-memory.md — Compressed Project Intelligence

> **READ THIS FILE FIRST.** It is the compressed brain of fixOindia.
> Deeper detail: `architecture.md`, `patterns.md`, `decisions.md`, `mistakes.md`, `feature-map.md`.
> Last updated: 2026-07-17

## What this project is

**fixOindia** (internal codename *FunService*) — full-stack home-services marketplace for India. Customers browse services (cleaning, repairs, beauty), book a slot, pay, and track status. Tagline: "All Services. One Click." Repo: `F2805khan/FixoINDIA` (branch `main`). App version 1.1.0 (`app.version.json`).

## Architecture in 10 lines

- `frontend/` — React 19 + Vite 7 SPA (customer app), deployed on **Vercel**. Talks to `/api` via `frontend/src/api/client.js`.
- `admin/` — separate Vite entry (built by `frontend/vite.admin.config.js`) that renders `frontend/src/pages/OwnerPanel.jsx` → `AdminDashboard.jsx`. Served by the backend for non-API routes in production.
- `backend/` — Node/Express **ESM** on **Render** (single service `fixoindia`). JWT auth (30d) + bcryptjs, Firebase admin (Google login), Resend (email/OTP), WhatsApp Cloud API.
- **Database:** Supabase PostgreSQL, accessed ONLY from backend via `SUPABASE_SERVICE_ROLE_KEY`. Models in `backend/models/` extend `SupabaseModel.js` — a Sequelize-like base class with app-space (camelCase) ↔ DB-space (snake_case) column mapping.
- Request flow: `routes/*Routes.js` → middleware (`protect`/`admin`/`owner`) → `controllers/*Controller.js` (wrapped in `asyncHandler`) → models → Supabase.

## API surface

`/api/auth`, `/api/services`, `/api/bookings`, `/api/coupons`, `/api/payment`, `/api/reviews`, `/api/support`, `/api/admin`, `/api/admin/database` (owner-only DB manager), `/api/whatsapp` (agent webhook + admin send/broadcast), `/api/images`, `/api/location`, `/api/events`. Health: `/api/health`.

## Domain models

`User`, `Service`, `Booking`, `Payment`, `Coupon`, `BeautyArtist`, `SupportMessage`, `AuthEvent`, `AuthMethodSetting`, `PaymentMethodSetting`. Booking IDs look like `#QF123456`. Booking statuses: Confirmed → Professional Assigned → On The Way → Service In Progress → Completed | Cancelled.

## Key decisions (full log in decisions.md)

1. MySQL/Sequelize → Supabase (~Jun 2026); `sequelizeMock.js` shim keeps `Op` symbols working.
2. One Render service serves API + admin panel; customer SPA on Vercel.
3. Service-role key is backend-only, never exposed to React.
4. Payments are a dummy Razorpay-style flow (real gateway not integrated).
5. "Excel" exports are actually CSV (opens in Excel) — no xlsx dependency.
6. Database manager (`/api/admin/database`) is **owner**-role only; sensitive columns (password/otp) redacted + write-protected.
7. WhatsApp sending fallback chain: Cloud API → custom webhook → manual `wa.me` link. Incoming auto-replies are rule-based first, optional Claude AI fallback (`ANTHROPIC_API_KEY`).

## Critical patterns (full detail in patterns.md)

- Controllers: `asyncHandler(async (req,res) => { ... res.status(400); throw new Error("msg"); })`.
- Models: extend `SupabaseModel`, override `tableName` + `columnMap` (app camelCase → DB snake_case).
- Routes: `router.use(protect, owner)` for whole-router guards; per-route for mixed access.
- Frontend API: add methods to the `api` object in `frontend/src/api/client.js`; JWT auto-attached from localStorage.
- Admin UI: new features = new sidebar tab in `AdminDashboard.jsx` + component in `frontend/src/components/`.
- Notifications after booking changes are fire-and-forget: `.catch(err => console.error(...))` — never block the response.

## Known issues / gotchas (full list in mistakes.md)

- `users`/`support_messages`/`beauty_artists` tables have inconsistent column casing; `User` model has multi-attempt fallback writes.
- `dns.setDefaultResultOrder("ipv4first")` in server.js is a Supabase connectivity workaround — do not remove.
- Mount `/api/admin/database` BEFORE `/api/admin` in server.js.
- PostgREST `.or()` expressions break on commas/parens — sanitize search input.
- `<a href>` downloads can't send JWT — use fetch → blob → programmatic download.

## Current state (2026-07-17)

- DB management + WhatsApp agent modules complete (backend + admin UI tabs). **WhatsApp/AI env values not yet filled in** — owner will add later; UI shows "Not configured" until then.
- Pending verification: run `npm run dev` in `frontend/` to confirm the two new admin tabs render.
- Design exploration: light-theme mockups (`funservice-light-*.png`) not yet implemented.

## Roadmap snapshot (full in roadmap.md)

Real payment gateway → light-theme redesign → beauty vertical completion → repo cleanup (MySQL leftovers, root clutter) → verified Resend sender domain.
