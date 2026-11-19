# PulseNet Flutter app

This Flutter client provides donor and blood-request screens. It uses Provider for state management and Firebase for app services.

## Run

Install Flutter with a Dart SDK compatible with `pubspec.yaml`, then run:

```powershell
flutter pub get
flutter run -d chrome
```

The app expects an API on port `5000`. Its URL is defined in `lib/config/api_config.dart`: web uses `http://localhost:5000/api`, while the Android emulator uses `http://10.0.2.2:5000/api`. For a physical device, configure the computer's LAN IP.

Firebase options are in `lib/firebase_options.dart`. Configure them for your Firebase project when setting up your own deployment.

## Checks

```powershell
dart format --output=none --set-exit-if-changed .
flutter analyze --no-fatal-infos
flutter test --coverage
```
