# Blood Donor Finder (PulseNet)

Blood Donor Finder is a donor-search and blood-request application with a React web client, a Flutter app, and two alternative Express APIs.

> **Safety:** This application is not a substitute for emergency services or medical advice. In an emergency, contact your local emergency number. Compatibility information is advisory; a qualified medical professional must perform required clinical testing before transfusion. See [docs/SAFETY.md](docs/SAFETY.md).

## Project layout

| Path | Purpose |
| --- | --- |
| `client/` | React web client built with Vite. Its `/api` requests are proxied to `http://localhost:5000`. |
| `server/` | JavaScript Express API used by `start.bat`; provides authentication, donor, and request routes. |
| `flutter_app/` | Flutter app using Provider, Firebase, and HTTP services. |
| `backend/` | Separate TypeScript Express API with MongoDB, optional Redis, WebSocket support, and a Dockerfile. |
| `shared/` | Shared TypeScript constants, types, and validators. |
| `docs/` | API, architecture, and safety documentation. |

`server/` and `backend/` are separate API implementations, not one service. Both use port `5000` by default, so run only one at a time.

## Run the React web app

### Requirements

- Node.js 20 or newer and npm
- MongoDB (local, or started with Docker Compose)
- Firebase web configuration for the client; Firebase Admin credentials in the server environment if push notifications are needed

From the project root, copy the example environment files and fill in the values for your setup:

```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

In `server/.env`, set `MONGO_URI` and a private `JWT_SECRET`. In `client/.env`, set the `VITE_FIREBASE_*` values for your Firebase web app. Only configure Firebase Admin `FIREBASE_*` values in `server/.env` if you use server-side notifications. Never commit real environment files or service-account keys.

Start MongoDB locally, or start the development MongoDB and Redis containers from the project root:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

Open two terminals at the project root. In the first, start the JavaScript API:

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

## Run the Flutter app

Install Flutter with a Dart SDK compatible with the constraint in `flutter_app/pubspec.yaml`, then start a compatible API on port `5000`:

```powershell
Set-Location flutter_app
flutter pub get
flutter run -d chrome
```

The app's API URL is set in `flutter_app/lib/config/api_config.dart`: web uses `localhost`, and the Android emulator uses `10.0.2.2`. For a physical device, use your computer's LAN IP and ensure the device can reach it. Firebase options are in `flutter_app/lib/firebase_options.dart`; use the configuration for your own Firebase project when setting up a separate deployment.

## Run the TypeScript API

This is the API used by the Dockerfile and CI workflow. It is separate from `server/`.

```powershell
Copy-Item backend\.env.example backend\.env
docker compose -f docker-compose.dev.yml up -d
Set-Location backend
npm ci
npm run dev
```

The development Compose file starts MongoDB and Redis; the TypeScript API runs on the host at port `5000`. Its health endpoint is `http://localhost:5000/api/v1/health`.

To run the TypeScript API and its infrastructure in containers, configure `backend/.env` with private application secrets and set `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD` in a root `.env` file, then run `docker compose up --build`. The Compose file does not run the React or Flutter clients. Its default database credentials are for local use only; set your own before using it beyond a local development environment.

## Checks

Run each block from the project root. The GitHub Actions workflow runs these checks:

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

`start.bat` is a machine-specific Windows shortcut with hard-coded local paths. Use the manual steps above on other machines.
