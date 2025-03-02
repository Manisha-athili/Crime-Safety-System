// fireBase 
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
    // const analytics = getAnalytics(app);
    const auth = getAuth(app); // copied form doc
    const db = getFirestore(app);  // Firestore Database Instance


// accessing btn 
let btn1 = document.getElementById('signin1');
let btn2 = document.getElementById('guestLogin');

btn1.addEventListener('click',signIn)
btn2.addEventListener('click',guestLogin)

// 🔹 Email Validation Function
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// 🔹 Sign Up / Registration Function
function signIn(){
    // alert("hello");
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    let messageBox = document.getElementById("message");
    // var Confirm_password = document.getElementById('con_password').value;
    // console.log(email);
    // console.log(password);

    // Validate Email Before Registering
    if (!isValidEmail(email)) {
      messageBox.innerText = "Please enter a valid email address.";
      return;
  }

const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
  .then(async(userCredential) => {
    // Signed up 
    const user = userCredential.user;
    const userId = user.uid; // Get Firebase UID

    // Store User ID & Info in Firestore
    await setDoc(doc(db, "users", userId), {
        email: email,
        uid: userId,
        createdAt: new Date().toISOString()
    });

    alert("Registration Successful! Your UID: " + userId);
    localStorage.setItem(userId)
    alert("Registration Successful!");
    window.location.href = "/crime-safety/dashboard/dashboard.html";
  })
  .catch((error) => {
    if (error.code === "auth/email-already-in-use") {
        if (confirm(" This email is already registered. Do you want to log in instead?")) {
            window.location.href = "/index.html";  // Redirect to login page
        }
    } else {
        messageBox.innerText = "" + error.message;
    }
});
           

}
function guestLogin() {
    // auth.signInAnonymously(auth)
    signInAnonymously(auth)
        .then(() => {
            alert("Logged in as Guest");
             window.location.href = "/crime-safety/dashboard/dashboard.html"; // Redirect guest
        })
        .catch((error) => {
            document.getElementById("message").innerText = error.message;
        });
}
// D:\10KCoders\Crime & Safety Reporting System\dashboard\dashboard.html