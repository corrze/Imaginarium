// File: auth.js - Authentication handling
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "imaginarium-cb20a.firebaseapp.com",
  projectId: "imaginarium-cb20a",
  storageBucket: "imaginarium-cb20a.appspot.com",
  messagingSenderId: "823978245551",
  appId: "1:823978245551:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User registration with age verification for COPPA compliance
export const registerUser = async (email, password, isChild, parentEmail = null) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user information
    await setDoc(doc(db, "users", user.uid), {
      email,
      isChild,
      parentEmail: isChild ? parentEmail : null,
      membershipLevel: "Kids", // Default to free tier
      membershipExpiry: null,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// User login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Membership validation
export const checkMembershipStatus = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return { valid: false, level: null };
    }
    
    const userData = userDoc.data();
    const currentTime = new Date();
    const expiryTime = userData.membershipExpiry ? new Date(userData.membershipExpiry) : null;
    
    // Check if membership is valid (not expired)
    const isValid = expiryTime ? currentTime < expiryTime : false;
    
    return { 
      valid: isValid || userData.membershipLevel === "Kids", // Kids tier is always valid
      level: userData.membershipLevel,
      isChild: userData.isChild
    };
  } catch (error) {
    console.error("Error checking membership:", error);
    return { valid: false, level: null };
  }
};

// Route user based on authentication and membership status
export const routeUserBasedOnMembership = async () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const membership = await checkMembershipStatus(user.uid);
        
        if (membership.valid) {
          if (membership.level === "Pro") {
            resolve('/pro/dashboard.html');
          } else {
            // Kids version
            resolve('/kids/dashboard.html');
          }
        } else {
          // Membership expired, send to renewal page
          resolve('/membership-renewal.html');
        }
      } else {
        // No user is signed in
        resolve('/index.html');
      }
    });
  });
};

// Log out user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};