import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4drB1fMdDptB0IpO-XNWYv0qVeqdmW6I",
  authDomain: "orvix-d94a9.firebaseapp.com",
  projectId: "orvix-d94a9",
  storageBucket: "orvix-d94a9.firebasestorage.app",
  messagingSenderId: "822521143066",
  appId: "1:822521143066:web:5b8caef711baddbbf216a3",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };