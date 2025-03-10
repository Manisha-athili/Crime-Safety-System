// navigator.geolocation.getCurrentPosition((position) => {
//     const reportData = {
//         description: "Robbery near ABC Road",
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         timestamp: firebase.firestore.FieldValue.serverTimestamp()
//     };

//     console.log("Reporting crime at: ", reportData.latitude, reportData.longitude);
    

//     firebase.firestore().collection("reports").add(reportData)
//         .then(() => alert("Crime reported successfully!"))
//         .catch((error) => console.error("Error reporting crime: ", error));
// }, (error) => {
//     console.error("Error getting location: ", error);
//     alert("Please enable location access to report a crime.");
    
    
// });

// map.on('click', function (e) {
//     let lat = e.latlng.lat;
//     let lng = e.latlng.lng;

//     let description = prompt("Enter crime details:");
//     if (description) {
//         firebase.firestore().collection("reports").add({
//             description: description,
//             latitude: lat,
//             longitude: lng,
//             timestamp: firebase.firestore.FieldValue.serverTimestamp()
//         })
//         .then(() => alert("Crime reported successfully!"))
//         .catch((error) => console.error("Error reporting crime: ", error));
//     }
// });



// function loadCrimeReports() {
//     firebase.firestore().collection("reports").get().then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//             const data = doc.data();
//             if (data.latitude && data.longitude) {
//                 addCrimeMarker(data.latitude, data.longitude, data.description, data.timestamp);
//             }
//         });
//     });
// }


// ✅ Initialize Firebase (Replace with your actual config)

    const firebaseConfig = {
        apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
        authDomain: "crime-and-safety.firebaseapp.com",
        projectId: "crime-and-safety",
        storageBucket: "crime-and-safety.appspot.com",
        messagingSenderId: "167045576983",
        appId: "1:167045576983:web:4b19f62d9f0268af565f52",
        measurementId: "G-QRL88H2M6Q"
    };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Initialize Leaflet Map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Default to India

// ✅ Add OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ✅ Get User Location & Allow Reporting Crimes
document.getElementById("report-btn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const description = prompt("Enter crime details:");

        if (description) {
            db.collection("reports").add({
                description: description,
                latitude: lat,
                longitude: lng,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => alert("Crime reported successfully!"))
            .catch((error) => console.error("Error reporting crime: ", error));
        }
    }, (error) => {
        console.error("Error getting location: ", error);
        alert("Please enable location access to report a crime.");
    });
});

// ✅ Allow Users to Click on Map to Report Crime
map.on('click', function (e) {
    let lat = e.latlng.lat;
    let lng = e.latlng.lng;
    let description = prompt("Enter crime details:");

    if (description) {
        db.collection("reports").add({
            description: description,
            latitude: lat,
            longitude: lng,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => alert("Crime reported successfully!"))
        .catch((error) => console.error("Error reporting crime: ", error));
    }
});

// ✅ Load Crime Reports & Display on Map
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

// ✅ Function to Add Crime Marker on Map
function addCrimeMarker(lat, lng, description) {
    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>Crime Reported:</b> ${description}`)
        .openPopup();
}

// Load previous crime reports when the map loads
loadCrimeReports();


