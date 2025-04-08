import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("authButton");

    onAuthStateChanged(auth, user => {
        if (authButton) {
            if (user) {
                authButton.textContent = "My Profile";
                authButton.href = "/profile/profile.html";
            } else {
                authButton.textContent = "Login / Signup";
                authButton.href = "/loginIn/login.html";
            }
        }
    });
});