// File: payment.js - Handle payments using Visa APIs
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// For hackathon purposes, this could be mocked or integrated with Visa Sandbox
// Reference: https://developer.visa.com/pages/working-with-visa-apis/visa-developer-quick-start-guide

// Function to handle "Pro" membership upgrade
export const upgradeToPro = async () => {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    // 1. Set up payment UI with Visa elements
    const stripe = Stripe('pk_test_your_test_key'); // Replace with Visa checkout in production
    
    // 2. Open payment modal
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement('card'),
      billing_details: {
        email: user.email,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // 3. Process payment on your server (represented here as a function)
    const paymentResult = await processProMembershipPayment(user.uid, paymentMethod.id);
    
    if (paymentResult.success) {
      // 4. Update user's membership status in database
      await updateMembershipStatus(user.uid, 'Pro', 12); // 12 months membership
      
      return { success: true };
    } else {
      throw new Error(paymentResult.error);
    }
  } catch (error) {
    console.error("Payment error:", error);
    return { success: false, error: error.message };
  }
};

// Mock function to process payment (would be replaced with actual Visa API calls)
// For hackathon, you could implement this with Visa Direct Sandbox API
async function processProMembershipPayment(userId, paymentMethodId) {
  try {
    // In a real implementation, make secure API calls to Visa payment endpoints
    // Mock successful payment for hackathon demo
    return { success: true, transactionId: `tx_${Date.now()}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update user's membership in the database
async function updateMembershipStatus(userId, level, durationMonths) {
  try {
    // Calculate expiration date
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + durationMonths);
    
    // Update user document
    await updateDoc(doc(db, "users", userId), {
      membershipLevel: level,
      membershipExpiry: expiry.toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating membership:", error);
    return { success: false, error: error.message };
  }
}

// Check if parent approval is needed for a purchase (for child accounts)
export const checkParentalApproval = async (userId, purchaseAmount) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return { requiresApproval: true };
    }
    
    const userData = userDoc.data();
    
    if (userData.isChild) {
      // For child accounts, implement parental controls
      // This could be enhanced with spending limits, approved merchants, etc.
      if (purchaseAmount > 10) { // Example: $10 threshold requires approval
        return { 
          requiresApproval: true,
          parentEmail: userData.parentEmail 
        };
      }
    }
    
    return { requiresApproval: false };
  } catch (error) {
    console.error("Error checking parental approval:", error);
    return { requiresApproval: true }; // Default to requiring approval on error
  }
};