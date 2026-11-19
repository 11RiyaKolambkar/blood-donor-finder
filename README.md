<div align="center">

# 🩸 Blood Donor Finder

### PulseNet — connect people who need blood with potential donors.

[![PulseNet CI](https://github.com/11RiyaKolambkar/blood-donor-finder/actions/workflows/ci.yml/badge.svg)](https://github.com/11RiyaKolambkar/blood-donor-finder/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Flutter](https://img.shields.io/badge/Flutter-stable-02569B?logo=flutter)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)

[Getting Started](#-getting-started) · [Project Structure](#project-structure) · [Safety](#-safety)

</div>

> **Emergency safety:** PulseNet is not a substitute for emergency services or medical advice. In an emergency, contact your local emergency number. Compatibility information is advisory; a qualified medical professional must perform required clinical testing before transfusion. Read the [safety guidance](docs/SAFETY.md).

## What’s inside

- **Find donors:** donor profiles, availability, and blood-group matching.
- **Create blood requests:** request and follow up on blood donations.
- **Use the web or mobile client:** React with Vite, or Flutter.
- **Choose an API:** a JavaScript Express API for the web setup, or a separate TypeScript Express API with optional Redis and WebSocket support.

## Project Structure

| Folder | What it contains |
| --- | --- |
| [`client/`](client/) | React web client; Vite proxies `/api` requests to port `5000`. |
| [`server/`](server/) | JavaScript Express API used by `start.bat`; includes authentication, donor, and request routes. |
| [`flutter_app/`](flutter_app/) | Flutter client using Provider, Firebase, and HTTP services. |
| [`backend/`](backend/) | Separate TypeScript Express API with MongoDB, optional Redis, WebSocket support, and a Dockerfile. |
| [`shared/`](shared/) | Shared TypeScript constants, types, and validators. |
| [`docs/`](docs/) | API, architecture, and safety documentation. |

`server/` and `backend/` are alternative API implementations, not one service. Both use port `5000` by default, so run only one at a time.

## 🚀 Getting Started

### Run the React web app

**Requirements:** Node.js 20+, npm, MongoDB, and Firebase web configuration.

From the project root, copy the example environment files:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Set `MONGO_URI` and a private `JWT_SECRET` in `server/.env`. Add your Firebase web app's `VITE_FIREBASE_*` values to `client/.env`. Configure Firebase Admin credentials in `server/.env` only if you use server-side notifications. Never commit real environment files or service-account keys.

Start MongoDB locally, or use the development containers:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

Open two terminals at the project root. In the first, start the API:

```powershell
Set-Location server
npm install
npm run dev
```

In the second, start the web client:

```powershell
Set-Location client
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API health check is `http://localhost:5000/api/health`.

### Run the Flutter app

Install Flutter with a Dart SDK compatible with `flutter_app/pubspec.yaml`, then start a compatible API on port `5000`:

```powershell
Set-Location flutter_app
flutter pub get
flutter run -d chrome
```

The API URL is set in `flutter_app/lib/config/api_config.dart`: web uses `localhost`, and the Android emulator uses `10.0.2.2`. For a physical device, use your computer's LAN IP and make sure the device can reach it. Firebase options are in `flutter_app/lib/firebase_options.dart`; configure your own Firebase project when setting up a separate deployment.

### Run the TypeScript API

This API is used by the Dockerfile and CI workflow. It is separate from `server/`.

```powershell
Copy-Item backend\.env.example backend\.env
docker compose -f docker-compose.dev.yml up -d
Set-Location backend
npm ci
npm run dev
```

The development Compose file starts MongoDB and Redis; the TypeScript API runs on the host at port `5000`. Its health endpoint is `http://localhost:5000/api/v1/health`.

To run the TypeScript API and its infrastructure in containers, configure private application secrets in `backend/.env`, set `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD` in a root `.env` file, then run:

```powershell
docker compose up --build
```

This Compose setup runs the TypeScript API, MongoDB, and Redis; it does not run either client. Its default database credentials are for local use only. Set your own before using it beyond a local development environment.

## 🧪 Checks

Run each block from the project root:

```powershell
Set-Location backend
npm run lint
npm run type-check
npm test
npm run build
```

```powershell
Set-Location flutter_app
dart format --output=none --set-exit-if-changed .
flutter analyze --no-fatal-infos
flutter test --coverage
```

## 🔒 Safety

This project is intended to help people find donors and manage requests. It does not dispatch emergency services or replace clinical evaluation. See [docs/SAFETY.md](docs/SAFETY.md) for the project's safety guidance.

Keep local `.env` files, private keys, and real donor or patient data out of source control.

## Notes

- [`start.bat`](start.bat) is a Windows shortcut with machine-specific hard-coded paths. Use the manual setup steps above on other machines.
- `docker-compose.yml` runs the TypeScript API and its infrastructure, not the React or Flutter clients.
