import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";


// Initialize Firebase
const db = getFirestore();
const auth = getAuth();

// Redirect if not officer
document.addEventListener("DOMContentLoaded", async function () {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "officer") {
        alert("Access Denied! Redirecting...");
        window.location.href = "index.html";
    }

    loadCrimeReports();
});

// Load crime reports
async function loadCrimeReports() {
    const reportTable = document.getElementById("reportTable");
    reportTable.innerHTML = "";  // ✅ Clear existing rows

    const reportsSnapshot = await getDocs(collection(db, "crimeReports"));

    reportsSnapshot.forEach((docData) => {
        const report = docData.data();
        const row = `<tr>
            <td>${docData.id}</td>
            <td>${report.description}</td>
            <td>
                <select onchange="updateReportStatus('${docData.id}', this.value)">
                    <option value="Pending" ${report.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="In Progress" ${report.status === "In Progress" ? "selected" : ""}>In Progress</option>
                    <option value="Resolved" ${report.status === "Resolved" ? "selected" : ""}>Resolved</option>
                </select>
            </td>
        </tr>`;
        reportTable.insertAdjacentHTML("beforeend", row);  // ✅ More efficient than `innerHTML +=`
    });
}


// Update report status
async function updateReportStatus(reportId, newStatus) {
    await updateDoc(doc(db, "crimeReports", reportId), { status: newStatus });
    alert("Report status updated!");
}

// Logout function
function logout() {
    signOut(auth).then(() => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        window.location.href = "login.html";
    });
}
