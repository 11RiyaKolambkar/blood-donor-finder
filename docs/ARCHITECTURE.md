# PULSENET System Architecture

```
+-----------------------------------------------------------+
|              PULSENET Mobile & Web (Flutter)             |
|   (Riverpod State, GoRouter, Dio Client, Material 3 UI)   |
+-----------------------------+-----------------------------+
                              |
                     HTTPS / REST & WSS
                              |
+-----------------------------v-----------------------------+
|              PulseNet Backend API (TypeScript)            |
|   - Express v4 + Helmet + CORS + Rate Limiter             |
|   - JWT Authentication & RBAC (Patient, Donor, Admin)     |
|   - Emergency SOS State Machine & Idempotency Engine      |
|   - Geospatial Discovery (2dsphere $near queries)         |
|   - Audit Logging & Human Review Queues                   |
+-----------------------------+-----------------------------+
                              |
               +--------------+--------------+
               |                             |
+--------------v---------------+ +-----------v-------------+
|   MongoDB Database           | |    Socket.IO & FCM      |
|   - 2dsphere Geospatial Index| |    - Real-Time Updates  |
|   - AuditLogs, Users, Donors | |    - Critical Push      |
|   - Emergencies, Inventories | |      Notifications      |
+------------------------------+ +-------------------------+
```

## Data Flows

### 1. Emergency SOS Workflow
1. Patient presses SOS on Mobile App.
2. 5-second countdown with immediate cancellation option.
3. On countdown completion, request sent with `X-Idempotency-Key` and location consent.
4. Backend persists state as `DRAFT` / `NOTIFICATION_PENDING`.
5. Socket.IO broadcasts alert to authorized nearby donors, hospitals, and operators.
6. Operator or emergency service acknowledges or escalates the call.

### 2. Blood Donor Discovery
1. User searches by blood group and radius (km).
2. Backend queries MongoDB with `$near` using 2dsphere index on Donors.
3. Compatibility matrix filters only clinically viable blood types (e.g., O- can donate to all).
4. Results returned with privacy-safe obfuscated distance metrics.
