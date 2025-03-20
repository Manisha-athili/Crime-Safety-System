import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, 
    doc, updateDoc, deleteDoc, where, getDoc 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// ✅ Step 1: Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    databaseURL: "https://crime-and-safety-default-rtdb.firebaseio.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52"
};

// ✅ Step 2: Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let userRole = "user";  // Default role for users

// ✅ Step 3: Check Authentication and Fetch User Role
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", user.uid);
        
        // Get user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            userRole = userDocSnap.data().role || "user";
            localStorage.setItem("userRole", userRole);
            console.log("User Role:", userRole);
        }
        loadReports();  // Load reports after authentication check
    } else {
        console.log("No user logged in.");
        currentUser = null;
        userRole = "user";
    }
});

// ✅ Step 4: Handle Image Upload (Convert to Base64)
const imageInput = document.getElementById("crimeImage");
const previewImage = document.getElementById("previewImage");
let base64Image = "";  

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            base64Image = e.target.result;
            previewImage.src = base64Image;
            previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

// ✅ Step 5: Get User Location (Latitude & Longitude)
// let latitude = "null";
// let longitude = "null";
const locationButton = document.getElementById("getLocation");
// const location = document.getElementById("location");

locationButton.addEventListener("click", getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        alert("clicked location")
        document.getElementById("locationis").innerHTML ="Geolocation accessed"
    } else {
        document.getElementById("locationis").innerHTML = "Geolocation is not supported by this browser.";
    }
}

let lat = null;
let lon = null;

function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    // document.getElementById("locationis").innerHTML = `Latitude: ${lat}, Longitude: ${lon}`;
    alert("location accessed")
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("locationis").innerHTML = "User denied the request for Geolocation.";
            // alert("lacation denied")
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("locationis").innerHTML = "Location information is unavailable.";
            // alert("lacation denied")
            break;
        case error.TIMEOUT:
            document.getElementById("locationis").innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("locationis").innerHTML = "An unknown error occurred.";
            break;
    }
}

// ✅ Step 6: Handle Crime Report Submission
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
    const status = "pending";

    try {
        await addDoc(collection(db, "crimeReports"), {
            crimeType,
            description,
            location,
            datetime,
            status,
            userId: currentUser.uid,
            timestamp: serverTimestamp(),
            image: base64Image,
            lat,
            lon
        });

        document.getElementById("crimeForm").reset();
        previewImage.style.display = "none";
        base64Image = "";

        loadReports();  // Reload reports after adding a new one
    } catch (error) {
        console.error("Error adding report:", error);
    }
});

// ✅ Step 7: Fetch and Display Crime Reports
async function loadReports() {
    if (!currentUser) return;

    const myReportsContainer = document.getElementById("myReportsContainer");
    const allReportsContainer = document.getElementById("otherReportsContainer");

    myReportsContainer.innerHTML = "";
    allReportsContainer.innerHTML = "";

    const userReportsQuery = query(collection(db, "crimeReports"), where("userId", "==", currentUser.uid));
    const allReportsQuery = query(collection(db, "crimeReports"), orderBy("timestamp", "desc"));

    const userReports = await getDocs(userReportsQuery);
    const allReports = [];
    
    if (userRole === "admin" || userRole === "officer") {
        const allReportsSnapshot = await getDocs(allReportsQuery);
        allReportsSnapshot.forEach(doc => allReports.push(doc));
    }

    userReports.forEach(doc => createReportCard(doc, myReportsContainer, false));
    allReports.forEach(doc => createReportCard(doc, allReportsContainer, true));
}

// ✅ Step 8: Create Report Cards
function createReportCard(doc, container, allowEdit) {
    const data = doc.data();
    const reportCard = document.createElement("div");
    reportCard.className = "card";

    const imageHTML = data.image ? `<img src="${data.image}" style="max-width: 200px;">` : "";

    reportCard.innerHTML = `
        <h3>${data.crimeType}</h3>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Date & Time:</strong> ${data.datetime}</p>
        <p><strong>Latitude:</strong> ${data.lat}</p>
        <p><strong>Longitude:</strong> ${data.lon}</p>
        <p><strong>Status:</strong> <span id="status-${doc.id}">${data.status}</span></p>
        ${imageHTML}
        ${allowEdit ? `
            <button onclick="updateStatus('${doc.id}', 'In Progress')">Mark In Progress</button>
            <button onclick="updateStatus('${doc.id}', 'Resolved')">Mark Resolved</button>
        ` : ''}
    `;
    container.appendChild(reportCard);
}

// Expose function globally
window.updateStatus = updateStatus;
// window.getLocation = getLocation;

// Load Reports when Page Loads
loadReports();
