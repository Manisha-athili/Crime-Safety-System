// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
  authDomain: "crime-and-safety.firebaseapp.com",
  projectId: "crime-and-safety",
  storageBucket: "crime-and-safety.appspot.com",
  messagingSenderId: "167045576983",
  appId: "1:167045576983:web:4b19f62d9f0268af565f52",
  measurementId: "G-QRL88H2M6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Accessing Buttons
let loginBtn = document.getElementById('signin');
if (loginBtn) loginBtn.addEventListener('click', loginUser);

// 🔹 Login Function
async function loginUser() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    let messageBox = document.getElementById("message");

    // Empty field validation
    if (!email || !password) {
        messageBox.innerText = "⚠️ Please enter email and password.";
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userId = user.uid;

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", userId));
        let role = "user"; // Default role
        if (userDoc.exists()) {
            role = userDoc.data().role || "user";
        }

        // Store User ID and Role in Local Storage
        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", role);

        messageBox.innerText = "✅ Login Successful ! Redirecting...";
        
        // Redirect based on role
        setTimeout(() => {
            if (role === "admin") {
                window.location.href = "../adminDashboard/adminDashboard.html";
            } else if (role === "officer") {
                window.location.href = "../officerDasboard/officerDashboard.html";
            } else if (role === "user") {
                window.location.href = "/index.html";
                console.log("hello")
            }
        }, 1500);
    } catch (error) {
        console.error("Login error:", error);
        if (error.code === "auth/user-not-found") {
            messageBox.innerText = "No account found. Please sign up.";
        } else if (error.code === "auth/wrong-password") {
            messageBox.innerText = "Incorrect password. Try again.";
        } else {
            messageBox.innerText = `⚠️ ${error.message}`;
        }
    }
}
