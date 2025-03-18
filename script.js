import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

// 🚀 Securely fetch user role from Firestore
async function getUserRole(user) {
    if (!user) return null;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? userSnap.data().role : null;
}

// 🔹 Logout function with confirmation
function logout() {
    console.log("Logging out...");
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        signOut(auth)
            .then(() => {
                alert("Logged out successfully");
                localStorage.removeItem("userRole"); // Clear role cache
                window.location.href = "login.html"; // Redirect to login page
            })
            .catch(error => {
                console.error("Logout failed: ", error.message);
            });
    }
}

// 🔹 Crime Report function (Redirects to login if not authenticated)
function report() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "/reportForm/crime-report.html"; // Ensure correct path
        } else {
            alert("Please log in to report a crime.");
            window.location.href = "login.html"; // Redirect to login
        }
    });
}

// 🔹 Set up event listeners after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("crimeReport")?.addEventListener("click", report);
});

// 🔹 Role-Based Access Control (Secure Fetch from Firestore)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const role = await getUserRole(user);
        localStorage.setItem("userRole", role); // Store securely

        // Show dashboards based on role
        if (role === "admin") {
            document.getElementById("user-dashboard").style.display = "none";
            document.getElementById("admin-dashboard").style.display = "block";
        } else if (role === "officer") {
            document.getElementById("user-dashboard").style.display = "none";
            document.getElementById("officer-dashboard").style.display = "block";
        } else {
            document.getElementById("user-dashboard").style.display = "block";
        }
    } else {
        console.warn("No user logged in");
    }
});
