import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

//  Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52",
    measurementId: "G-QRL88H2M6Q"
};

//  Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set authentication persistence (keeps users logged in)
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Auth persistence enabled"))
    .catch((error) => console.error("Error setting persistence:", error));

// Get User Role Securely from Firestore
async function getUserRole(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data().role : "user"; // Default role
    } catch (error) {
        console.error("Failed to fetch role:", error);
        return "user"; // Fallback
    }
}

// Crime Report function
async function report() {
    try {
        const user = auth.currentUser;
        if (user) {
            // Check if user is verified if you have email verification
            window.location.href = "./crime-safety/reportForm/crime-report.html";
        } else {
            const proceed = confirm("You need to login to report a crime. Proceed to login page?");
            if (proceed) {
                window.location.href = "./loginIn/login.html";
            }
        }
    } catch (error) {
        console.error("Error in report function:", error);
        alert("An error occurred. Please try again later.");
    }
}

// Add event listener when DOM loads
document.addEventListener("DOMContentLoaded", function() {
    const reportButton = document.getElementById("crimeReport");
    if (reportButton) {
        reportButton.addEventListener("click", function(e) {
            e.preventDefault();
            report();
        });
    }
});

// Handle Authentication & Role-based Redirection
onAuthStateChanged(auth, async (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        // Prevent logged-in users from accessing the login page
        if (currentPath.includes("login.html")) {
            window.location.href = "./index.html";
            return;
        }

        if (!localStorage.getItem("redirected")) {
            const role = await getUserRole(user);
            localStorage.setItem("userRole", role);

            try {
                localStorage.setItem("redirected", "true");

                // Redirect based on role
                if (role === "officer" && !currentPath.includes("officer.html")) {
                    window.location.href = "./officerDasboard/officerDashboard.html";
                } else if (role !== "officer" && currentPath.includes("officer.html")) {
                    window.location.href = "./index.html";
                }
            } catch (error) {
                console.error("Error handling", error);
            }
        }
    } else {
        // Remove stored user data
        localStorage.removeItem("userRole");
        localStorage.removeItem("redirected");

        // Redirect unauthenticated users from restricted pages
        if (currentPath.includes("profile.html") || currentPath.includes("crime-report.html")) {
            window.location.href = "./loginIn/login.html";
        }
    }
});

// usefull links section

const track = document.querySelector(".carousel-track");
const cards = Array.from(track.children);
const dotsContainer = document.querySelector(".carousel-dots");
const cardsPerPage = 4;
let currentSlide = 0;
const totalSlides = Math.ceil(cards.length / cardsPerPage);

function updateCarousel() {
  const cardWidth = cards[0].offsetWidth + 20;
  track.style.transform = `translateX(-${currentSlide * cardWidth * cardsPerPage}px)`;

  document.querySelectorAll(".carousel-dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentSlide);
  });
}

function createDots() {
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("span");
    dot.classList.add("carousel-dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      currentSlide = i;
      updateCarousel();
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

let autoplayInterval = setInterval(nextSlide, 3000); // Change slide every 3s

function resetAutoplay() {
  clearInterval(autoplayInterval);
  autoplayInterval = setInterval(nextSlide, 3000);
}

window.addEventListener("resize", updateCarousel);

createDots();
updateCarousel();

