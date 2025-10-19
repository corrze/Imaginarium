import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3QP1hhLju2ySnijIi-5_bItxl_C-7fxY",
  authDomain: "imaginarium-cb20a.firebaseapp.com",
  projectId: "imaginarium-cb20a",
  storageBucket: "imaginarium-cb20a.appspot.com",
  messagingSenderId: "823978245551",
  appId: "1:823978245551:web:cd7f655e3b4bec2565035a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };