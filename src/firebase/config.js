// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Fury FM Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAefdSczobIyVbMXCaTnfYcKSrbb50x1tY",
  authDomain: "fury-fm.firebaseapp.com",
  databaseURL: "https://fury-fm-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fury-fm",
  storageBucket: "fury-fm.firebasestorage.app",
  messagingSenderId: "140944928919",
  appId: "1:140944928919:web:4409ddc0f411f6aa9b39d2",
  measurementId: "G-3MHL5JJTVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;