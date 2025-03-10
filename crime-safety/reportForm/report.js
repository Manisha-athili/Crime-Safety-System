import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    databaseURL: "https://crime-and-safety-default-rtdb.firebaseio.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Check user authentication state
const auth = getAuth(app);
let currentUser = null;
let userRole = "user"; // Default role



// Check User Authentication and Fetch Role
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", user.uid);
        
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            userRole = userDoc.data().role;
            localStorage.setItem("userRole", userRole);
            console.log("User Role:", userRole);
        } else {
            userRole = "user"; // Default role
        }
    } else {
        console.log("No user logged in.");
        currentUser = null;
        userRole = "user";
    }
    loadReports();
});

// Handle Image Upload (Base64 Conversion)
const imageInput = document.getElementById("crimeImage");
const previewImage = document.getElementById("previewImage");
let base64Image = "";  // Variable to store Base64 image 

// Convert Image to Base64
imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            base64Image = e.target.result;  // Store Base64 image
            previewImage.src = base64Image;
            previewImage.style.display = "block";  // Show the image preview
        };
        reader.readAsDataURL(file);  // Convert to Base64
    }
});

// Handle Crime Report Submission with Location
document.getElementById("crimeForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    
    if (!currentUser) {
        alert("You need to log in to report a crime.");
        return;
    }

  
    const crimeType = document.getElementById("crimeType").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const datetime = document.getElementById("datetime").value;
    // const userId = localStorage.getItem("userId");
    const status = "pending";

    alert(status);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log("Location retrieved:", lat, lng); // Debugging log
        },
        (error) => {
            console.error("Error getting location:", error);
            alert("Location access denied or unavailable. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Add options for better accuracy
    );
    



    try {
        // Add report to Firestore
        await addDoc(collection(db, "crimeReports"), {
            crimeType,
            description,
            location,
            datetime,
            status,
            // userId,
            userId: currentUser.uid, // Store the user ID
            timestamp: serverTimestamp(),
            image: base64Image,// image
            latitude: lat,   // ✅ Store Latitude
            longitude: lng   // ✅ Store Longitude
        });

        // Reset form and hide preview
        document.getElementById("crimeForm").reset();
        previewImage.style.display = "none";
        base64Image = "";  // Reset Base64 image variable

        // Reload reports to include the new submission
        loadReports();
    
    } catch (error) {
        console.error("Error adding report:", error);
        console.error("Error getting location:", error);
        alert("Location access denied. Please enable location services to report crimes.");
    }
    });


// Fetch and display reports
async function loadReports() {
    const myReportsContainer = document.getElementById("myReportsContainer");
    const allReportsContainer = document.getElementById("otherReportsContainer");

    myReportsContainer.innerHTML = "";
    allReportsContainer.innerHTML = "";

    // const userId = localStorage.getItem("userId");
    // const userRole = localStorage.getItem("userRole");

    // const userReportsQuery = query(collection(db, "crimeReports"), where("userId", "==", userId));
    // const allReportsQuery = query(collection(db, "crimeReports"), orderBy("timestamp","desc"));

    const userReportsQuery = query(collection(db, "crimeReports"), where("userId", "==", currentUser?.uid || ""));
    const allReportsQuery = query(collection(db, "crimeReports"), orderBy("timestamp", "desc"));

    const userReports = await getDocs(userReportsQuery);
    const allReports = (userRole === "admin" || userRole === "officer") ? await getDocs(allReportsQuery) : [];

    userReports.forEach(doc => createReportCard(doc, myReportsContainer, false));
    allReports.forEach(doc => createReportCard(doc, allReportsContainer, true));
}

// creating cards
function createReportCard(doc, container, allowEdit) {
    const data = doc.data();
    const reportCard = document.createElement("div");
    reportCard.className = "card";

    // Ensure Base64 images are displayed correctly
    const imageHTML = data.image ? `<img src="${data.image}" style="max-width: 200px;">` : "";

    reportCard.innerHTML = `
        <h3>${data.crimeType}</h3>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Date & Time:</strong> ${data.datetime}</p>
        <p><strong>Latitude:</strong> ${data.latitude}</p>
        <p><strong>Longitude:</strong> ${data.longitude}</p>
        <p><strong>Status:</strong> <span id="status-${doc.id}">${data.status}</span></p>
        ${imageHTML}
        ${allowEdit ? `
            <button onclick="updateStatus('${doc.id}', 'In Progress')">Mark In Progress</button>
            <button onclick="updateStatus('${doc.id}', 'Resolved')">Mark Resolved</button>
        ` : ''}
    `;
    container.appendChild(reportCard);
}

// Update Report Status (Admin & Officers Only)
async function updateStatus(reportId, status) {
    if (userRole !== "admin" && userRole !== "officer") {
        alert("You don't have permission to update the report status.");
        return;
    }

    try {
        await updateDoc(doc(db, "crimeReports", reportId), { status });
        document.getElementById(`status-${reportId}`).innerText = status;
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// Load Reports on Page Load
loadReports();

// ✅ Expose the function to be accessible in the global scope
window.updateStatus = updateStatus;