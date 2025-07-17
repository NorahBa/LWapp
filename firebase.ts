// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9DnDsIWedbDDz9h9JIJabWlMTW_W8SIc",
  authDomain: "shopping-d498a.firebaseapp.com",
  projectId: "shopping-d498a",
  storageBucket: "shopping-d498a.firebasestorage.app",
  messagingSenderId: "961299434935",
  appId: "1:961299434935:web:58fea18d0626a1ec34ec32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
