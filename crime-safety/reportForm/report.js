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
const locationStatus = document.getElementById("locationis");

let lat = null;
let lon = null;

if (locationButton) {
    locationButton.addEventListener("click", getLocation);
}

function getLocation() {
    if (navigator.geolocation) {
        locationStatus.innerHTML = "Getting your location...";
        navigator.geolocation.getCurrentPosition(showPosition, showError);
        locationStatus.innerHTML = " "
    } else {
        locationStatus.innerHTML = "Geolocation not supported.";
    }
}

function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    locationStatus.innerHTML = `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            locationStatus.innerHTML = "Location access denied.";
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatus.innerHTML = "Location not available.";
            break;
        case error.TIMEOUT:
            locationStatus.innerHTML = "Location request timed out.";
            break;
        default:
            locationStatus.innerHTML = "Error getting location.";
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
    const status = "reported";

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
        console.log(status)

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
        
        // Only fetch reports by the current user
        let q = query(
            reportsQuery,
            where("userId", "==", currentUser.uid), // Filter by logged-in user
            orderBy("timestamp", "desc"),
            limit(pageSize)
        );

        if (paginateDirection === "next" && lastVisible) {
            q = query(
                reportsQuery,
                where("userId", "==", currentUser.uid),
                orderBy("timestamp", "desc"),
                startAfter(lastVisible),
                limit(pageSize)
            );
        } else if (paginateDirection === "prev" && reportSnapshots.length > 1) {
            reportSnapshots.pop(); // Remove current page
            const previousCursor = reportSnapshots[reportSnapshots.length - 1];
            q = query(
                reportsQuery,
                where("userId", "==", currentUser.uid),
                orderBy("timestamp", "desc"),
                startAfter(previousCursor),
                limit(pageSize)
            );
        }

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            firstVisible = snapshot.docs[0];
            lastVisible = snapshot.docs[snapshot.docs.length - 1];

            if (paginateDirection !== "prev") {
                reportSnapshots.push(firstVisible);
            }
        }

        // Display reports with delete & update buttons
        snapshot.forEach(doc => {
            createReportCard(doc, allReportsContainer, true);
            addActionButtons(doc, allReportsContainer); // Add delete & update buttons
        });

        // Enable or disable buttons after data loads
        prevBtn.disabled = reportSnapshots.length <= 1;
        nextBtn.disabled = snapshot.size < pageSize;

    } catch (error) {
        console.error("Error loading reports:", error);
    } finally {
        loader.style.display = "none";
    }
}

// Helper function to add delete & update buttons
function addActionButtons(reportDoc, container) {
    const reportId = reportDoc.id;
    const reportElement = container.querySelector(`[data-report-id="${reportId}"]`);
    if (!reportElement) return;

    const actionsDiv = document.createElement("div");
    actionsDiv.style.display = "flex";
    actionsDiv.style.gap = "10px";
    actionsDiv.style.marginTop = "10px";

    // Delete Button (🗑️)
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️ Delete";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.padding = "5px 10px";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.background = "#ff4444";
    deleteBtn.style.color = "white";

    deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmDelete = confirm("Are you sure you want to delete this report?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "crimeReports", reportId));
                reportElement.remove(); // Remove from UI
                alert("Report deleted successfully!");
            } catch (error) {
                console.error("Error deleting report:", error);
                alert("Failed to delete report.");
            }
        }
    });

    // Update Button (✏️)
    const updateBtn = document.createElement("button");
    updateBtn.innerHTML = " Update";
    updateBtn.style.cursor = "pointer";
    updateBtn.style.padding = "5px 10px";
    updateBtn.style.border = "none";
    updateBtn.style.borderRadius = "4px";
    updateBtn.style.background = "#4285f4";
    updateBtn.style.color = "white";

    updateBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const newTitle = prompt("Enter new title:", reportDoc.data().title);
        const newDescription = prompt("Enter new description:", reportDoc.data().description);

        if (newTitle !== null && newDescription !== null) {
            try {
                await updateDoc(doc(db, "crimeReports", reportId), {
                    title: newTitle,
                    description: newDescription,
                    lastUpdated: new Date() // Track last update time
                });
                alert("Report updated successfully!");
                loadReports(); // Refresh the list
            } catch (error) {
                console.error("Error updating report:", error);
                alert("Failed to update report.");
            }
        }
    });

    actionsDiv.appendChild(updateBtn);
    actionsDiv.appendChild(deleteBtn);
    reportElement.appendChild(actionsDiv);
}

// Step 8: Create Report Cards
function createReportCard(doc, container) {
    const data = doc.data();
    const reportCard = document.createElement("div");
    reportCard.className = "report-card";

    reportCard.setAttribute("data-report-id", doc.id); // for del# update

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
