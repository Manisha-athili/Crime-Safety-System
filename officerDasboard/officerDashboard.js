import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getFirestore, collection, query, where, getDocs, doc, updateDoc,
    orderBy, limit, serverTimestamp, getDoc,setDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    databaseURL: "https://crime-and-safety-default-rtdb.firebaseio.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const crimeMap = document.getElementById('crimeMap');
const recentCasesContainer = document.getElementById('recentCases');
const recentFeedbackContainer = document.getElementById('recentFeedback');
const pendingCount = document.getElementById('pendingCount');
const progressCount = document.getElementById('progressCount');
const resolvedCount = document.getElementById('resolvedCount');
const feedbackCount = document.getElementById('feedbackCount');
const caseModal = document.getElementById('caseModal');
const closeModalBtn = document.querySelector('.close-modal');
const modalCaseContent = document.getElementById('modalCaseContent');
const statusUpdateSelect = document.getElementById('statusUpdateSelect');
const updateStatusBtn = document.getElementById('updateStatusBtn');
const heatmapToggle = document.getElementById('heatmapToggle');
const crimeTypeFilter = document.getElementById('crimeTypeFilter');

// Global Variables
let map;
let currentCaseId = null;
let currentOfficerId = null;
let heatmapLayer = null;
let markers = [];

// Initialize Dashboard
function initDashboard() {
    initMap();
    loadRecentCases();
    loadRecentFeedback();
    loadStats();
    initCharts();
    
    // Set up event listeners
    logoutBtn.addEventListener('click', handleLogout);
    closeModalBtn.addEventListener('click', () => caseModal.style.display = 'none');
    updateStatusBtn.addEventListener('click', updateCaseStatus);
    heatmapToggle.addEventListener('click', toggleHeatmap);
    crimeTypeFilter.addEventListener('change', filterCrimes);
    
    window.addEventListener('click', (e) => {
        if (e.target === caseModal) caseModal.style.display = 'none';
    });
}

// Initialize Map
function initMap() {
    map = L.map('crimeMap').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Load Recent Cases
async function loadRecentCases() {
    const q = query(collection(db, "crimeReports"), orderBy("timestamp", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    
    recentCasesContainer.innerHTML = '';
    markers = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        createCaseCard(doc.id, data);
        addMarkerToMap(doc.id, data);
    });
}

// Create Case Card
function createCaseCard(id, data) {
    const caseItem = document.createElement('div');
    caseItem.className = 'case-item';
    caseItem.dataset.id = id;
    
    caseItem.innerHTML = `
        <div class="case-header">
            <h3 class="case-title">${data.crimeType}</h3>
            <span class="case-status status-${data.status.replace(' ', '-')}">${data.status}</span>
        </div>
        <p>${data.description.substring(0, 100)}...</p>
        <div class="case-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${data.location}</span>
            <span><i class="far fa-clock"></i> ${new Date(data.timestamp?.toDate()).toLocaleString()}</span>
        </div>
    `;
    
    caseItem.addEventListener('click', () => openCaseModal(id, data));
    recentCasesContainer.appendChild(caseItem);
}

// Add Marker to Map
function addMarkerToMap(id, data) {
    if (!data.lat || !data.lon) return;
    
    const marker = L.marker([data.lat, data.lon]).addTo(map);
    marker.bindPopup(`
        <b>${data.crimeType}</b><br>
        ${data.location}<br>
        Status: ${data.status}
    `);
    
    marker.on('click', () => openCaseModal(id, data));
    markers.push(marker);
}

// Open Case Modal
async function openCaseModal(id, data) {
    currentCaseId = id;
    const caseDoc = await getDoc(doc(db, "crimeReports", id));
    const caseData = caseDoc.data();
    
    modalCaseContent.innerHTML = `
        <div class="case-detail">
            <h3>${caseData.crimeType}</h3>
            <p><strong>Description:</strong> ${caseData.description}</p>
            <p><strong>Location:</strong> ${caseData.location}</p>
            <p><strong>Coordinates:</strong> ${caseData.lat?.toFixed(4)}, ${caseData.lon?.toFixed(4)}</p>
            <p><strong>Reported by:</strong> ${caseData.userEmail}</p>
            <p><strong>Reported on:</strong> ${new Date(caseData.timestamp?.toDate()).toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="case-status status-${caseData.status.replace(' ', '-')}">${caseData.status}</span></p>
        </div>
        ${caseData.image ? `<div class="case-image"><img src="${caseData.image}" alt="Crime scene"></div>` : ''}
    `;
    
    statusUpdateSelect.value = caseData.status.toLowerCase().replace(' ', '-');
    caseModal.style.display = 'block';
}

// Update Case Status
async function updateCaseStatus() {
    try {
        await updateDoc(doc(db, "crimeReports", currentCaseId), {
            status: statusUpdateSelect.value.replace('-', ' '),
            updatedAt: serverTimestamp()
        });
        alert('Status updated successfully!');
        loadRecentCases();
        loadStats();
        caseModal.style.display = 'none';
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status');
    }
}



// Toggle Heatmap
function toggleHeatmap() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
        heatmapToggle.innerHTML = '<i class="fas fa-fire"></i> Heatmap';
    } else {
        const points = markers.map(marker => {
            const latLng = marker.getLatLng();
            return { lat: latLng.lat, lng: latLng.lng, value: 1 };
        });
        
        heatmapLayer = L.heatLayer(points, { radius: 25 }).addTo(map);
        heatmapToggle.innerHTML = '<i class="fas fa-times"></i> Hide Heatmap';
    }
}

// Filter Crimes by Type
function filterCrimes() {
    const type = crimeTypeFilter.value;
    
    markers.forEach(marker => {
        const crimeType = marker._popup._content.split('<b>')[1].split('</b>')[0];
        if (type === 'all' || crimeType === type) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

// Load Recent Feedback
async function loadRecentFeedback() {
    const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"), limit(3));
    const querySnapshot = await getDocs(q);
    
    recentFeedbackContainer.innerHTML = '';
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        
        feedbackItem.innerHTML = `
            <p class="feedback-text">"${data.message}"</p>
            <div class="feedback-meta">
                <span>Case #${data.caseId}</span>
                <span class="feedback-rating">${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</span>
            </div>
        `;
        
        recentFeedbackContainer.appendChild(feedbackItem);
    });
}

// Load Statistics
async function loadStats() {
    const pendingQuery = query(collection(db, "crimeReports"), where("status", "==", "pending"));
    const progressQuery = query(collection(db, "crimeReports"), where("status", "==", "in progress"));
    const resolvedQuery = query(collection(db, "crimeReports"), where("status", "==", "resolved"));
    const feedbackQuery = query(collection(db, "feedback"), where("reviewed", "==", false));
    
    const [pendingSnap, progressSnap, resolvedSnap, feedbackSnap] = await Promise.all([
        getDocs(pendingQuery),
        getDocs(progressQuery),
        getDocs(resolvedQuery),
        getDocs(feedbackQuery)
    ]);
    
    pendingCount.textContent = pendingSnap.size;
    progressCount.textContent = progressSnap.size;
    resolvedCount.textContent = resolvedSnap.size;
    feedbackCount.textContent = feedbackSnap.size;
}

// Initialize Charts
function initCharts() {
    // Crime Trends Chart
    const trendCtx = document.getElementById('crimeTrendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Crimes Reported',
                data: [65, 59, 80, 81, 56, 72],
                borderColor: 'rgba(58, 123, 213, 1)',
                backgroundColor: 'rgba(58, 123, 213, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Crime Trends'
                }
            }
        }
    });
    
    // Crime Type Chart
    const typeCtx = document.getElementById('crimeTypeChart').getContext('2d');
    new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Theft', 'Assault', 'Vandalism', 'Fraud', 'Other'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    'rgba(58, 123, 213, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(149, 117, 205, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Crime Type Distribution'
                }
            }
        }
    });
    
    // Resolution Time Chart
    const resolutionCtx = document.getElementById('resolutionTimeChart').getContext('2d');
    new Chart(resolutionCtx, {
        type: 'bar',
        data: {
            labels: ['<1 day', '1-3 days', '3-7 days', '>7 days'],
            datasets: [{
                label: 'Resolution Time',
                data: [12, 19, 8, 5],
                backgroundColor: 'rgba(58, 123, 213, 0.8)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Case Resolution Times'
                }
            }
        }
    });
    
    // Officer Performance Chart
    const officerCtx = document.getElementById('officerPerformanceChart').getContext('2d');
    new Chart(officerCtx, {
        type: 'radar',
        data: {
            labels: ['Cases Resolved', 'Response Time', 'Community Rating', 'Reports Filed', 'Follow-ups'],
            datasets: [{
                label: 'Your Performance',
                data: [85, 72, 90, 65, 80],
                backgroundColor: 'rgba(58, 123, 213, 0.2)',
                borderColor: 'rgba(58, 123, 213, 1)',
                pointBackgroundColor: 'rgba(58, 123, 213, 1)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Officer Performance'
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

// Handle Logout
function handleLogout() {
    signOut(auth).then(() => {
        window.location.href = '../index.html';
    }).catch(error => {
        console.error('Logout error:', error);
    });
}

// Auth State Listener
// Add this before your dashboard initialization
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentOfficerId = user.uid;
        console.log("User ID:", user.uid);
        
        // Check if user document exists and has officer role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            console.log("User doc exists, role:", userDoc.data().role);
        } else {
            console.log("User doc doesn't exist in Firestore");
            // Create it
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: "officer",
                lastLogin: serverTimestamp()
            });
            console.log("Created officer document");
        }
        
        initDashboard();
    } else {
        window.location.href = '../loginIn/login.html';
    }
});