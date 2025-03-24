// Import Firebase libraries
import firebase from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js';
import 'https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js';
import 'firebase/messaging';
import { getMessaging } from 'https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js';


// 🚀 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
  authDomain: "crime-and-safety.firebaseapp.com",
  projectId: "crime-and-safety",
  storageBucket: "crime-and-safety.appspot.com",
  messagingSenderId: "167045576983",
  appId: "1:167045576983:web:4b19f62d9f0268af565f52",
  measurementId: "G-QRL88H2M6Q"
};

const app = initializeApp(firebaseConfig);
// const messaging = firebase.messaging();
const messaging = getMessaging(app);


// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message: ', payload);
    const notificationTitle = 'Crime & Safety Alert';
    const notificationOptions = {
      body: payload.body,
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });