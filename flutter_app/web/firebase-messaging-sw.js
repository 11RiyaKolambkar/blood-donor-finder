importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC4KeOnbj4WUv-kdQc2FDecUDdYnn1yAks',
  authDomain: 'blooddonorfinder-f1ee8.firebaseapp.com',
  projectId: 'blooddonorfinder-f1ee8',
  storageBucket: 'blooddonorfinder-f1ee8.firebasestorage.app',
  messagingSenderId: '430281603888',
  appId: '1:430281603888:web:01b912c2be4fff2f1de6f5',
  measurementId: 'G-0ZH306S2BS',
});

firebase.messaging();
