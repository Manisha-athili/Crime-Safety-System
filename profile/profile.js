import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
    authDomain: "crime-and-safety.firebaseapp.com",
    projectId: "crime-and-safety",
    storageBucket: "crime-and-safety.appspot.com",
    messagingSenderId: "167045576983",
    appId: "1:167045576983:web:4b19f62d9f0268af565f52",
    measurementId: "G-QRL88H2M6Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const profileForm = document.getElementById('profileForm');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const logoutBtn = document.getElementById('logoutBtn');
const avatarUpload = document.getElementById('avatarUpload');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');

let isEditing = false;
let originalData = {};

function enableEditMode() {
    isEditing = true;
    const inputs = profileForm.querySelectorAll('input:not(#email), select');
    inputs.forEach(input => {
        input.disabled = false;
    });
    editBtn.style.display = 'none';
    cancelBtn.style.display = 'block';
    saveBtn.style.display = 'block';
}

function disableEditMode() {
    isEditing = false;
    const inputs = profileForm.querySelectorAll('input:not(#email), select');
    inputs.forEach(input => {
        input.disabled = true;
    });
    editBtn.style.display = 'block';
    cancelBtn.style.display = 'none';
    saveBtn.style.display = 'none';
    
    // Reset form to original values
    document.getElementById('fullName').value = originalData.fullName;
    document.getElementById('dob').value = originalData.dob;
    document.getElementById('gender').value = originalData.gender;
    document.getElementById('phone').value = originalData.phone;
    document.getElementById('emergencyContact1').value = originalData.emergencyContact1;
    document.getElementById('emergencyContact2').value = originalData.emergencyContact2;
}

async function loadUserData(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        originalData = {
            fullName: '',
            dob: '',
            gender: '',
            phone: '',
            emergencyContact1: '',
            emergencyContact2: ''
        };

        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            document.getElementById('fullName').value = userData.fullName || '';
            document.getElementById('dob').value = userData.dob || '';
            document.getElementById('gender').value = userData.gender || '';
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('emergencyContact1').value = userData.emergencyContact1 || '';
            document.getElementById('emergencyContact2').value = userData.emergencyContact2 || '';
            
            Object.assign(originalData, {
                fullName: userData.fullName || '',
                dob: userData.dob || '',
                gender: userData.gender || '',
                phone: userData.phone || '',
                emergencyContact1: userData.emergencyContact1 || '',
                emergencyContact2: userData.emergencyContact2 || ''
            });

            const displayName = userData.fullName || 'User';
            profileName.textContent = displayName;
            profileEmail.textContent = user.email;
            updateAvatar(displayName, userData.photoURL);
        } else {
            await setDoc(userRef, {
                email: user.email,
                createdAt: new Date()
            });
            
            profileName.textContent = 'User';
            profileEmail.textContent = user.email;
            updateAvatar('User');
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showToast("Error loading profile data", "error");
    }
}

function updateAvatar(name, photoURL = null) {
    const avatar = document.getElementById('profileAvatar');
    if (photoURL) {
        avatar.src = photoURL;
    } else {
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }
}

async function saveUserData() {
    const user = auth.currentUser;
    if (!user || !isEditing) return;
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        emergencyContact1: document.getElementById('emergencyContact1').value,
        emergencyContact2: document.getElementById('emergencyContact2').value
    };
    
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            ...formData,
            updatedAt: new Date()
        }, { merge: true });
        
        Object.assign(originalData, formData);
        
        if (formData.fullName !== originalData.fullName) {
            const displayName = formData.fullName || 'User';
            profileName.textContent = displayName;
            updateAvatar(displayName);
        }
        
        showToast("Profile updated successfully!", "success");
        disableEditMode();
    } catch (error) {
        console.error("Error saving user data:", error);
        showToast("Error saving profile", "error");
    }
}

function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Event Listeners
editBtn.addEventListener('click', enableEditMode);

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    saveUserData();
});

cancelBtn.addEventListener('click', () => {
    disableEditMode();
    showToast("Changes discarded", "info");
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = "../index.html";
    } catch (error) {
        console.error("Logout error:", error);
        showToast("Error logging out", "error");
    }
});

avatarUpload.addEventListener('change', async (e) => {
    showToast("Avatar upload functionality would be implemented here", "info");
});

// Initialize page
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserData(user);
    } else {
        window.location.href = "../loginIn/login.html";
    }
});