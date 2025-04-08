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

// Accessing Buttons
let btn1 = document.getElementById('signup');
let btn2 = document.getElementById('guestLogin');

if (btn1) btn1.addEventListener('click', signUp);
if (btn2) btn2.addEventListener('click', guestLogin);

// 🔹 Email Validation Function
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// 🔹 Sign Up / Registration Function
async function signUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    let messageBox = document.getElementById("message");

    // Validate Email Before Registering
      // Empty field validation
      if (!email || !password) {
        messageBox.innerText = " Please enter email and password.";
        return;
    }

    //  Validate email format
    if (!isValidEmail(email)) {
        messageBox.innerText = " Invalid email format!";
        return;
    }

    // Password length validation
    if (password.length < 6) {
        messageBox.innerText = "Password must be at least 6 characters long!";
        return;
    }
    if (!email.trim() || !password.trim()) {
        messageBox.innerText = "Please enter email and password.";
        return;
    }
    

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userId = user.uid;
           // Assign default role
        const role = "user"; // Default role

            // Store User ID & Info in Firestore with a role
            await setDoc(doc(db, "users", userId), {
                email: email,
                uid: userId,
                role: role, 
                createdAt: new Date().toISOString()
            })
        // Send registration email via EmailJS
            emailjs.send("service_wm552h5", "template_4do5hv8", { 
                email: email,
                uid: userId,
                role: role, 
                createdAt: new Date().toISOString()
            })
            .then(function(response) {
                console.log("Email sent successfully!", response.status, response.text);
            })
            .catch(function(error) {
                console.error("Failed to send email:", error);
            });
            
    

            // Store User ID and Role in Local Storage
            localStorage.setItem("userId", userId);
            localStorage.setItem("userRole", role);

            
        messageBox.innerText = "Registration Successful! Redirecting...";
        // setTimeout(() => window.location.href = "../index.html", 2000);
        setTimeout(() => {
            if (confirm("Would you like to complete your profile now?")) {
                window.location.href = "/profile/profile.html";
            } else {
                // You can redirect elsewhere or keep them on the same page
                window.location.href = "../index.html";
            }
        }, 1000);

     

        }
        catch (error) {
            console.error("Sign-up error:", error);
            if (error.code === "auth/email-already-in-use") {
                if (confirm("This email is already registered. Do you want to log in instead?")) {
                    window.location.href = "../login/login.html";
                }
            } else {
                messageBox.innerText = `${error.message}`;
            }
        }
}


// 🔹 Guest Login Function
function guestLogin( ) {
    let messageBox = document.getElementById("message");

    signInAnonymously(auth)
        .then((userCredential) => {
            const user = userCredential.user;

            localStorage.setItem("userId", user.uid);
            localStorage.setItem("userRole", "guest"); // Assign a guest role

            alert("Logged in as Guest. Redirecting...");
            messageBox.innerText = "Logged in as Guest. Redirecting...";

            setTimeout(() => window.location.href = "../index.html", 2000); 
        })
        .catch((error) => {
            console.error("Guest login error:", error);
            if (messageBox) {
                messageBox.innerText = error.message;
            }
        });
}

