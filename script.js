import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getMessaging, getToken, isSupported } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging.js";

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


let messaging = null;
const initializeMessaging = async () => {
    try {
        const isMessagingSupported = await isSupported();
        if (isMessagingSupported) {
            messaging = getMessaging(app);
            return true;
        }
        console.log('Firebase messaging not supported in this browser');
        return false;
    } catch (err) {
        console.error('Error initializing messaging:', err);
        return false;
    }
};

// 🚀 Register Service Worker
// if ('serviceWorker' in navigator) {
//         console.log("coming into if");
        
//     navigator.serviceWorker.register('firebase-messaging-sw.js')
//     .then(
//       (registration) => {
//         console.log("success");
        
//         console.log("Service worker registration succeeded:", registration.scope);
//       }).catch(
//             (error) => {
//                 console.error(`Service worker registration failed: ${error}`);
//               }
//       )
//   } else {
//     console.error("Service workers are not supported.");
//   }

if ('serviceWorker' in navigator) {
    (async () => {
        try {
            const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
                scope: '/'
            });
            console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    })();
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
    // Initialize messaging only once
    if (!messaging) {
        if (!await initializeMessaging()) {
            console.log('Notifications not supported in this browser');
            return;
        }
    }

    if (Notification.permission === "denied") {
        console.warn("Notifications are blocked. Please enable them in browser settings.");
        return;
    }

    try {
        // If permission is not yet granted, ask the user
        if (Notification.permission === "default") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const token = await getToken(messaging, {
                    vapidKey: "BG9cdOmjzVeLvgGpTFK5-9eunHiIKu4Je6gvnuCfXZGfAjMcGOjWn3JtbSPBQQ_t59Ndy1xDA3bSkUOIsPFzmmM"
                });
                if (token) {
                    await saveTokenToFirestore(token);
                }
            } else {
                console.log("Notification permission denied");
            }
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

        try {
            // Show notification prompt and wait for user interaction
            await requestNotificationPermission();
            localStorage.setItem("redirected", "true");

            // Handle navigation based on role
            const currentPath = window.location.pathname;
            if (role === "officer" && !currentPath.includes("officer.html")) {
                window.location.href = "officer.html";
            } else if (role !== "officer" && !currentPath.includes("index.html")) {
                document.getElementById("logoutBtn")?.classList.remove("hide-btn");
                window.location.href = "index.html";
            }
        } catch (error) {
            console.error("Error handling notifications:", error);
        }
    } else if (!user) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("redirected");
    }
});


// 🚀 Ensure DOM is Loaded Before Running Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("logoutBtn")?.classList.remove("hide-btn");  
    document.getElementById("crimeReport")?.addEventListener("click", report);
});