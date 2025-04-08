// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

// Event listeners for buttons
document.addEventListener('DOMContentLoaded', () => {
    let btn1 = document.getElementById('signup');
    let btn2 = document.getElementById('guestLogin');

    if (btn1) btn1.addEventListener('click', signUp);
    if (btn2) btn2.addEventListener('click', guestLogin);
});

// Display message function to centralize UI feedback
function showMessage(message, isError = false) {
    let messageBox = document.getElementById("message");
    if (messageBox) {
        messageBox.innerText = message;
        messageBox.style.color = isError ? "red" : "green";
    }
}

// Email Validation Function
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Sign Up / Registration Function
async function signUp() {
    var email = document.getElementById('email')?.value?.trim() || "";
    var password = document.getElementById('password')?.value || "";
    
    // Form validation
    if (!email || !password) {
        showMessage("Please enter both email and password.", true);
        return;
    }

    if (!isValidEmail(email)) {
        showMessage("Invalid email format. Please check and try again.", true);
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.", true);
        return;
    }

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userId = user.uid;
        
        // Default role for new users
        const role = "user";
        const timestamp = new Date().toISOString();
        
        // User data object
        const userData = {
            email: email,
            uid: userId,
            role: role,
            createdAt: timestamp
        };

        // Store user data in Firestore
        await setDoc(doc(db, "users", userId), userData);
        
        // Send welcome email - using the EmailJS that's already initialized in your HTML
        try {
            await emailjs.send("service_wm552h5", "template_4do5hv8", userData);
            console.log("Welcome email sent successfully!");
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Non-critical error, continue with registration process
        }
        
        // Save user info to local storage
        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", role);
        
        // Success message
        showMessage("Registration successful! Redirecting...", false);
        
        // Redirect with profile completion option
        setTimeout(() => {
            if (confirm("Would you like to complete your profile now?")) {
                window.location.href = "../profile/profile.html";
            } else {
                window.location.href = "../index.html";
            }
        }, 1500);
        
    } catch (error) {
        console.error("Sign-up error:", error);
        
        if (error.code === "auth/email-already-in-use") {
            showMessage("This email is already registered.", true);
            
            // Offer login option
            setTimeout(() => {
                if (confirm("This email is already registered. Would you like to log in instead?")) {
                    window.location.href = "../loginIn/login.html";
                }
            }, 500);
        } else {
            showMessage(`Registration error: ${error.message}`, true);
        }
    }
}

// Guest Login Function
async function guestLogin() {
    try {
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        
        // Save guest user info
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("userRole", "guest");
        
        showMessage("Logged in as guest. Redirecting...", false);
        
        // Redirect to home page
        setTimeout(() => window.location.href = "../index.html", 1500);
        
    } catch (error) {
        console.error("Guest login error:", error);
        showMessage(`Guest login failed: ${error.message}`, true);
    }
}