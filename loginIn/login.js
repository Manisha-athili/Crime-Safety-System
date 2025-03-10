// // Purpose: To login the user
// // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";


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
const auth = getAuth(app); // copied form doc

let btn1 = document.getElementById('signin')
btn1.addEventListener('click',signin)
function signin(){

var email = document.getElementById('email').value;
var password = document.getElementById('password').value;
let messageBox = document.getElementById("message");

// var Confirm_password = document.getElementById('con_password').value;
console.log(email);
console.log(password);

signInWithEmailAndPassword(auth, email, password)
.then((userCredential) => {
// Signed in 
const user = userCredential.user;
alert("Logged in successfully!");
window.location.href ="../index.html";
})
.catch((error) => {
if (error.code === "auth/user-not-found") {
  messageBox.innerText = "No account found. Please sign up.";
} else if (error.code === "auth/wrong-password") {
  messageBox.innerText = "Incorrect password. Try again.";
} else {
  messageBox.innerText = error.message, "some..error";
}
});
}



// async function signin() {
//     var email = document.getElementById('email').value;
//     var password = document.getElementById('password').value;
//     let messageBox = document.getElementById("message");

//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         // Fetch user role from Firestore
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//             const userData = userDoc.data();
//             const role = userData.role;

//             // Store role in Local Storage
//             localStorage.setItem("userId", user.uid);
//             localStorage.setItem("userRole", role);

//             alert("Logged in successfully!");

//             // Redirect based on role
//             if (role === "admin") {
//                 window.location.href = "adminDashboard.html";
//             } else if (role === "officer") {
//                 window.location.href = "officerDashboard.html";
//             } else {
//                 window.location.href = "index.html";
//             }
//         } else {
//             messageBox.innerText = "⚠️ No account found. Please sign up.";
//         }
//     } catch (error) {
//         if (error.code === "auth/user-not-found") {
//             messageBox.innerText = "No account found. Please sign up.";
//         } else if (error.code === "auth/wrong-password") {
//             messageBox.innerText = "Incorrect password. Try again.";
//         } else {
//             messageBox.innerText = `⚠️ ${error.message}`;
//         }
//     }
// }
