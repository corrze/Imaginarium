// auth.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { app, auth } from './firebase-config.js';

// Initialize Firestore using the app from config
const db = getFirestore(app);

// User registration
export const registerUser = async (email, password, isChild, parentEmail = null) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user information in Firestore
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

// Check if user is logged in
export const checkAuthStatus = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
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

export { auth, db }; // Export for use in other files