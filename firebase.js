// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC9lzjDW2BKOXiLit9nVH8eFUK3Y712r68",
    authDomain: "pantry-892b9.firebaseapp.com",
    projectId: "pantry-892b9",
    storageBucket: "pantry-892b9.appspot.com",
    messagingSenderId: "239627278680",
    appId: "1:239627278680:web:59b05e7dbdce3474906d2d",
    measurementId: "G-BML42X9EGB"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { db };
export { auth };
