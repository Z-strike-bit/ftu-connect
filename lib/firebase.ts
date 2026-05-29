import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLKbNIGqDCYjQWhK7PVrtQ9OVwraS3gYQ",
  authDomain: "ftu-connect.firebaseapp.com",
  projectId: "ftu-connect",
  storageBucket: "ftu-connect.firebasestorage.app",
  messagingSenderId: "378017974179",
  appId: "1:378017974179:web:4d82fb7e5e8892d820fc16"
};

// Khởi tạo Firebase (Tránh khởi tạo lại nhiều lần trong Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
