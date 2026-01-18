// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkczxIw4rqisCe1ACD9OJfnmFwIvj0Ke8",
  authDomain: "hells-ea516.firebaseapp.com",
  projectId: "hells-ea516",
  storageBucket: "hells-ea516.firebasestorage.app",
  messagingSenderId: "T817674158390",
  appId: "1:817674158390:web:2a7862784f436352223397",
};

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Autenticación
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
