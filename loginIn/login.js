// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc,setDoc, 
    serverTimestamp  } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
let loginBtn = document.getElementById('login');
if (loginBtn) loginBtn.addEventListener('click', loginUser);

// 🔹 Login Function
async function loginUser() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    let messageBox = document.getElementById("message");

    // Empty field validation
    if (!email || !password) {
        messageBox.innerText = "Please enter email and password.";
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userId = user.uid;

        // detailes of officer01 and officer02 by which we can login as officer
        const officer1 = "CSRS.2025.01@gmail.com";
        const password1 = "officer01";
        // const uid1 = "3L2FSUK2ewfZeJY5a6Tp8ajjSPv1";
        
        const officer2 = "officerCSR202502@gmail.com";
        // const uid2 = "x75JiCmglKMtHo0RddCnPGSxHWD3";
        const password2 = "officer02";

        let role = "user"; // Default role
        
        // Check if this is one of our known officer accounts
        if (email === officer1 && password === password1) {
            role = "officer";
        } else if (email === officer2 && password === password2) {
            role = "officer";
        } else {
            // For other accounts, check Firestore for their role
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists() && userDoc.data().role) {
                role = userDoc.data().role;
            }
        }

        // After successful login, update the user's role in Firestore if needed
        // This ensures database consistency
        if (role === "officer") {
            await setDoc(doc(db, "users", userId), {
                email: email,
                role: "officer",
                // Don't overwrite other fields
                lastLogin: serverTimestamp()
            }, { merge: true }); // merge: true keeps existing fields
        }
      
          // Store User ID and Role in Local Storage
          localStorage.setItem("userId", userId);
          localStorage.setItem("userRole", role);
        
        // Redirect based on role
        // setTimeout(() => {
                if (role === "officer") {
                    window.location.href = "../officerDasboard/officerDashboard.html";
                } else if (role === "user") {

                    window.location.href = "../index.html";
                }
            // }, 1500);
            } catch (error) {
            console.error("Login error:", error);
            if (error.code === "auth/user-not-found") {
                messageBox.innerText = "No account found. Please sign up.";
            } else if (error.code === "auth/wrong-password") {
                messageBox.innerText = "Incorrect password. Try again.";
            } else {
                messageBox.innerText = "Credentials are invalid.";
            }
        }
    }