import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbjcKc6CmnlA9yCtOWpn5Qwaw7IfNyzIc",
  authDomain: "fishing-app-1c1da.firebaseapp.com",
  databaseURL: "https://fishing-app-1c1da-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fishing-app-1c1da",
  storageBucket: "fishing-app-1c1da.firebasestorage.app",
  messagingSenderId: "105487853737",
  appId: "1:105487853737:web:bdbd03fee21b753dee21b8",
  measurementId: "G-FRVL2346Q6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
