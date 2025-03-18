import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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

// Logout function with confirmation
function logout() {
    console.log("Logging out...");
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        signOut(auth)
            .then(() => {
                alert("Logged out successfully");
                window.location.href = "/loginIn/login.html"; // Redirect to home after logout
            })
            .catch(error => {
                console.error("Logout failed: ", error.message);
            });
    }
}

// Crime Report function (redirects to login if not authenticated)
function report() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in, allow access to report page
            window.location.href = "/crime-safety/reportForm/crime-report.html";
        } else {
            // User not logged in, redirect to login page
            alert("Please log in to report a crime.");
            window.location.href = "loginIn/login.html"; // Update this path if needed
        }
    });
}

// Ensure the DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("crimeReport")?.addEventListener("click", report);
});
// Show different content for different roles.
document.addEventListener("DOMContentLoaded", function () {
  const userRole = localStorage.getItem("userRole");
  if (userRole === "admin") {
      document.getElementById("user-dashboard").style.display = "none";
      document.getElementById("admin-dashboard").style.display = "block";
  } else if (userRole === "officer") {
      document.getElementById("user-dashboard").style.display = "none";
      document.getElementById("officer-dashboard").style.display = "block";
  } else {
      document.getElementById("user-dashboard").style.display = "block";
  }
});
