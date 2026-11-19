# 🩸 PULSENET — Emergency Healthcare Network
### "Every Second Matters."

> ⚠️ **Emergency Safety Disclaimer**: PulseNet is **NOT** a substitute for emergency services, licensed clinicians, or official medical advice. If you are in immediate danger, call your local emergency number (**112 / 911**) immediately. PulseNet cannot guarantee emergency response, rescue dispatch, or clinical care.

PulseNet is a secure, scalable emergency healthcare platform connecting blood donors, patients in urgent need, blood banks, and hospitals in real time.

---

## 🏗️ Architecture Overview

The system is structured as an incremental, production-ready monorepo:

- **`mobile` (Flutter App)**: Clean Architecture with Material 3, Riverpod, GoRouter, Dio, background location, and FCM.
- **`backend` (Node.js/Express/TypeScript)**: Production REST & WebSocket APIs, MongoDB with 2dsphere geospatial indexing, JWT auth with RBAC, structured logging, audit trails, and strict error handling.
- **`shared`**: Reusable contracts, enums, blood compatibility algorithms, and shared constants.
- **`docs`**: Safety policies, architecture diagrams, and comprehensive API documentation.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ & npm
- Flutter 3.3+ & Dart SDK
- MongoDB 7.0+ (Local or Docker)

### 1. Run the Backend API
```bash
cd backend
npm install
npm run dev
```
The server will start at `http://localhost:5000`. Test the health check:
```bash
curl http://localhost:5000/health
```

### 2. Run the Mobile/Web Client
```bash
cd flutter_app
flutter pub get
flutter run -d chrome  # or an Android/iOS emulator
```

---

## 🔒 Safety, Privacy & Human Oversight

1. **SOS State Machine**: Draft → Confirmed → Notification Pending → Acknowledged → Resolved / Cancelled.
2. **Immutable Audit Trails**: Every emergency status change, location access, and administrative override is logged securely.
3. **Clinical Safety**: Blood compatibility matrices verify matches; clear instructions instruct users to double-check with medical staff before transfusion.
4. **Human Review**: Critical alerts, safety events, and disputes are queued for operator review.
