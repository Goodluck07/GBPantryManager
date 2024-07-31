import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9lzjDW2BKOXiLit9nVH8eFUK3Y712r68",
  authDomain: "pantry-892b9.firebaseapp.com",
  projectId: "pantry-892b9",
  storageBucket: "pantry-892b9.appspot.com",
  messagingSenderId: "239627278680",
  appId: "1:239627278680:web:59b05e7dbdce3474906d2d",
  measurementId: "G-BML42X9EGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
