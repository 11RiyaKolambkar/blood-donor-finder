# PulseNet — RBAC Permission Matrix

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Full access allowed |
| ❌ | Access denied |
| 🔒 | Own resource only |
| 👁 | Read-only |
| 🔑 | Break-glass access (requires justification, logged, time-limited) |

---

## Permission Matrix

| Resource | patient | donor | blood_bank | hospital | admin | operator |
|----------|---------|-------|-----------|---------|-------|---------|
| **auth** (register, login, logout, refresh) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **own-profile** (read/write own profile, health data, settings) | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | 🔒 |
| **other-profiles** (read other users' profiles) | ❌ | ❌ | 👁 | 👁 | ✅ | 👁 |
| **blood-requests** (create, read, update status) | 🔒 | 👁 | ✅ | ✅ | ✅ | ✅ |
| **emergency-sos** (trigger, acknowledge, escalate, resolve) | 🔒 | ❌ | ❌ | 👁 | ✅ | ✅ |
| **inventory** (blood bank stock management) | ❌ | ❌ | 🔒 | 👁 | ✅ | 👁 |
| **payments** (initiate, view, refund) | 🔒 | 🔒 | ❌ | ❌ | ✅ | ❌ |
| **notifications** (receive, mark read) | 🔒 | 🔒 | 🔒 | 🔒 | ✅ | ✅ |
| **admin-panel** (user management, platform config) | ❌ | ❌ | ❌ | ❌ | ✅ | 👁 |
| **audit-logs** (read immutable log) | ❌ | ❌ | ❌ | ❌ | ✅ | 👁 |
| **human-review-queue** (escalated SOS, flagged actions) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Role Descriptions

### `patient`
A registered individual seeking blood. Can create blood requests, track their own requests, trigger SOS for themselves, and manage their own profile and consent preferences.

### `donor`
A registered individual willing to donate blood. Receives notifications for nearby compatible requests. Accepts or declines donation requests. Cannot view other users' personal details beyond what is needed to navigate to the donation site.

### `blood_bank`
An institution managing blood inventory. Can view and update their own inventory, respond to hospital/patient requests, and read requesting user's blood group (not full profile). Cannot access SOS events or payments.

### `hospital`
A registered hospital raising blood requests on behalf of patients. Can read blood bank inventory and track request fulfillment. Cannot manage payments or SOS on behalf of patients — those remain patient-initiated.

### `admin`
Full platform access including user management, role assignment, audit log review, and configuration. Can perform break-glass access on any resource with mandatory justification logging. Cannot delete audit logs.

### `operator`
Operational staff monitoring the platform in real time. Can view the human-review queue, acknowledge SOS events, escalate incidents, and read (but not modify) user profiles and audit logs. Cannot change roles, access payments, or delete data.

---

## Break-Glass Access

Break-glass (🔑) grants temporary elevated access to a specific resource for a specific justification. Requirements:
1. Operator or admin must supply a written justification (minimum 20 characters)
2. Access is time-limited (default: 30 minutes)
3. Every resource read/write during the break-glass window is tagged in audit logs with `break_glass: true`
4. A second admin must acknowledge within 1 hour (four-eyes principle for P0 events)
5. Break-glass sessions cannot be nested

See [escalation-runbook.md](../safety/escalation-runbook.md) for the full procedure.

---

## Enforcement

All permission checks are enforced server-side in the backend middleware stack:
1. `authenticate` — validates JWT, checks token blacklist
2. `authorize(roles[])` — checks `req.user.role` against allowed roles
3. `ownResource(param)` — compares resource owner ID against `req.user.id`
4. `breakGlass(justification)` — creates break-glass session, stamps audit log

Client-side role checks (e.g., hiding UI elements) are UX conveniences only and are **never** the security boundary.
