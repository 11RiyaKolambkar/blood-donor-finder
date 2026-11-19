const admin = require('firebase-admin');

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasValidFirebaseConfig = Boolean(
  firebaseConfig.projectId &&
  firebaseConfig.clientEmail &&
  firebaseConfig.privateKey &&
  firebaseConfig.privateKey.includes('BEGIN PRIVATE KEY') &&
  !firebaseConfig.privateKey.includes('PLACEHOLDER') &&
  !firebaseConfig.privateKey.includes('YOUR_PRIVATE_KEY_HERE')
);

let messaging = null;

if (hasValidFirebaseConfig) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
    }
    messaging = admin.messaging();
  } catch (error) {
    console.warn('Firebase initialization failed, notifications will be disabled:', error.message);
  }
} else {
  console.warn('Firebase credentials are not configured. FCM notifications are disabled. Add valid service account credentials to enable them.');
}

module.exports = { messaging };
