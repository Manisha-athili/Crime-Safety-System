// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// // Firebase Config
// const firebaseConfig = {
//     apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
//     authDomain: "crime-and-safety.firebaseapp.com",
//     projectId: "crime-and-safety",
//     storageBucket: "crime-and-safety.appspot.com",
//     messagingSenderId: "167045576983",
//     appId: "1:167045576983:web:4b19f62d9f0268af565f52",
//     measurementId: "G-QRL88H2M6Q"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// // Login Button Event Listener
// document.getElementById('signin').addEventListener('click', signin);

// async function signin() {
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     let messageBox = document.getElementById("message");

//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const userId = user.uid;

//         // Fetch User Role from Firestore
//         const userDoc = await getDoc(doc(db, "users", userId));

//         if (userDoc.exists()) {
//             const userData = userDoc.data();
//             const role = userData.role || "user"; // Default to 'user'

//             // Store in Local Storage
//             localStorage.setItem("userId", userId);
//             localStorage.setItem("userRole", role);

//             console.log("User Logged in as:", role);

//             alert("Logged in successfully!");

//             // Redirect Based on Role
//             if (role === "admin" || role === "officer") {
//                 window.location.href = "/crime-safety/admin-dashboard.html"; 
//             } else {
//                 window.location.href = "/crime-safety/dashboard/dashboard.html";
//             }
//         } else {
//             messageBox.innerText = "User data not found!";
//         }
//     } catch (error) {
//         if (error.code === "auth/user-not-found") {
//             messageBox.innerText = "No account found. Please sign up.";
//         } else if (error.code === "auth/wrong-password") {
//             messageBox.innerText = "Incorrect password. Try again.";
//         } else {
//             messageBox.innerText = error.message;
//         }
//     }
// }
// // 