# PulseNet — Product Requirements

**Version:** 1.0  
**Status:** Active  
**Review:** Per milestone completion

---

## Milestone 0 — Foundation (Monorepo, Shared Types, CI, Auth)

| Feature | Owner | Priority | Dependencies | Acceptance Test |
|---------|-------|---------|-------------|----------------|
| Monorepo scaffold (backend/, mobile/, admin/, shared/, docs/) | Infra | P0 | None | `d:\BloodDonorFinder` has all top-level dirs; shared types compile with `tsc --noEmit` |
| Shared TypeScript types (`UserRole`, `BloodGroup`, `EmergencyStatus`, `BloodRequestStatus`, `ConsentPurpose`) | Infra | P0 | None | Enums exported from `shared/types/index.ts`; importable from backend |
| Shared constants (pagination, retention, rate limits, emergency timeouts) | Infra | P0 | None | Constants exported from `shared/constants/index.ts` |
| Shared validators (email, phone, password, blood group) | Infra | P0 | None | `VALIDATORS.isValidEmail('test@test.com')` returns `true`; invalid inputs return `false` |
| Docker Compose (production: mongo + redis + backend with health checks) | Infra | P0 | Backend Dockerfile | `docker compose up` starts all services; `docker compose ps` shows all healthy |
| Docker Compose dev (hot-reload, debug port 9229) | Infra | P1 | Backend dev config | `docker compose -f docker-compose.dev.yml up` starts with vol mount; file changes restart server |
| GitHub Actions CI — backend lint + typecheck + test | Infra | P0 | None | CI passes on push to `develop`; fails on a linting error |
| GitHub Actions CI — Flutter mobile analyze + test | Infra | P1 | mobile/ flutter project | Flutter analyze reports no errors on clean project |
| GitHub Actions CI — Flutter admin analyze + test | Infra | P1 | admin/ flutter project | Flutter analyze reports no errors on clean project |
| `.gitignore` covering Node, Flutter, IDE, OS, secrets | Infra | P0 | None | `git status` does not show `.env`, `node_modules/`, or `build/` |
| Backend Express server scaffold | Backend | P0 | None | `GET /health` returns `200 { status: "ok" }` |
| MongoDB connection with retry and health check | Backend | P0 | Docker Compose | Server logs "MongoDB connected" on start; exits gracefully if DB unavailable after 5 retries |
| Redis connection with error handling | Backend | P0 | Docker Compose | Server logs "Redis connected"; rate limiter middleware initialises |
| User registration (email + phone OTP) | Backend | P0 | Redis (OTP) | POST `/auth/register` with valid body returns `201` with user object; duplicate email returns `409` |
| User login (JWT access + refresh) | Backend | P0 | User registration | POST `/auth/login` returns access token (15 min) and refresh token (7 days) |
| JWT refresh endpoint | Backend | P0 | Login | POST `/auth/refresh` with valid refresh token returns new access token |
| Logout (token blacklist) | Backend | P0 | Login, Redis | POST `/auth/logout` blacklists access token JTI; subsequent request with same token returns `401` |
| Role-based access control middleware | Backend | P0 | Auth | `authorize(['admin'])` on a patient request returns `403 FORBIDDEN` |
| Rate limiting (auth: 10/15 min; API: 100/15 min; SOS: 3/min) | Backend | P0 | Redis | 11th auth attempt in 15 min returns `429 RATE_LIMITED` with `Retry-After` header |
| Flutter mobile auth screens (register, login, OTP) | Mobile | P1 | Backend auth | User can register and log in on device; JWT stored in secure storage |
| Flutter admin login screen | Admin | P1 | Backend auth | Operator can log in; non-operator roles are rejected with clear error |

---

## Milestone 1 — Blood Request Core Flow

| Feature | Owner | Priority | Dependencies | Acceptance Test |
|---------|-------|---------|-------------|----------------|
| Blood request creation (patient/hospital) | Backend | P0 | Auth, MongoDB | POST `/blood-requests` creates record; response includes `requestId` and `status: pending` |
| Blood group compatibility matching engine | Backend | P0 | Shared types | `A+` request matches `A+`, `A-`, `O+`, `O-` donors; `AB+` matches all |
| Nearby donor search (geospatial 2dsphere) | Backend | P0 | MongoDB 2dsphere index | Donors within 10 km radius returned sorted by distance |
| FCM notification dispatch (donor alert) | Backend | P0 | Firebase credentials, Redis | Donor receives push within 10 seconds of a compatible request |
| Donor accept/decline response | Backend | P0 | FCM, Auth | PUT `/blood-requests/:id/respond` with `accept` updates status to `matched`; `decline` logs reason |
| Request status lifecycle (pending → matched → accepted → fulfilled/cancelled) | Backend | P0 | Blood request creation | Each valid transition succeeds; invalid transitions return `409 CONFLICT` |
| Blood request list (patient: own; hospital: own; admin: all) | Backend | P0 | Auth, RBAC | Paginated list respects role; patient cannot see another patient's requests |
| Precise location consent check before geospatial ops | Backend | P0 | Consent records | Geospatial query blocked and `403 CONSENT_REQUIRED` returned if `LOCATION_PRECISE` not granted |
| Mobile: create blood request screen | Mobile | P1 | Backend | Patient submits form; sees `pending` status immediately; updates to `matched` via Socket.IO |
| Mobile: donor alert screen (accept/decline) | Mobile | P1 | FCM, Backend | Donor receives notification; taps → sees request details → accepts; map shows route |
| Mobile: request tracking screen | Mobile | P1 | Socket.IO | Status updates in real time without page reload |
| Admin: blood request list with filters | Admin | P1 | Backend | Operator sees all requests; can filter by status, blood group, date |
| Socket.IO events: request status changes | Backend | P1 | Socket.IO setup | Client subscribed to `request:<id>` receives event within 1 s of status change |

---

## Milestone 2 — SOS and Emergency Flow

| Feature | Owner | Priority | Dependencies | Acceptance Test |
|---------|-------|---------|-------------|----------------|
| SOS creation with 5-second countdown | Mobile | P0 | Backend SOS API | Countdown visible and cancellable; SOS fires only after countdown completes |
| SOS safety disclaimer (verbatim, cannot be suppressed) | Mobile | P0 | Clinical safety policy | Disclaimer text matches `SAFETY_SOS_PRE_CONFIRM` exactly; dismiss button labelled "Call 112 first" |
| Backend SOS event creation | Backend | P0 | Auth, MongoDB | POST `/emergency/sos` creates event; idempotency key required; duplicate key returns cached response |
| SOS FCM broadcast (all compatible donors in radius) | Backend | P0 | FCM, Geospatial | All compatible donors within 10 km receive push within 5 seconds |
| SOS acknowledgement timeout (5 min → operator queue) | Backend | P0 | Redis, Scheduler | After 5 min with no donor accept, task appears in operator human-review queue |
| SOS escalation (10 min → P0 alert) | Backend | P0 | Redis, Scheduler | After 10 min, PagerDuty webhook fires |
| Operator SOS management screen | Admin | P0 | Backend | Operator sees live SOS map; can manually assign donor or mark resolved with note |
| Emergency contact notification on SOS | Backend | P1 | Consent: EMERGENCY_CONTACTS | Contacts notified via SMS if SOS is unacknowledged for 10 min |
| Live location sharing (donor → patient, session-limited) | Backend | P1 | Consent: LOCATION_LIVE | Location stream auto-terminates after 1 hour; consent check at session start |
| SOS status lifecycle (draft → confirmed → notified → acknowledged → resolved/failed) | Backend | P0 | SOS creation | Each transition logged with timestamp; FAILED status triggers mandatory audit entry |

---

## Milestone 3 — Payments, Inventory, Compliance

| Feature | Owner | Priority | Dependencies | Acceptance Test |
|---------|-------|---------|-------------|----------------|
| Razorpay payment initiation | Backend | P1 | Razorpay credentials | POST `/payments/initiate` with idempotency key creates Razorpay order; returns `orderId` |
| Payment webhook processing (success/failure) | Backend | P1 | Razorpay webhook | Successful webhook marks payment `completed`; failed marks `failed`; duplicate webhook ignored |
| Payment fraud detection (amount mismatch, duplicate non-idempotent) | Backend | P1 | Payment processing | Mismatched amount triggers `P1` task in human-review queue; fulfilment blocked |
| Blood bank inventory management | Backend | P2 | Auth (blood_bank role) | Blood bank can add/update units; expiry < 24 h flagged; inventory visible to hospitals (read-only) |
| Consent grant/revoke API | Backend | P0 | Consent records model | POST `/consent/grant` and POST `/consent/revoke` update consent record; revocation processed within 24 h |
| Data retention scheduler (nightly purge job) | Backend | P1 | MongoDB TTL + scheduler | Records past retention date deleted nightly; deletion event logged in audit log |
| User data export (right of access — DPDPA) | Backend | P1 | All collections | GET `/account/export` returns JSON with all user's data; triggers async job; download link in 24 h |
| Account deletion with retention schedule | Backend | P1 | Retention schedule | DELETE `/account` pseudonymises audit logs; deletes profile data; starts 7-year legal retention clock |
| Audit log viewer (admin only) | Admin | P2 | Audit logs | Admin can search/filter audit logs by user, action type, date range |
| Break-glass access flow | Admin | P2 | Audit logs, RBAC | Operator enters justification → 30 min session created → all actions tagged `break_glass: true` |

---

## Milestone 4 — Hardening, Scale, Monitoring

| Feature | Owner | Priority | Dependencies | Acceptance Test |
|---------|-------|---------|-------------|----------------|
| End-to-end test suite (critical flows) | Backend | P0 | All M0–M2 features | SOS flow, blood request flow, auth flow all pass in CI |
| Load testing (100 concurrent SOS events) | Backend | P1 | All M0–M2 features | P95 latency < 500 ms under 100 concurrent SOS; no data loss |
| Structured logging (JSON, correlation IDs) | Backend | P1 | None | Every request logged with `requestId`, `userId`, `method`, `path`, `statusCode`, `durationMs` |
| Monitoring dashboards (latency, error rate, SOS queue depth) | Infra | P1 | Logging | Dashboard visible in monitoring tool; SOS queue depth alert fires when depth > 5 |
| Security audit (OWASP Top 10 review) | Security | P0 | All features | No critical or high findings unresolved before production launch |
| Privacy impact assessment | Legal | P0 | All M3 features | DPDPA compliance checklist completed; Data Protection Officer sign-off |
