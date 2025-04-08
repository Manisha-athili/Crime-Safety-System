import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged , setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


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

// / Set authentication persistence (keeps users logged in)
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Auth persistence enabled"))
    .catch((error) => console.error("Error setting persistence:", error));



//  Get User Role Securely from Firestore
async function getUserRole(user) {
    if (!user) return null;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().role : null;
}


//  Crime Report function
async function report() {
    try {
        const user = auth.currentUser;
        if (user) {
            // Check if user is verified if you have email verification
            window.location.href = "./crime-safety/reportForm/crime-report.html";
        } else {
            const proceed = confirm("You need to login to report a crime. Proceed to login page?");
            if (proceed) {
                window.location.href = "./loginIn/login.html";
            }
        }
    } catch (error) {
        console.error("Error in report function:", error);
        alert("An error occurred. Please try again later.");
    }
}

//  Add event listener when DOM loads
document.addEventListener("DOMContentLoaded", function() {
    const reportButton = document.getElementById("crimeReport");
    reportButton.addEventListener("click", function(e) {
        e.preventDefault();
        report();
    });
});



// Handle Authentication & Role-based Redirection
onAuthStateChanged(auth, async (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        // Prevent logged-in users from accessing the login page
        if (currentPath.includes("login.html")) {
            window.location.href = "index.html";
            return;
        }

        if (!localStorage.getItem("redirected")) {
            const role = await getUserRole(user);
            localStorage.setItem("userRole", role);

            try {
                
                localStorage.setItem("redirected", "true");

                // Redirect based on role
                if (role === "officer" && !currentPath.includes("officer.html")) {
                    window.location.href = "officer.html";
                } else if (role !== "officer" && !currentPath.includes("index.html")) {
                    document.getElementById("logoutBtn")?.classList.remove("hide-btn");
                    window.location.href = "index.html";
                }
            } catch (error) {
                console.error("Error handling", error);
            }
        }
    } else {
        // Remove stored user data
        localStorage.removeItem("userRole");
        localStorage.removeItem("redirected");

        // Redirect unauthenticated users from restricted pages
        if (currentPath.includes("profile.html") || currentPath.includes("crime-report.html")) {
            window.location.href = "loginIn/login.html";
        }
    }
});

// My profile or Login is in 


