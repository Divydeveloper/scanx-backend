// src/firebase.js
import { getFirestore} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKd70xP2u1pBVwhp-RvkZtzvLZ_GI_FBg",
  authDomain: "scanx-50ee7.firebaseapp.com",
  projectId: "scanx-50ee7",
  projectNumber: "762393602497",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
