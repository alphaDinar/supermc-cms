import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {GoogleAuthProvider, getAuth} from "firebase/auth";
// import {getDatabase} from "firebase/database";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDG9-0pleth0NLxiVp06fMDXzV4GmLV-aU",
  authDomain: "super-mc.firebaseapp.com",
  projectId: "super-mc",
  storageBucket: "super-mc.appspot.com",
  messagingSenderId: "743624893427",
  appId: "1:743624893427:web:379c05fe2682c0a19a6886",
  measurementId: "G-0ZM12KJQ2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const fireAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// export const realtimeDB = getDatabase(app);
export const fireStoreDB = getFirestore(app);
export const storageDB = getStorage(app);
// export const realtimeDB =  