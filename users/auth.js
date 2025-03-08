import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const role = userDoc.data().role;

        // Store UID and role in localStorage
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("userRole", role);

        console.log("User logged in as:", role);
    } else {
        console.error("User role not found");
    }
}
