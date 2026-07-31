# brain/architecture.md — Complete Architectural Understanding

> Last updated: 2026-07-17

## Topology

```
Customer (Vercel)          Backend + Admin (Render, single service "fixoindia")
┌──────────────────┐       ┌─────────────────────────────────────────┐
│ frontend/ (Vite +│ /api  │ backend/server.js (Express, ESM)        │
│ React 19 SPA)    ├──────►│  • /api/* → REST API                    │
└──────────────────┘       │  • non-API routes → serves admin/dist   │
                           └───────────────┬─────────────────────────┘
                                           │ SUPABASE_SERVICE_ROLE_KEY (server only)
                                    Supabase PostgreSQL
```

## Frontend (`frontend/`)

- React 19 + Vite 7, `react-router-dom` 7, lucide-react icons, react-hot-toast (via `utils/notifications.js`), Leaflet maps, Lottie animations, Firebase client SDK (Google auth).
- **API layer:** `src/api/client.js` — single `request()` helper prefixing `VITE_API_URL || "/api"`, auto-attaches JWT from localStorage (`funservice_token`), exports one big `api` object of methods. ALL backend calls go through this.
- **Session:** localStorage keys `funservice_token` / `funservice_user`; events `funservice:session-changed`, `funservice:profile-updated`.
- **Pages:** Home, Services, LoginSignup, BookingStatus, History, Profile, CustomerSupport, AdminAccessGate, AdminDashboard, OwnerPanel.
- **Key components:** BookingModal, BookingStatusDrawer, StatusTimeline, CouponApplyBox, NotificationCenter, VersionMismatchBanner, DatabaseManager (owner DB browser), WhatsAppManager (agent console).

## Admin panel (`admin/`)

- Thin Vite entry: `admin/src/main.jsx` imports `frontend/src/pages/OwnerPanel.jsx` and `frontend/src/index.css`. Built by `frontend/vite.admin.config.js` into `admin/dist`.
- In production the Express backend statically serves `admin/dist` for every non-`/api` route.
- `OwnerPanel` gates access (`AdminAccessGate`, roles `admin`/`owner`) then renders `AdminDashboard` — a sidebar-tab workspace (overview / bookings / services / beauty / users / support / whatsapp / database [owner-only] / settings).

## Backend (`backend/`)

ESM (`"type": "module"`). Entry `server.js`: forces `dns ipv4first` (Supabase workaround), loads `config/env.js`, CORS from `CLIENT_URL` (comma-separated allowlist), JSON body limit 1mb, mounts routes, serves admin dist in production, `notFound` + `errorHandler` middleware last, boots via `ensureAdminUser()` (owner bootstrap from `ADMIN_*` env).

### Layers

- `config/` — `env.js` (dotenv), `supabase.js` (service-role client, throws if keys missing).
- `middleware/` — `authMiddleware.js` (`protect` = JWT → `req.user`; `owner`, `admin`, `optionalProtect`, `isPrivileged`), `asyncHandler.js`, `errorMiddleware.js`, `versionMiddleware.js`.
- `models/` — one class per table extending `SupabaseModel` (see patterns.md). Relations declared in `SupabaseModel.js` `relationMap`.
- `controllers/` — business logic; every handler wrapped in `asyncHandler`.
- `routes/` — express Routers; mount order in server.js matters (`/api/admin/database` before `/api/admin`).
- `utils/` — email (Resend), whatsappAgent (Cloud API/webhook/manual fallback + booking notifications), excelExporter (CSV), coupons, paymentMethods, authMethods, generateBookingId (`#QF` + 6 digits), firebaseAdmin, versionCompatibility, sequelizeMock (`Op` symbols).
- `scripts/` — schema verify/migration SQL + runners.

### Route map

| Mount | Router | Guard |
|---|---|---|
| `/api/auth` | authRoutes | mixed |
| `/api/services` | serviceRoutes | public read |
| `/api/bookings` | bookingRoutes | protect |
| `/api/coupons` | couponRoutes | mixed |
| `/api/payment` | paymentRoutes | mixed |
| `/api/reviews` | reviewRoutes | mixed |
| `/api/support` | supportRoutes | protect |
| `/api/admin/database` | databaseRoutes | protect + **owner** |
| `/api/admin` | adminRoutes | protect + **owner** |
| `/api/whatsapp` | whatsappRoutes | webhook public (Meta), mgmt protect + admin |
| `/api/images`, `/api/location`, `/api/events` | — | mixed |

## Database

Supabase PostgreSQL. Tables: `users`, `bookings`, `services`, `payments`, `coupons`, `beauty_artists`, `support_messages`, `auth_events`, `payment_method_settings`, `auth_method_settings`. PK is `id` (UUID, DB-generated); timestamps `created_at`/`updated_at` DB-managed. Column naming is INCONSISTENT across tables (most snake_case; `support_messages`/`beauty_artists` partly camelCase) — the model `columnMap`s absorb this.

## Integrations

- **Supabase** — data (service-role, backend only).
- **Firebase** (`fu-service`) — client Google auth; verified server-side via firebase-admin. `ALLOW_DEMO_GOOGLE_AUTH=true` currently on Render.
- **Resend** — OTP emails, support replies, review alerts. Sender still `onboarding@resend.dev` (needs verified domain for production).
- **WhatsApp Cloud API** (graph.facebook.com) — outbound messages + inbound webhook at `/api/whatsapp/webhook` (verify token handshake).
- **Anthropic Claude API** — optional AI auto-replies for WhatsApp (model default `claude-3-5-haiku-latest`, overridable via `WHATSAPP_AI_MODEL`).

## Deployment

| Piece | Where | Notes |
|---|---|---|
| Customer frontend | Vercel | SPA rewrite → `/index.html`; env `VITE_API_URL`, `VITE_ADMIN_URL` |
| Backend + admin | Render (free, service `fixoindia`) | build installs all deps + `build:admin`; start `node backend/server.js` |

Version-compatibility system: `app.version.json` + `versionMiddleware.js` + `VersionMismatchBanner.jsx` (min client 1.0.0), synced by `scripts/sync-app-version.mjs`.
