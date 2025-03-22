import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging.js";

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
const db = getFirestore(app);
const messaging = getMessaging(app);

// 🚀 Register Service Worker (Corrected Path)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
    .then((registration) => {
        console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
        console.error('Service Worker registration failed:', error);
    });
} else {
    console.log("Service workers are not supported in this browser.");
}

// 🚀 Get User Role Securely from Firestore
async function getUserRole(user) {
    if (!user) return null;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().role : null;
}

// 🚀 Logout function
function logout() {
    if (window.confirm("Are you sure you want to log out?")) {
        signOut(auth).then(() => {
            alert("Logged out successfully");
            localStorage.removeItem("userRole");
            localStorage.removeItem("redirected");
            window.location.href = "loginIn/login.html";
        }).catch(error => console.error("Logout failed: ", error.message));
    }
}

// 🚀 Crime Report function
function report() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = "crime-safety/reportForm/crime-report.html";
        } else {
            alert("Please log in to report a crime.");
            window.location.href = "loginIn/login.html";
        }
    });
}

// 🚀 Save FCM Token
async function saveTokenToFirestore(token) {
    const user = auth.currentUser;
    if (!user) return;
    const tokenRef = doc(db, 'userTokens', user.uid);
    await setDoc(tokenRef, { token }, { merge: true });
}

// 🚀 Request Notification Permission & Get FCM Token
async function requestNotificationPermission() {
    if (Notification.permission === "denied") {
        console.warn("Notifications are blocked. Please enable them in browser settings.");
        alert("Notifications are blocked. Enable them in your browser settings to receive alerts.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: "BG9cdOmjzVeLvgGpTFK5-9eunHiIKu4Je6gvnuCfXZGfAjMcGOjWn3JtbSPBQQ_t59Ndy1xDA3bSkUOIsPFzmmM"  
            });
            console.log("FCM Token:", token);
            // You can send this token to your backend for future notifications
            if (token) saveTokenToFirestore(token);
        } else {
            console.log("Notification permission denied.");
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
    }
}

// 🚀 Handle Authentication & Role-based Redirection
onAuthStateChanged(auth, async (user) => {
    if (!localStorage.getItem("redirected") && user) {
        const role = await getUserRole(user);
        localStorage.setItem("userRole", role);
        localStorage.setItem("redirected", "true");

        if (role === "officer") {
            window.location.href = "officerDashboard.html";
        } else {
            document.getElementById("logoutBtn")?.classList.remove("hide-btn");
            window.location.href = "index.html";
        }

        // 🚀 Request Notification Permission (ONLY if not already blocked)
        requestNotificationPermission();
    }
});

// 🚀 Ensure DOM is Loaded Before Running Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("logoutBtn")?.classList.remove("hide-btn");  
    document.getElementById("crimeReport")?.addEventListener("click", report);
});
