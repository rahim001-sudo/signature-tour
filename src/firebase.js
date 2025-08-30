import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA776jmqr65bZfF0ETaHZ3xPYgmmCRCmQE",
  authDomain: "signature-tours-website.firebaseapp.com",
  projectId: "signature-tours-website",
  storageBucket: "signature-tours-website.firebasestorage.app",
  messagingSenderId: "206936403896",
  appId: "1:206936403896:web:6be6bde8b1c24bed27a94d",
  measurementId: "G-LMGVESV247"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;