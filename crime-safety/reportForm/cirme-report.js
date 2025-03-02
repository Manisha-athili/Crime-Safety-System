import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const crimeForm = document.getElementById("crimeForm");
const crimeList = document.getElementById("crimeList");
const getLocationBtn = document.getElementById("getLocation");
const locationDisplay = document.getElementById("locationDisplay");

// Get User UID
let userId;
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
        loadCrimeReports();
    } else {
        window.location.href = "/index.html"; // Redirect if not logged in
    }
});

// 🔹 Handle Location Fetching
getLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById("latitude").value = position.coords.latitude;
            document.getElementById("longitude").value = position.coords.longitude;
            locationDisplay.innerText = `Location: ${position.coords.latitude}, ${position.coords.longitude}`;
        }, (error) => {
            alert("Error fetching location: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});


// 🔹 Submit Crime Report
crimeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const crimeType = document.getElementById("crimeType").value;
    const crimeDescription = document.getElementById("crimeDescription").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    if (!crimeType || !crimeDescription || !latitude || !longitude) {
        alert("Please fill all fields and get location.");
        return;
    }

    try {
        await addDoc(collection(db, "reports"), {
            crimeType,
            crimeDescription,
            latitude,
            longitude,
            userId,
            timestamp: new Date().toISOString()
        });
        alert("Crime report submitted successfully!");
        crimeForm.reset();
        locationDisplay.innerText = "Location: Not Set";
        loadCrimeReports();
    } catch (error) {
        console.error("Error submitting crime report:", error);
    }
});

// 🔹 Load Crime Reports
crimeList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
        const reportId = e.target.dataset.id;
        const newCrimeType = prompt("Enter new crime type:");
        const newCrimeDescription = prompt("Enter new crime description:");

        if (newCrimeType && newCrimeDescription) {
            await updateDoc(doc(db, "reports", reportId), {
                crimeType: newCrimeType,
                crimeDescription: newCrimeDescription
            });
            alert("Report updated!");
            loadCrimeReports();
        }
    }
});

async function loadCrimeReports() {
    crimeList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "reports"));
    
    querySnapshot.forEach((docData) => {
        const report = docData.data();
        const reportId = docData.id;
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${report.crimeType}</strong> - ${report.crimeDescription} 
            (Location: ${report.latitude}, ${report.longitude})
            ${report.userId === userId ? `<button class="edit-btn" data-id="${reportId}">Edit</button>` : ""}
        `;
        crimeList.appendChild(li);
    });
}


// 🔹 Edit Crime Report
async function editReport(reportId) {
    const newCrimeType = prompt("Enter new crime type:");
    const newCrimeDescription = prompt("Enter new crime description:");

    if (newCrimeType && newCrimeDescription) {
        await updateDoc(doc(db, "reports", reportId), {
            crimeType: newCrimeType,
            crimeDescription: newCrimeDescription
        });
        alert("Report updated!");
        loadCrimeReports();
    }
}


// 

window.onload = () => {
    initMap();
};

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: { lat: 20.5937, lng: 78.9629 } // Default center (India)
    });

    navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        map.setCenter(userLocation);

        new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location"
        });
    });
}

