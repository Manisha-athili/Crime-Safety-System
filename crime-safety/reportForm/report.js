import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp, 
    doc, updateDoc, deleteDoc, where, getDoc, limit, startAfter
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
// import { getMessaging } from "firebase/messaging";

//  Step 1: Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    databaseURL: "https://crime-and-safety-default-rtdb.firebaseio.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52"
};

//  Step 2: Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let userRole = "user";  // Default role for users

// pagination
let lastVisible = null;
let firstVisible = null;
const pageSize = 2 ;
let reportSnapshots = []; // stack to keep track of previous pages


//  Step 3: Check Authentication and Fetch User Role
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

//  Step 4: Handle Image Upload (Convert to Base64)
const imageInput = document.getElementById("crimeImage");
const previewImage = document.getElementById("previewImage");
let base64Image = "";  


if (imageInput && previewImage) {
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
}
// Step 5: Get User Location (Latitude & Longitude)

const locationButton = document.getElementById("getLocation");
let lat = null;
let lon = null;

if (locationButton) {
locationButton.addEventListener("click", getLocation);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        const locationStatus = document.getElementById("locationis");
        if (locationStatus) {
            locationStatus.innerHTML = "Accessing your location...";
        }
    } else {
        const locationStatus = document.getElementById("locationis");
        if (locationStatus) {
            locationStatus.innerHTML = "Geolocation is not supported by this browser.";
        }
    }
}


function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    alert("location accessed")
}

function showError(error) {
    const locationStatus = document.getElementById("locationis");
    if (!locationStatus) return;
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            locationStatus.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatus.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            locationStatus.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            locationStatus.innerHTML = "An unknown error occurred.";
            break;
    }
}

let currentReportId = null;


// Step 6: Handle Crime Report Submission
const crimeForm = document.getElementById("crimeForm");
if (crimeForm) {
    crimeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

    if (!currentUser) {
        alert("You need to log in to report a crime.");
        return;
    }

    const crimeType = document.getElementById("crimeType").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const datetime = document.getElementById("datetime").value;
    const status = "Reported";

    try {
        const docRef = await addDoc(collection(db, "crimeReports"), {
            crimeType,
            description,
            location,
            datetime,
            status,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            timestamp: serverTimestamp(),
            image: base64Image,
            lat,
            lon
        });

        emailjs.send("service_wm552h5", "template_5vdfkqp", { 
            crimeType: crimeType,
            description: description,
            location: location,
            datetime: datetime,
            refNumber: docRef.id,
            userEmail: currentUser.email
        })
        .then(function(response) {
            console.log(" Email sent successfully!", response.status, response.text);
        })
        .catch(function(error) {
            console.error(" Failed to send email:", error);
        });

        currentReportId = docRef.id;

            // Reset form and preview
            crimeForm.reset();
            if (previewImage) {
                previewImage.style.display = "none";
                base64Image = "";
            }


            // Show confirmation modal with reference ID
            const refNumber = document.getElementById("refNumber");
            const confirmationModal = document.getElementById("confirmationModal");
            
            if (refNumber && confirmationModal) {
                refNumber.textContent = docRef.id;
                confirmationModal.style.display = "block";
            } else {
                alert(`Report submitted successfully! Reference ID: ${docRef.id}`);
            }
            
            loadReports();  // Reload reports after adding a new one
        } catch (error) {
            console.error("Error adding report:", error);
            alert("Error submitting report: " + error.message);
        }
      });

     
  }
  

//  Step 7: Fetch and Display Crime Reports
async function loadReports(paginateDirection = null) {
    if (!currentUser) return;

    const allReportsContainer = document.getElementById("otherReportsContainer");
    const loader = document.getElementById("loader");
   
    const nextBtn = document.getElementById("nextPageBtn");
    const prevBtn = document.getElementById("prevPageBtn");

    if (!allReportsContainer) return;

    // Show loader and clear reports
    loader.style.display = "block";
    allReportsContainer.innerHTML = "";
    nextBtn.disabled = true;
    prevBtn.disabled = true;

    try {
        let reportsQuery = collection(db, "crimeReports");
        let q = query(reportsQuery, orderBy("timestamp", "desc"), limit(pageSize));

        if (paginateDirection === "next" && lastVisible) {
            q = query(reportsQuery, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(pageSize));
        } else if (paginateDirection === "prev" && reportSnapshots.length > 1) {
            reportSnapshots.pop(); // remove current page
            const previousCursor = reportSnapshots[reportSnapshots.length - 1];
            q = query(reportsQuery, orderBy("timestamp", "desc"), startAfter(previousCursor), limit(pageSize));
        }

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            firstVisible = snapshot.docs[0];
            lastVisible = snapshot.docs[snapshot.docs.length - 1];

            // Avoid pushing duplicates
            if (paginateDirection !== "prev") {
                reportSnapshots.push(firstVisible);
            }
        }

        snapshot.forEach(doc => createReportCard(doc, allReportsContainer, true));

        // Enable or disable buttons after data loads
        prevBtn.disabled = reportSnapshots.length <= 1;
        nextBtn.disabled = snapshot.size < pageSize;

    } catch (error) {
        console.error("Error loading reports with pagination:", error);
    } finally {
        loader.style.display = "none";
    }
}


// Step 8: Create Report Cards
function createReportCard(doc, container) {
    const data = doc.data();
    const reportCard = document.createElement("div");
    reportCard.className = "report-card";


    // Determine status class
    let statusClass = "status-pending";
    if (data.status?.toLowerCase().includes("progress")) statusClass = "status-in-progress";
    else if (data.status?.toLowerCase().includes("resolve")) statusClass = "status-resolved";

    const DEFAULT_IMAGES = {
        'Theft': '../../asserts/Theft.jpg',
        'Vandalism': '../../asserts/Vandalism.jpg',
        'Assault': '../../asserts/Assault.jpeg',
        'Fraud': '../../asserts/Fraud.jpeg',
        'Other': '../../asserts/other.jpeg'
    };

    reportCard.innerHTML = `
        <h4>${data.crimeType}</h4>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Date & Time:</strong> ${data.datetime}</p>
         <p><strong>Coordinates:</strong> ${data.lat ? data.lat.toFixed(4) : 'N/A'}, ${data.lon ? data.lon.toFixed(4) : 'N/A'}</p>
        <p>
         
        <span class="status-badge ${statusClass}">${data.status || "pending"}</span>
                ${data.image ? `<img src="${data.image}" alt="Crime scene photo">` :`<img src="${DEFAULT_IMAGES[data.crimeType] || DEFAULT_IMAGES['Other']}" alt="Default crime illustration" class="default-image">`}
    `;
    container.appendChild(reportCard);
}

// Close modal function (if you have a close button)
const closeModalButton = document.getElementById("closeModal");
if (closeModalButton) {
    closeModalButton.addEventListener("click", function() {
        const confirmationModal = document.getElementById("confirmationModal");
        if (confirmationModal) {
            confirmationModal.style.display = "none";
        }
    });
}


const nextBtn = document.getElementById("nextPageBtn");
const prevBtn = document.getElementById("prevPageBtn");

if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => loadReports("next"));
    prevBtn.addEventListener("click", () => loadReports("prev"));
}




// Load Reports when Page Loads
loadReports();
