// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// // Firebase Configuration (Use the same config)
// const firebaseConfig = {
//     apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
//     authDomain: "crime-and-safety.firebaseapp.com",
//     projectId: "crime-and-safety",
//     storageBucket: "crime-and-safety.appspot.com",
//     messagingSenderId: "167045576983",
//     appId: "1:167045576983:web:4b19f62d9f0268af565f52"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// // Initialize the map
// const map = L.map("map").setView([20.5937, 78.9629], 5); // Default: Center of India

// // Add OpenStreetMap tiles
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "© OpenStreetMap contributors"
// }).addTo(map);

// // Fetch and display reports on the map
// async function loadCrimeReports() {
//     try {
//         const querySnapshot = await getDocs(collection(db, "crimeReports"));
//         querySnapshot.forEach((doc) => {
//             const data = doc.data();
//             if (data.latitude && data.longitude) {
//                 // Create a marker on the map for each crime
//                 L.marker([data.latitude, data.longitude])
//                     .addTo(map)
//                     .bindPopup(`<b>${data.crimeType}</b><br>${data.description}<br><small>${data.datetime}</small>`);
//             }
//         });
//     } catch (error) {
//         console.error("Error loading reports:", error);
//     }
// }

// Load crime reports when the page loads
loadCrimeReports();
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration (Use the same config)
const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize the map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Default: Center of India

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Fetch and display reports on the map
async function loadCrimeReports() {
    try {
        const querySnapshot = await getDocs(collection(db, "crimeReports"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.latitude && data.longitude) {
                // Create a marker on the map for each crime
                L.marker([data.latitude, data.longitude])
                    .addTo(map)
                    .bindPopup(`<b>${data.crimeType}</b><br>${data.description}<br><small>${data.datetime}</small>`);
            }
        });
    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// Load crime reports when the page loads
loadCrimeReports();
