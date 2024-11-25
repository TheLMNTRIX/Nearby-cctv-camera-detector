// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAU8-ElBrKEXYZXBVVjckIT3W3HMZjSDvo",
  authDomain: "cctv-locator-police-hackathon.firebaseapp.com",
  projectId: "cctv-locator-police-hackathon",
  storageBucket: "cctv-locator-police-hackathon.appspot.com",
  messagingSenderId: "121112930920",
  appId: "1:121112930920:web:5213b67de3603816cb29dd",
  measurementId: "G-SYFFGWPFY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


export {app, auth};
