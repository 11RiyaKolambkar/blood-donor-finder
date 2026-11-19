# PulseNet — Developer Setup Guide

> **Milestone 1 — Local Development Environment**

This guide gets you from a fresh machine to a fully running local PulseNet stack. Follow the steps in order.

---

## Prerequisites

Ensure the following are installed before beginning:

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 10+ (comes with Node 20) | — |
| Docker Desktop | 4.25+ | https://www.docker.com/products/docker-desktop |
| Flutter SDK | 3.24.0 | https://docs.flutter.dev/get-started/install |
| Git | 2.40+ | https://git-scm.com |

Verify installations:

```bash
node --version       # should print v20.x.x
npm --version        # should print 10.x.x
docker --version     # should print Docker version 24.x.x or later
flutter --version    # should print Flutter 3.24.0
git --version        # should print git version 2.40+
```

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/pulsenet.git
cd pulsenet
```

> **Windows users:** Use Git Bash or PowerShell. WSL2 is recommended for the best Docker performance.

---

## Step 2 — Set Up Environment Variables

The project uses a `.env` file in the backend directory (not committed to source control).

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in the required values:

```env
# Required for local development
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/pulsenet_dev
REDIS_URL=redis://localhost:6379

# JWT (generate random 64-char strings)
JWT_SECRET=your_local_jwt_secret_min_32_chars_replace_this
JWT_REFRESH_SECRET=your_local_refresh_secret_min_32_chars_replace_this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase (get from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Maps (get from Google Cloud Console)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Razorpay (get from Razorpay Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

> **Note:** For local development, Firebase and Razorpay keys are optional unless you are testing those features. The server starts without them but logs warnings.

---

## Step 3 — Option A: Docker Compose (Recommended)

This starts MongoDB, Redis, and the backend in Docker with hot-reload.

```bash
# From the repo root:
docker compose -f docker-compose.dev.yml up --build
```

What this does:
- Builds the backend image from `backend/Dockerfile`
- Starts MongoDB 7 on port 27017
- Starts Redis 7 on port 6379
- Mounts `backend/src` as a volume (changes reload automatically)
- Exposes the backend API on port 5000
- Exposes the Node.js debugger on port 9229

Verify everything is running:

```bash
docker compose -f docker-compose.dev.yml ps
```

All three services should show `Up (healthy)`.

Test the API:

```bash
curl http://localhost:5000/health
# Expected: {"status":"ok","ts":"2024-..."}
```

Stop the stack:

```bash
docker compose -f docker-compose.dev.yml down
```

Stop and remove data volumes (fresh start):

```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## Step 4 — Option B: Manual Setup (Without Docker)

Use this if you prefer to run MongoDB and Redis natively.

### 4a — Install and Start MongoDB

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows — download the MSI installer from https://www.mongodb.com/try/download/community
```

Verify MongoDB is running:
```bash
mongosh --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }
```

### 4b — Install and Start Redis

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows — use WSL2 or download from https://github.com/microsoftarchive/redis/releases
```

Verify Redis is running:
```bash
redis-cli ping
# Expected: PONG
```

### 4c — Install Backend Dependencies

```bash
cd backend
npm install
```

### 4d — Start the Backend in Development Mode

```bash
cd backend
npm run dev
```

The server starts with `ts-node-dev` (or `nodemon` depending on configuration) and watches for file changes. Expected output:

```
[server] MongoDB connected
[server] Redis connected
[server] PulseNet API listening on port 5000
```

---

## Step 5 — Set Up Flutter Mobile App

```bash
cd mobile

# Get Flutter dependencies
flutter pub get

# Check for issues
flutter doctor

# Run on a connected device or emulator
flutter run
```

For Android: ensure Android Studio and an emulator (or physical device with USB debugging) are configured.  
For iOS (macOS only): ensure Xcode and an iOS simulator are configured.

Run Flutter tests:

```bash
cd mobile
flutter test
```

---

## Step 6 — Set Up Flutter Admin Dashboard

```bash
cd admin

# Get Flutter dependencies
flutter pub get

# Run as Flutter Web (Chrome)
flutter run -d chrome

# Or build a web release
flutter build web
```

The admin dashboard is a Flutter Web app. It runs on `http://localhost:PORT` (port assigned by Flutter).

Run Flutter tests:

```bash
cd admin
flutter test
```

---

## Step 7 — Verify the Full Stack

With all services running (backend + MongoDB + Redis), run this sequence:

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Register a test user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"patient@test.com","phone":"+919876543210","password":"Test@1234","role":"patient","bloodGroup":"O+"}'

# 3. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"Test@1234"}'
# Should return { success: true, data: { accessToken: "...", refreshToken: "..." } }
```

---

## Step 8 — Run All Tests

### Backend

```bash
cd backend
npm test
```

### Flutter Mobile

```bash
cd mobile
flutter test
```

### Flutter Admin

```bash
cd admin
flutter test
```

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `ECONNREFUSED` on MongoDB | MongoDB is not running. Start it with `brew services start mongodb-community@7.0` or `docker compose up mongo` |
| `ECONNREFUSED` on Redis | Redis is not running. Start it with `brew services start redis` or `docker compose up redis` |
| Docker port conflict on 27017 | Stop native MongoDB: `brew services stop mongodb-community@7.0` |
| `flutter doctor` shows issues | Follow the specific instructions printed by `flutter doctor` |
| Backend starts but FCM fails | Add `FIREBASE_*` variables to `backend/.env`; FCM is optional for non-notification features |
| `npm install` fails on Windows | Run as Administrator; ensure Node 20 is on PATH |
| TypeScript compile errors in `shared/` | Run `cd backend && npm run type-check` to see detailed errors |

---

## Useful Commands Reference

```bash
# Backend
npm run dev          # Start with hot-reload
npm run build        # Compile TypeScript → dist/
npm run type-check   # Type-check without emitting
npm run lint         # ESLint
npm test             # Jest tests

# Docker
docker compose -f docker-compose.dev.yml up --build   # Start dev stack
docker compose -f docker-compose.dev.yml down -v      # Stop and wipe volumes
docker compose logs backend --follow                   # Tail backend logs

# Flutter
flutter pub get      # Install dependencies
flutter run          # Run on connected device
flutter test         # Run tests
flutter analyze      # Lint / static analysis
flutter build web    # Build admin web release
```
