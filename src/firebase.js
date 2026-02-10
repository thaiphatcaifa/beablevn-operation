import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getAuth } from "firebase/auth"; // 1. Import thêm getAuth

const firebaseConfig = {
  apiKey: "AIzaSyCcDf-QwrU2zkkQan49gSdq6AkjY5JI2rQ",
  authDomain: "beablevn-operation.firebaseapp.com",
  databaseURL: "https://beablevn-operation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beablevn-operation",
  storageBucket: "beablevn-operation.firebasestorage.app",
  messagingSenderId: "18301003388",
  appId: "1:18301003388:web:a32ceea5343c27a1134bf9",
  measurementId: "G-L54LMGPTL4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 
export const auth = getAuth(app); // 2. Export biến auth