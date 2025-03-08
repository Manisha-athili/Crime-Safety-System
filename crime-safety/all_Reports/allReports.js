import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
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
const auth = getAuth(app);

const allReportsContainer = document.getElementById("allReportsContainer");

async function loadAllReports() {
    allReportsContainer.innerHTML = "<p>Loading reports...</p>";

    try {
        const reportsQuery = query(collection(db, "crimeReports"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(reportsQuery);

        allReportsContainer.innerHTML = ""; // Clear loading message

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const reportCard = document.createElement("div");
            reportCard.className = "card";

            const imageHTML = data.image ? `<img src="${data.image}" style="max-width: 200px;">` : "";

            reportCard.innerHTML = `
                <h3>${data.crimeType}</h3>
                <p><strong>Description:</strong> ${data.description}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                <p><strong>Date & Time:</strong> ${data.datetime}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                ${imageHTML}
            `;
            allReportsContainer.appendChild(reportCard);
        });

    } catch (error) {
        console.error("Error fetching reports:", error);
        allReportsContainer.innerHTML = "<p>Error loading reports.</p>";
    }
}

// Ensure the user is authenticated before loading reports
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadAllReports();
    } else {
        allReportsContainer.innerHTML = "<p>You need to log in to view reports.</p>";
    }
});
