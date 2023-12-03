// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABNrOXXEmS9V8PZCNrMmewXS_wQlZDbAs",
  authDomain: "cs545-strayspotter.firebaseapp.com",
  projectId: "cs545-strayspotter",
  storageBucket: "cs545-strayspotter.appspot.com",
  messagingSenderId: "476489760022",
  appId: "1:476489760022:web:ec1e0f62d15998e3f8a437",
  measurementId: "G-TQEJ8JKT1V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);