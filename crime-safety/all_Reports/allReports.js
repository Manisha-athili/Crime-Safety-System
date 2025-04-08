import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, limit, startAfter, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

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

// DOM elements
const allReportsContainer = document.getElementById("allReportsContainer");
const crimeTypeFilter = document.getElementById("crimeTypeFilter");
const statusFilter = document.getElementById("statusFilter");
const locationFilter = document.getElementById("locationFilter");
const nextBtn = document.getElementById("nextPageBtn");
const prevBtn = document.getElementById("prevPageBtn");

// Pagination variables
let lastVisible = null;
const pageSize = 4; // Increased for better UX
let currentPage = 1;
// let totalReports = 0;

// Default images mapping
const DEFAULT_IMAGES = {
    'Theft': '../../asserts/Theft.jpg',
    'Vandalism': '../../asserts/Vandalism.jpg',
    'Assault': '../../asserts/Assault.jpeg',
    'Fraud': '../../asserts/Fraud.jpeg',
    'Other': '../../asserts/other.jpeg'
};

async function loadAllReports(direction = null) {
    try {
        allReportsContainer.innerHTML = '<p class="message">Loading crime reports...</p>';
        
        // Base query constraints
        let queryConstraints = [orderBy("timestamp", "desc"), limit(pageSize)];
        
        // Apply filters to the query
        if (crimeTypeFilter.value) {
            queryConstraints.push(where("crimeType", "==", crimeTypeFilter.value));
        }
        
        if (statusFilter.value) {
            queryConstraints.push(where("status", "==", statusFilter.value));
        }
        
        // Handle pagination
        if (direction === "next" && lastVisible) {
            queryConstraints.push(startAfter(lastVisible));
            currentPage++;
        } else if (direction === "prev" && currentPage > 1) {
            // For previous page, we need to requery from start
            currentPage--;
            lastVisible = null;
            // Reset to first page if going back from page 2
            if (currentPage === 1) {
                queryConstraints = [orderBy("timestamp", "desc"), limit(pageSize)];
            }
        }
        
        // Create the query
        const reportsQuery = query(collection(db, "crimeReports"), ...queryConstraints);
        const querySnapshot = await getDocs(reportsQuery);
        
        allReportsContainer.innerHTML = ""; // Clear loading message
        
        if (querySnapshot.empty) {
            allReportsContainer.innerHTML = '<p class="message">No crime reports found matching your criteria.</p>';
            nextBtn.disabled = true;
            prevBtn.disabled = false;
            return;
        }
        
        // Save the last document for pagination
        lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        
        // Process documents with client-side location filtering
        const locationFilterValue = locationFilter.value.toLowerCase();
        let hasMatchingResults = false;
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            
            // Apply client-side location filter
            if (locationFilterValue && !data.location?.toLowerCase().includes(locationFilterValue)) {
                return;
            }
            
            hasMatchingResults = true;
            
            // Format date
            const dateTime = data.timestamp ? 
                new Date(data.timestamp.seconds * 1000).toLocaleString() : 
                (data.datetime || "Not specified");
            
            // Determine status class
            let statusClass = "status-reported";
            if (data.status) {
                const statusLower = data.status.toLowerCase();
                if (statusLower.includes("investigat") || statusLower.includes("pending")) {
                    statusClass = "status-investigating";
                } else if (statusLower.includes("resolv")) {
                    statusClass = "status-resolved";
                } else if (statusLower.includes("clos")) {
                    statusClass = "status-closed";
                }
            }
            
            // Create report card
            const reportCard = document.createElement("div");
            reportCard.className = "report-card";
            
            const imageHTML = data.image ? 
                `<img src="${data.image}" alt="Crime scene photo">` : 
                `<img src="${DEFAULT_IMAGES[data.crimeType] || DEFAULT_IMAGES['Other']}" alt="Default crime illustration" class="default-image">`;
            
            reportCard.innerHTML = `
                <h3>${data.crimeType || "Unspecified Crime"}</h3>
                <p><strong>Description:</strong> ${data.description || "No description provided"}</p>
                <p><strong>Location:</strong> ${data.location || "Location not specified"}</p>
                <p><strong>Date & Time:</strong> ${dateTime}</p>
                <span class="status-badge ${statusClass}">${data.status || "Reported"}</span>
                ${imageHTML}
            `;
            allReportsContainer.appendChild(reportCard);
        });
        
        if (!hasMatchingResults) {
            allReportsContainer.innerHTML = '<p class="message">No reports match your location filter.</p>';
        }
        
        // Update pagination buttons
        updatePaginationButtons(querySnapshot.size);
        
    } catch (error) {
        console.error("Error fetching reports:", error);
        allReportsContainer.innerHTML = '<p class="message">Error loading reports. Please try again later.</p>';
    }
}

function updatePaginationButtons(resultsCount) {

prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = resultsCount < pageSize;
}

function resetPagination() {
    lastVisible = null;
    currentPage = 1;
}

// Event listeners for filters
crimeTypeFilter.addEventListener("change", () => {
    resetPagination();
    loadAllReports();
});

statusFilter.addEventListener("change", () => {
    resetPagination();
    loadAllReports();
});

locationFilter.addEventListener("input", () => {
    // Location filter is applied client-side, no need to reset pagination
    loadAllReports();
});

// Pagination button event listeners
if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => loadAllReports("next"));
    prevBtn.addEventListener("click", () => loadAllReports("prev"));
}

// Ensure the user is authenticated before loading reports
const reportbtn = document.getElementById("reportacrime");
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadAllReports();
    } else {
        allReportsContainer.innerHTML = `
            <p class="message">You need to be logged in to view crime reports.</p>
            <a href="../../ loginIn/login.html" class="btn btn-primary" style="margin: 0 auto;">Login</a>

        `;
        if(reportbtn){reportbtn.style.display = "none"}
        if (nextBtn && prevBtn) {
            nextBtn.disabled = true;
            prevBtn.disabled = true;
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const authButton = document.getElementById("authButton");

    onAuthStateChanged(auth, user => {
        if (authButton) {
            if (user) {
                authButton.textContent = "My Profile";
                authButton.href = "./profile/profile.html";
            } else {
                authButton.textContent = "Login / Signup";
                authButton.href = "../../loginIn/login.html";
            }
        }
    });
});