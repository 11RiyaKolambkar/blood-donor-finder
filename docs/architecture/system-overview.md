# PulseNet — System Overview

> **"Every Second Matters"**

PulseNet is an emergency healthcare coordination platform that connects blood donors, patients, hospitals, and blood banks in real time. When every second counts — a road accident, a surgery complication, a rare blood type need — PulseNet cuts through friction, dispatches the nearest available donors, and keeps every stakeholder informed with zero guesswork.

---

## Mission

Blood shortages kill preventable deaths every day. PulseNet's mission is to reduce the gap between need and supply to under five minutes in covered areas. Every architectural decision — from server-authoritative SOS to privacy-preserving location tracking — is made in service of that mission while maintaining the highest standards of safety, consent, and regulatory compliance.

---

## Monorepo Structure

```
BloodDonorFinder/
├── backend/          # Node.js + TypeScript API server
├── mobile/           # Flutter mobile app (Android + iOS)
├── admin/            # Flutter web admin dashboard
├── shared/           # Shared TypeScript types, constants, validators
├── docs/             # Architecture, safety, runbooks, PRDs
├── docker-compose.yml
├── docker-compose.dev.yml
└── .github/workflows/ci.yml
```

The monorepo keeps every concern co-located: a single `git blame` traces any data policy decision from docs → shared types → backend enforcement → mobile display.

---

## Components

### Flutter Mobile App (`mobile/`)

The primary end-user interface for **patients** and **donors**.

- **Patients** can raise blood requests, track active requests, trigger an SOS, manage their health profile, and consent to location sharing.
- **Donors** receive push notifications when a compatible request is nearby, can accept or decline, navigate to the donation site via Google Maps, and view their donation history.
- Real-time updates arrive via Socket.IO, so the UI is always current without polling.
- The SOS flow includes a mandatory 5-second countdown with a cancel button — no automation fires without at least that moment of human confirmation.
- Offline-tolerant: critical features (view own requests, see emergency contact info) gracefully degrade when connectivity is lost.

### Flutter Web Admin Dashboard (`admin/`)

The operational control plane for **operators** and **admins**.

- Operators monitor live blood requests on a map, intervene in stalled matches, escalate SOS events, and manage the human-review queue.
- Admins manage user accounts, configure platform settings, view audit logs, and handle break-glass access.
- The admin panel is web-only (responsive Flutter Web) for security — no installable binary that could be sideloaded.

### Node.js / TypeScript Backend (`backend/`)

A single REST + Socket.IO API server responsible for all business logic.

**Architecture:**
- Express.js REST API under `/api/v1`
- Socket.IO for real-time bidirectional events (SOS updates, donor tracking, notifications)
- Layered architecture: Routes → Controllers → Services → Repositories → MongoDB

**All safety-critical decisions are server-authoritative.** The mobile app never self-certifies a donor match, blood compatibility, or SOS escalation. The server validates, decides, and broadcasts.

---

## Data Storage

### MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | All user profiles, roles, consent records, verification status |
| `blood_requests` | Blood requests with status lifecycle, matched donors, fulfillment chain |
| `emergency_sos` | SOS events, timestamps, escalation history, operator actions |
| `inventory` | Blood bank stock by type, unit count, expiry |
| `notifications` | FCM push records, delivery status, retry counts |
| `payments` | Razorpay transaction records, refund status |
| `audit_logs` | Immutable append-only log of all privileged actions |
| `consent_records` | Per-user, per-purpose consent grants with timestamps and version |
| `location_traces` | Time-limited live location records (TTL-indexed, auto-deleted) |

### Redis Usage

| Use Case | Key Pattern | TTL |
|---|---|---|
| JWT access token blacklist | `blacklist:<jti>` | Expiry of the token |
| Refresh token store | `rt:<userId>` | 7 days |
| Rate limit counters | `rl:<ip>:<window>` | Window duration |
| Session cache | `sess:<userId>` | 15 min rolling |
| SOS dedup lock | `sos:lock:<userId>` | 60 s |
| OTP store | `otp:<phone>` | 5 min |

Redis is ephemeral cache only — the source of truth is always MongoDB. A Redis flush does not cause data loss; it causes a cache miss with graceful fallback.

---

## Integrations

### FCM Push Notifications
Firebase Cloud Messaging delivers time-critical alerts to donors and patients. The backend stores FCM tokens per device (a user can have multiple devices). Delivery receipts are tracked; failed deliveries trigger retry up to `MAX_NOTIFICATION_RETRIES` (3). After exhaustion, the event is logged and an operator alert is raised.

### Google Maps — Geospatial
- Donor proximity search uses MongoDB 2dsphere indexes with `$nearSphere` queries.
- The mobile app renders live maps for SOS location, blood bank directions, and donor route.
- Precise location is only collected with explicit, revocable consent.
- Live location sharing auto-expires after `LIVE_LOCATION_MAX_DURATION_MS` (1 hour) and cannot be extended without fresh consent.

### Razorpay — Payments
- Patients can optionally compensate donors for travel costs through Razorpay.
- All payment intents carry an `X-Idempotency-Key` to prevent double-charges.
- Payment records are retained for 7 years per financial regulations.
- Refunds are human-initiated only; no automation triggers a refund.

---

## Safety-First Principles

### 1. PulseNet Is Not an Emergency Service
PulseNet coordinates blood donation logistics. It is not a substitute for calling emergency services (112 / 911). Every SOS flow must surface a "Call Emergency Services" prompt before and alongside the PulseNet flow.

### 2. Server-Authoritative Decisions
Blood compatibility checks, donor eligibility, SOS escalation, and payment processing are computed server-side. Client inputs are validated and untrusted.

### 3. Human Oversight Required
Automated matching is a **recommendation**, not a commitment. All SOS events are visible to operators. Escalated events require human acknowledgement. The system cannot autonomously resolve a P0 incident.

### 4. Consent-Driven Data Access
No location, health, or identity data is processed without an explicit, granular consent record. Consent is revocable at any time. Revocation is processed within 24 hours.

### 5. Minimal Data Collection
We collect only what is necessary for the specific purpose declared in the consent. Exact GPS coordinates are not stored beyond their retention window; coarser location is derived and retained longer for safety.

### 6. Immutable Audit Trail
Every privileged action (role change, break-glass access, manual escalation, payment override) is written to an append-only audit log. Audit log records are never deleted within the 7-year retention window.

---

## Compliance and Regulatory Context

PulseNet is designed for the Indian healthcare market and must comply with:
- **DPDPA 2023** (Digital Personal Data Protection Act) — consent, retention, and data principal rights
- **IT Act 2000** — data security obligations
- **CDSCO guidelines** — where blood product handling is involved
- State-specific blood bank regulations

Consult the [Clinical Safety Policy](../safety/clinical-safety-policy.md) before modifying any safety-critical flow.
