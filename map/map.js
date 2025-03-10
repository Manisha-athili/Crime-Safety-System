// Firebase Firestore Reference
const db = firebase.firestore();

// Initialize Leaflet Map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Default center (India)

// Add OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load Crime Reports from Firestore
function loadCrimeReports() {
    db.collection("reports").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.latitude && data.longitude) {
                addCrimeMarker(data.latitude, data.longitude, data.description);
            }
        });
    });
}

// Function to Add Crime Marker on Map
function addCrimeMarker(lat, lng, description) {
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>Crime Reported:</b> ${description}`)
        .openPopup();
}

// Load crimes when the page opens
loadCrimeReports();
