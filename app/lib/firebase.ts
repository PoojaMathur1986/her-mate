// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxXt9iwlMUg8_p8HcyIYKJz0r98KrjH2A",
  authDomain: "her-mate.firebaseapp.com",
  projectId: "her-mate",
  storageBucket: "her-mate.firebasestorage.app",
  messagingSenderId: "559271024147",
  appId: "1:559271024147:web:8f3452e10485055b6f91e6",
  measurementId: "G-BDHCJGEVR0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
