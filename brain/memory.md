# brain/memory.md — Central Project Summary

> Last updated: 2026-07-17

## What the project does

fixOindia is a home-services marketplace for India: customers discover services, book time slots, apply coupons, pay (dummy flow for now), and track bookings through a live status timeline. Owners/admins run operations from a separate admin panel (bookings, services, beauty artists, users, support, settings, WhatsApp agent, database manager).

## Key features

- **Customer app:** service catalog with categories/search, booking flow with coupons, booking status timeline, history, profile with location (Leaflet reverse-geocode), customer support tickets, Google + OTP + password auth, splash screen, version-mismatch banner.
- **Admin panel:** overview dashboard with charts, bookings management (assign professional, status updates, CSV export), service catalog CRUD, beauty artist studio, users directory (password reset), support inbox with email replies, payment/auth method toggles, coupon management.
- **WhatsApp agent (new):** booking confirmations + status/cancellation notifications to customers; incoming webhook with rule-based auto-replies (status lookup, services list, help) and optional Claude AI fallback; admin single-send and throttled broadcast.
- **Database manager (new, owner-only):** browse/search/edit/delete rows in any managed Supabase table, stats & health dashboard, CSV/JSON export, schema verification.

## Current state (2026-07-17)

- Backend modules for DB management (`/api/admin/database`) and WhatsApp agent (`/api/whatsapp`) implemented and syntax-verified.
- Admin UI tabs "WhatsApp Agent" and "Database" wired into `AdminDashboard.jsx` with new components `DatabaseManager.jsx` and `WhatsAppManager.jsx`.
- **Blocked on owner:** WhatsApp Cloud API keys, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, and optional `ANTHROPIC_API_KEY` need to be added to `backend/.env` (owner said "values baad me" — will add later).
- Frontend build not yet re-run after the new tabs — needs a `npm run dev`/build smoke test.

## Active work

- None in flight. Next likely tasks (see roadmap.md): fill WhatsApp env values and test end-to-end; real payment integration; light-theme redesign.

## History pointer

The pre-brain single-file knowledge base lives at repo root `brain.md` (last updated 2026-07-12). Its content has been migrated into this `brain/` directory; treat `brain/` as authoritative.
