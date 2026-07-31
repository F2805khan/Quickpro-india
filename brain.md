# 🧠 fixOindia — Project Brain

> Single source of truth for context, decisions, ideas, and open questions.
> Last updated: 2026-07-12

---

## 1. What this project is

**fixOindia** (codebase name: *FunService*) is a full-stack **home services marketplace** for India — customers browse services (cleaning, repairs, beauty, etc.), book a slot, pay, and track the booking through a status timeline.

- **Tagline:** All Services. One Click.
- **Repo:** https://github.com/F2805khan/FixoINDIA
- **App version:** 1.1.0 (see `app.version.json`, synced via `scripts/sync-app-version.mjs`)

**Naming note:** the product brand is *fixOindia*, but package names, README title, and design assets still say *FunService* — they're the same thing.

---

## 2. Architecture at a glance

```
Customer (Vercel)          Backend + Admin (Render, single service "fixoindia")
┌──────────────────┐       ┌─────────────────────────────────────────┐
│ frontend/ (Vite +│ /api  │ backend/server.js (Express)             │
│ React 19 SPA)    ├──────►│  • /api/* → REST API                    │
└──────────────────┘       │  • non-API routes → serves admin/dist   │
                           │    (admin panel built by frontend's     │
                           │     vite.admin.config.js)               │
                           └───────────────┬─────────────────────────┘
                                           │ service-role key (server only)
                                    Supabase PostgreSQL
```

- **Frontend:** React 19 + Vite 7, react-router-dom 7, lucide-react icons, react-hot-toast, Leaflet (maps), Lottie animations, Firebase (client auth).
- **Backend:** Node/Express (ESM), JWT auth (30d expiry) + bcryptjs, firebase-admin, Resend for email (OTP, support, review alerts), WhatsApp Cloud API / webhook for booking notifications.
- **Database:** Supabase PostgreSQL, accessed **only from the backend** via `SUPABASE_SERVICE_ROLE_KEY`. Models wrap Supabase in `backend/models/` (base class `SupabaseModel.js`; there's also a `sequelizeMock.js` shim left over from the MySQL era).
- **Admin panel:** separate Vite entry (`admin/`, built with `frontend/vite.admin.config.js`) served by the backend under non-API routes (`/owner` path used by customer app to link to it).

### Domain models
`User`, `Service`, `Booking`, `Payment`, `Coupon`, `BeautyArtist`, `SupportMessage`, `AuthEvent`, `AuthMethodSetting`, `PaymentMethodSetting`.

### API surface (mounted in `backend/server.js`)
`/api/auth` (register, login, profile, OTP, Google), `/api/services`, `/api/bookings`, `/api/coupons`, `/api/payment`, `/api/reviews`, `/api/support`, `/api/admin`, `/api/images`, `/api/location`, `/api/events`. Health check at `/api/health`.

### Key frontend pages
Home, Services, LoginSignup, BookingStatus, History, Profile, CustomerSupport, AdminDashboard, OwnerPanel, AdminAccessGate.

---

## 3. How to run it

```bash
npm run install:all          # install frontend + backend deps
cp backend/.env.example backend/.env   # then fill in Supabase, JWT_SECRET, Resend
npm run dev:backend          # Express on http://localhost:5000
npm run dev:frontend         # Vite on http://localhost:5173
npm run dev:admin --prefix frontend    # admin panel on http://localhost:5174
npm run seed --prefix backend          # seed services into Supabase
```

Owner account can be bootstrapped on first backend start via `ADMIN_*` env vars (role: `owner`).

---

## 4. Deployment

| Piece | Where | Key facts |
|---|---|---|
| Customer frontend | **Vercel** | Builds `frontend/dist`; SPA rewrite to `/index.html`; needs `VITE_API_URL` + `VITE_ADMIN_URL` |
| Backend + admin | **Render** (free plan, service `fixoindia`) | Build installs frontend+backend deps and runs `build:admin`; start: `node backend/server.js`; `JWT_SECRET` auto-generated; `ALLOW_DEMO_GOOGLE_AUTH=true` currently |

CORS allowlist comes from `CLIENT_URL` (comma-separated).

---

## 5. Decisions log

| Date (approx) | Decision | Why / notes |
|---|---|---|
| ~Jun 2026 | **Migrated MySQL/Sequelize → Supabase PostgreSQL** | Commit `c7db6a1`; leftovers: `test_mysql.js`, `sequelizeMock.js`, old MYSQL_SSL commits |
| ~Jun 2026 | **Single Render service serves API + admin panel** | Keeps admin off Vercel; backend serves `admin/dist` for non-API routes |
| ~Jun 2026 | **Coupons added** alongside Supabase migration | `Coupon` model, `CouponApplyBox` component |
| — | **Payments are a dummy Razorpay-style flow** | Real payment gateway not integrated yet |
| — | **Service-role key stays backend-only** | Never expose `SUPABASE_SERVICE_ROLE_KEY` to the React app |
| — | **Auth methods are toggleable** via `AuthMethodSetting` | e.g. signups/Google login can be disabled from admin side |
| Jul 2026 | **Split cart from booking; mobile layout fixes; splash screen added** | Commits `7b94c54`, `237313e` |

*(Add new rows as decisions happen — keep the "why".)*

---

## 6. Current state & recent work (as of 2026-07-12)

- Latest commits: Vercel rewrite rule fix, splash screen + loading styles, login/signup flicker fix and Google-login logic when signups are disabled.
- Branch `fix/profile-coupon-ui` exists on origin (profile DB sync, coupon UI, booking confirmation close flow).
- Design exploration in progress: `funservice-*.png` mockups (dark + light themes, beauty category, booking flow) and `funservice_brand_refs.txt` in the repo root.
- Version-compatibility system in place: `versionMiddleware.js` + `VersionMismatchBanner.jsx` + `app.version.json` (min client version 1.0.0).

---

## 7. Ideas / backlog

- [ ] Replace dummy payment flow with a real Razorpay (or similar) integration
- [ ] Finish/ship the light-theme redesign from the `funservice-light-*` mockups
- [ ] Beauty-artist vertical (`BeautyArtist` model + `beautyController` exist — how far is the UI?)
- [ ] Clean up repo root: dev logs, mockup images, `test.csv`, stray JSON files could move to a `docs/` or `assets/` folder
- [ ] Remove MySQL-era leftovers (`test_mysql.js`, `sequelizeMock.js`) once confident
- [ ] Verified Resend sender domain before production (currently `onboarding@resend.dev`)

---

## 8. Open questions

- Is `ALLOW_DEMO_GOOGLE_AUTH=true` intended for production, or a temporary demo setting?
- Final brand: standardize on **fixOindia** everywhere, or keep FunService as internal codename?
- WhatsApp notifications: Cloud API or webhook fallback — which is the production path?
- What are the live Vercel/Render URLs? (Not recorded here yet — add them.)

---

## 9. External systems & references

| What | Where |
|---|---|
| Code | GitHub → `F2805khan/FixoINDIA` (default branch `main`) |
| Database | Supabase (URL in `backend/.env`, never committed) |
| Email | Resend (OTP, support inbox, review alerts) |
| Client auth | Firebase project `fu-service` |
| Hosting | Vercel (customer app) + Render (API + admin) |
| Brand/design refs | `funservice_brand_refs.txt`, `funservice-*.png` in repo root |

---

## 10. Conventions & gotchas

- Backend is **ESM** (`"type": "module"`) — use `import`, not `require`.
- All secrets live in `backend/.env` only; `.env.example` documents every variable.
- `postinstall` at the root runs `install:all`, so a plain `npm install` at root installs everything.
- DNS is forced to `ipv4first` in `server.js` (Supabase connectivity workaround).
- Booking IDs come from `utils/generateBookingId.js`; admin exports use `utils/excelExporter.js`.

---

*How to use this file: skim §1–2 for context, log every meaningful choice in §5, dump ideas in §7, and never let §8 questions die silently. Update the date at the top when you edit.*
