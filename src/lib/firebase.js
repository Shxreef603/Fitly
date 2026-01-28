import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB_G82W7ucHPggftB4wKKXvJurYFWuhq7I",
    authDomain: "fitly-603.firebaseapp.com",
    projectId: "fitly-603",
    storageBucket: "fitly-603.firebasestorage.app",
    messagingSenderId: "85929870274",
    appId: "1:85929870274:web:c11b840dc938e041ae8c5b",
    measurementId: "G-PFZS6D8PW7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
