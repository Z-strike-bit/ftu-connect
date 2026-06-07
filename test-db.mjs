import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLKbNIGqDCYjQWhK7PVrtQ9OVwraS3gYQ",
  authDomain: "ftu-connect.firebaseapp.com",
  projectId: "ftu-connect",
  storageBucket: "ftu-connect.firebasestorage.app",
  messagingSenderId: "378017974179",
  appId: "1:378017974179:web:4d82fb7e5e8892d820fc16"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const mentors = usersSnap.docs.map(d => ({id: d.id, ...d.data()})).filter(u => u.role === 'mentor');
  
  for (const mentor of mentors) {
    if (mentor.skills) {
      if (typeof mentor.skills !== 'string') {
        console.error(`Mentor ${mentor.id} has invalid skills:`, typeof mentor.skills, mentor.skills);
      }
    }
    if (mentor.gpa) {
      if (typeof mentor.gpa !== 'string' && typeof mentor.gpa !== 'number') {
        console.error(`Mentor ${mentor.id} has invalid gpa:`, typeof mentor.gpa, mentor.gpa);
      }
    }
  }
  console.log("Done checking mentors. Count:", mentors.length);
  process.exit(0);
}

run();
