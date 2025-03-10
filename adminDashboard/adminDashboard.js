import { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
// Initialize Firebase
const db = getFirestore();
const auth = getAuth();

// Redirect if not admin
document.addEventListener("DOMContentLoaded", async function () {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
        alert("Access Denied! Redirecting...");
        window.location.href = "index.html";
    }

    loadUsers();
    loadCrimeReports();
});

// Load users & allow role updates
async function loadUsers() {
    const userTable = document.getElementById("userTable");
    const usersSnapshot = await getDocs(collection(db, "users"));
    userTable.innerHTML = "";// ✅ Clear table before adding new data
    if (usersSnapshot.empty) {
        userTable.innerHTML = "<tr><td colspan='3'>No users found.</td></tr>";
        return;
    }

    usersSnapshot.forEach((docData) => {
        const user = docData.data();
        const row = `<tr>
            <td>${user.email}</td>
            <td>
                <select onchange="updateUserRole('${docData.id}', this.value)">
                    <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                    <option value="officer" ${user.role === "officer" ? "selected" : ""}>Officer</option>
                    <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                </select>
            </td>
            <td><button onclick="deleteUser('${docData.id}')">Delete</button></td>
        </tr>`;
        userTable.innerHTML += row;
    });
}

window.updateUserRole = async function(userId, newRole) {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    alert("User role updated!");
};


// Delete a user
async function deleteUser(userId) {
    if (confirm("Are you sure?")) {
        await deleteDoc(doc(db, "users", userId));
        alert("User deleted.");
        location.reload();
    }
}

// Load crime reports
async function loadCrimeReports() {
    const reportTable = document.getElementById("reportTable");
    const reportsSnapshot = await getDocs(collection(db, "crimeReports"));

    reportsSnapshot.forEach((docData) => {
        const report = docData.data();
        const row = `<tr>
            <td>${docData.id}</td>
            <td>${report.description}</td>
            <td>${report.status}</td>
            <td><button onclick="deleteReport('${docData.id}')">Delete</button></td>
        </tr>`;
        reportTable.innerHTML += row;
    });
}

// Delete a crime report
async function deleteReport(reportId) {
    if (confirm("Are you sure?")) {
        await deleteDoc(doc(db, "crimeReports", reportId));
        alert("Report deleted.");
        location.reload();
    }
}

// Logout function
function logout() {
    signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = "login.html";
    });
}
