import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const allReportsQuery = query(collection(db, "crimeReports"), orderBy("timestamp", "desc"));
const allReports = await getDocs(allReportsQuery);

allReports.forEach(doc => createReportCard(doc, allReportsContainer, true));



function createReportCard(doc, container, allowEdit) {
    const data = doc.data();
    const reportCard = document.createElement("div");
    reportCard.className = "card";

    reportCard.innerHTML = `
        <h3>${data.crimeType}</h3>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Date & Time:</strong> ${data.datetime}</p>
        <p><strong>Status:</strong> <span id="status-${doc.id}">${data.status}</span></p>
        ${allowEdit ? `
            <button onclick="updateStatus('${doc.id}', 'In Progress')">Mark In Progress</button>
            <button onclick="updateStatus('${doc.id}', 'Resolved')">Mark Resolved</button>
        ` : ''}
    `;
    container.appendChild(reportCard);
}










// Initialize Firebase Auth & Firestore
const auth = getAuth();
const db = getFirestore();

// Check User Role & Redirect Unauthorized Users
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
        alert("Access Denied! Only Admins can access this page.");
        window.location.href = "index.html"; // Redirect non-admin users
    }
});

// Load Users into Table
async function loadUsers() {
    const userTableBody = document.getElementById("userTableBody");
    userTableBody.innerHTML = ""; // Clear previous data

    const querySnapshot = await getDocs(collection(db, "users"));
    let users = [];

    querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });

    displayUsers(users);
}

// Display Users with Pagination
let currentPage = 1;
const rowsPerPage = 5;
let allUsers = [];

function displayUsers(users) {
    allUsers = users;
    updateTable();
}

function updateTable() {
    const userTableBody = document.getElementById("userTableBody");
    userTableBody.innerHTML = "";

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedUsers = allUsers.slice(start, end);

    paginatedUsers.forEach((user) => {
        let row = `<tr>
            <td>${user.id}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>`;
        userTableBody.innerHTML += row;
    });

    document.getElementById("pageNumber").innerText = currentPage;
}

// Pagination Controls
document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});

document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage * rowsPerPage < allUsers.length) {
        currentPage++;
        updateTable();
    }
});

// Search Functionality
document.getElementById("search").addEventListener("input", (event) => {
    let searchText = event.target.value.toLowerCase();
    let filteredUsers = allUsers.filter((user) => user.email.toLowerCase().includes(searchText));
    displayUsers(filteredUsers);
});

// Filter by Role
document.getElementById("filterRole").addEventListener("change", (event) => {
    let selectedRole = event.target.value;
    let filteredUsers = selectedRole ? allUsers.filter((user) => user.role === selectedRole) : allUsers;
    displayUsers(filteredUsers);
});

// Delete User
async function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        await deleteDoc(doc(db, "users", userId));
        alert("User deleted successfully.");
        loadUsers();
    }
}

// Export to Excel
document.getElementById("exportExcel").addEventListener("click", () => {
    let table = document.querySelector(".table");
    let ws = XLSX.utils.table_to_sheet(table);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
});

// Export to PDF
document.getElementById("exportPDF").addEventListener("click", () => {
    let docDefinition = {
        content: [
            { text: "User List", style: "header" },
            {
                table: {
                    body: [
                        ["ID", "Email", "Role"],
                        ...allUsers.map((user) => [user.id, user.email, user.role]),
                    ],
                },
            },
        ],
    };
    pdfMake.createPdf(docDefinition).download("users.pdf");
});

// Load Users on Page Load
window.onload = loadUsers;
