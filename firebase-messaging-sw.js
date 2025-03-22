importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52",
    measurementId: "G-QRL88H2M6Q"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
        body: payload.notification?.body || "You have a new message.",
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
