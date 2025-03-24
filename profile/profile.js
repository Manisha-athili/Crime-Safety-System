        // scripts.js
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
        // import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
        // import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";
        
        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
            authDomain: "crime-and-safety.firebaseapp.com",
            projectId: "crime-and-safety",
            storageBucket: "crime-and-safety.appspot.com",
            messagingSenderId: "167045576983",
            appId: "1:167045576983:web:4b19f62d9f0268af565f52",
            measurementId: "G-QRL88H2M6Q"
        };
        
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid;
                document.getElementById('user-name').innerText = user.displayName || "User Name";
                document.getElementById('email').value = user.email;
        
                // Load additional user details
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    document.getElementById('phone').value = userData.phone || '';
                    document.getElementById('address').value = userData.address || '';
                    loadEmergencyContacts(userData.emergencyContacts || []);
                    if (userData.photoURL) {
                        document.getElementById('profile-photo').src = userData.photoURL;
                    }
                }
            } else {
                // Redirect to login page if not authenticated
                window.location.href = 'login.html';
        
            }
        });
        
        // Profile Photo Upload
        const profilePhotoInput = document.getElementById('upload-photo');
        const profilePhotoImg = document.getElementById('profile-photo');
        
        profilePhotoImg.addEventListener('click', () => profilePhotoInput.click());
        
        profilePhotoInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const user = auth.currentUser;
                const storageRef = ref(storage, `profilePhotos/${user.uid}/${file.name}`);
                await uploadBytes(storageRef, file);
                const photoURL = await getDownloadURL(storageRef);
                await updateProfile(user, { photoURL });
                await setDoc(doc(db, 'users', user.uid), { photoURL }, { merge: true });
                profilePhotoImg.src = photoURL;
            }
        });
        
        
        // Update Personal Details
        const personalDetailsForm = document.getElementById('personal-details-form');
        
        personalDetailsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const user = auth.currentUser;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
        
            await setDoc(doc(db, 'users', user.uid), { phone, address }, { merge: true });
            alert('Personal details updated successfully.');
        });
        
        // Manage Emergency Contacts
        
        const emergencyContactsForm = document.getElementById('emergency-contacts-form');
        const contactsList = document.getElementById('contacts-list');
        
        emergencyContactsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const user = auth.currentUser;
            const contactName = document.getElementById('contact-name').value;
            const contactPhone = document.getElementById('contact-phone').value;
        
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            let emergencyContacts = [];
            if (userDoc.exists()) {
                emergencyContacts = userDoc.data().emergencyContacts || [];
            }
            emergencyContacts.push({ name: contactName, phone: contactPhone });
            await setDoc(userDocRef, { emergencyContacts }, { merge: true });
            loadEmergencyContacts(emergencyContacts);
            emergencyContactsForm.reset();
        });
        
        function loadEmergencyContacts(contacts) {
            contactsList.innerHTML = '';
            contacts.forEach(contact => {
                const li = document.createElement('li');
                li.textContent = `${contact.name}: ${contact.phone}`;
                contactsList.appendChild(li);
            });
        }
        
        // View User-Specific Reports
        const myReportsButton = document.getElementById('my-reports');
        const reportsSection = document.getElementById('reports-section');
        const reportsList = document.getElementById('reports-list');
        
        myReportsButton.addEventListener('click', async () => {
            const user = auth.currentUser;
            const reportsQuery = query(collection(db, 'reports'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(reportsQuery);
            reportsList.innerHTML = '';
            querySnapshot.forEach(doc => {
                const report = doc.data();
                const li = document.createElement('li');
                li.textContent = `${report.title} - ${report.status}`;
                reportsList.appendChild(li);
            });
            reportsSection.classList.remove('hidden');
        });
        
        // logout
        const logoutButton = document.getElementById('logout');
        
        logoutButton.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'login.html';
        });
        
        