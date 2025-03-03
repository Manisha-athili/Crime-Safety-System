
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
        import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyBsJS-phFoPIzSEtjdr0Y9lZ-J79XpKjV8",
            authDomain: "crime-and-safety.firebaseapp.com",
            databaseURL: "https://crime-and-safety-default-rtdb.firebaseio.com",
            projectId: "crime-and-safety",
            storageBucket: "crime-and-safety.appspot.com",
            messagingSenderId: "167045576983",
            appId: "1:167045576983:web:4b19f62d9f0268af565f52"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // Handle form submission
        document.getElementById("crimeForm").addEventListener("submit", async function(event) {
            event.preventDefault();

            const crimeType = document.getElementById("crimeType").value;
            const description = document.getElementById("description").value;
            const location = document.getElementById("location").value;
            const datetime = document.getElementById("datetime").value;

            console.log("Submitting report:", { crimeType, description, location, datetime });

            try {
                await addDoc(collection(db, "crimeReports"), {
                    crimeType,
                    description,
                    location,
                    datetime,
                    timestamp: serverTimestamp()
                });

                console.log("Report submitted successfully!");
                document.getElementById("crimeForm").reset();
                loadReports(); // Refresh reports
            } catch (error) {
                console.error("Error adding report: ", error);
            }
        });

        // Fetch and display reports
        async function loadReports() {
            const container = document.getElementById("reportsContainer");
            container.innerHTML = "";

            const q = query(collection(db, "crimeReports"), orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);

            snapshot.forEach(doc => {
                const data = doc.data();
                const reportCard = document.createElement("div");
                reportCard.className = "card";
                reportCard.innerHTML = `
                    <h3>${data.crimeType}</h3>
                    <p><strong>Description:</strong> ${data.description}</p>
                    <p><strong>Location:</strong> ${data.location}</p>
                    <p><strong>Date & Time:</strong> ${data.datetime}</p>
                `;
                container.appendChild(reportCard);
            });
        }

        // Load reports on page load
        loadReports();
