// Import necessary Firebase SDKs
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
  authDomain: "crime-and-safety.firebaseapp.com",
  projectId: "crime-and-safety",
  storageBucket: "crime-and-safety.appspot.com",
  messagingSenderId: "167045576983",
  appId: "1:167045576983:web:4b19f62d9f0268af565f52",
  measurementId: "G-QRL88H2M6Q"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages (if your app needs this)
messaging.setBackgroundMessageHandler(function(payload) {
  const notificationTitle = "New Notification";
  const notificationOptions = {
    body: payload.data.status,
    icon: '/firebase-logo.png'  // Optional: notification icon
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
