import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace these values with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtxmS0OnVjABuNLAnFBMNTtXu7xWW2duQ",
  authDomain: "gym-app-5bdfb.firebaseapp.com",
  projectId: "gym-app-5bdfb",
  storageBucket: "gym-app-5bdfb.firebasestorage.app",
  messagingSenderId: "770577166059",
  appId: "1:770577166059:web:588766d556babea65c58ae",
  measurementId: "G-L6EFH3DHF2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app; 