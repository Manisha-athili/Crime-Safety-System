import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase Config
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
const db = getFirestore(app);  // Initialize Firestore
const auth = getAuth(app);     // Initialize Auth

// Redirect if not officer
document.addEventListener("DOMContentLoaded", async function () {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "officer") {
        alert("Access Denied! Redirecting...");
        window.location.href = "index.html";
    }

    listenToCrimeReports(); // 🔥 Real-time listener
});

// Real-time listener for crime reports
function listenToCrimeReports() {
    const reportsContainer = document.getElementById("reports-container");
    
    onSnapshot(collection(db, "crimeReports"), (snapshot) => {
        reportsContainer.innerHTML = ""; // Clear existing reports
        
        snapshot.forEach((docData) => {
            const report = docData.data();

            const card = document.createElement("div");
            card.classList.add("report-card");

            card.innerHTML = `
                <h3>${report.crimeType}</h3>
                <p><strong>Location:</strong> ${report.location || "Not Provided"}</p>
                <p><strong>Description:</strong> ${report.description}</p>
                <p><strong>Status:</strong> 
                    <select class="status-dropdown" data-id="${docData.id}">
                        <option value="Pending" ${report.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="In Progress" ${report.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Resolved" ${report.status === "Resolved" ? "selected" : ""}>Resolved</option>
                    </select>
                </p>
            `;

            reportsContainer.appendChild(card);
        });

        // Attach event listeners after rendering
        document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
            dropdown.addEventListener("change", async function () {
                const reportId = this.getAttribute("data-id");
                const newStatus = this.value;
                await updateReportStatus(reportId, newStatus);
            });
        });
    });
}

// Update report status and reflect for users instantly
async function updateReportStatus(reportId, newStatus) {
    await updateDoc(doc(db, "crimeReports", reportId), { status: newStatus });
    alert("Report status updated!");
}

// Logout function
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logout success");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        window.location.href = "login.html";
    });
});
