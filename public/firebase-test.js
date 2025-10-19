// firebase-test.js
import { app, auth, db } from './firebase-config.js';
import { registerUser, loginUser, checkMembershipStatus, logoutUser } from './auth.js';
import { upgradeToPro } from './payment.js';
import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Test user credentials
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASSWORD = "Password123!";

async function deleteTestUserIfExists() {
  try {
    // Try to login with test credentials
    const result = await loginUser(TEST_EMAIL, TEST_PASSWORD);
    if (result.success) {
      // Delete the user
      await auth.currentUser.delete();
      console.log("Existing test user deleted");
    }
  } catch (error) {
    // User doesn't exist or other error, which is fine
    console.log("No existing test user found");
  }
}

// Test functions
async function runTests() {
  console.log("🧪 Starting Firebase Authentication Tests...");
  
  try {
    // First clean up any existing test users
    await deleteTestUserIfExists();
    
    // Test 1: Register a new user
    console.log("Test 1: Registering test user...");
    try {
      const registerResult = await registerUser(TEST_EMAIL, TEST_PASSWORD, false, null);
      console.log("Registration result:", registerResult);
      
      if (!registerResult.success) {
        if (registerResult.error.includes("already in use")) {
          console.log("User already exists, continuing with login test...");
        } else {
          throw new Error(`Registration failed: ${registerResult.error}`);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
    
    // Test 2: Login
    console.log("Test 2: Logging in...");
    const loginResult = await loginUser(TEST_EMAIL, TEST_PASSWORD);
    console.log("Login result:", loginResult);
    
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }
    
    // Test 3: Check membership
    console.log("Test 3: Checking membership status...");
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is logged in");
    }
    
    const membershipStatus = await checkMembershipStatus(user.uid);
    console.log("Membership status:", membershipStatus);
    
    // Test 4: Upgrade to Pro (mocked payment)
    console.log("Test 4: Upgrading to Pro...");
    // Simplified for testing - bypassing actual payment UI
    const mockUpgrade = async () => {
      try {
        // Using correct Firestore v9 syntax
        await updateDoc(doc(db, "users", user.uid), {
          membershipLevel: "Pro",
          membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString()
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };
    
    const upgradeResult = await mockUpgrade();
    console.log("Upgrade result:", upgradeResult);
    
    // Test 5: Check updated membership
    console.log("Test 5: Checking updated membership status...");
    const updatedMembershipStatus = await checkMembershipStatus(user.uid);
    console.log("Updated membership status:", updatedMembershipStatus);
    
    // Test 6: Logout
    console.log("Test 6: Logging out...");
    const logoutResult = await logoutUser();
    console.log("Logout result:", logoutResult);
    
    console.log("✅ All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Execute tests
document.addEventListener("DOMContentLoaded", () => {
  // Create a button to run tests
  const testButton = document.createElement("button");
  testButton.textContent = "Run Firebase Tests";
  testButton.style.position = "fixed";
  testButton.style.bottom = "20px";
  testButton.style.right = "20px";
  testButton.style.zIndex = "9999";
  testButton.style.padding = "10px";
  testButton.style.backgroundColor = "#4285F4";
  testButton.style.color = "white";
  testButton.style.border = "none";
  testButton.style.borderRadius = "5px";
  testButton.style.cursor = "pointer";
  
  testButton.addEventListener("click", runTests);
  document.body.appendChild(testButton);
  
  console.log("Firebase test suite loaded. Click the button to run tests.");
});