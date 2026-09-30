import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlhQjGiAez72LTMzkARa8__JokS-whDv8",
  authDomain: "sm-content-creator-35c9a.firebaseapp.com",
  projectId: "sm-content-creator-35c9a",
  storageBucket: "sm-content-creator-35c9a.firebasestorage.app",
  messagingSenderId: "575773886398",
  appId: "1:575773886398:web:b64aaacc80e93f30c3dbef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
