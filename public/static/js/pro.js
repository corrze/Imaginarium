// Pro Paywall JavaScript with Firebase Integration
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { app, auth, db } from '../../firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    const upgradeBtn = document.getElementById('upgrade-btn');
    
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', handleUpgrade);
    }
});

async function handleUpgrade() {
  const button = document.getElementById('upgrade-btn');
  const originalHTML = button.innerHTML;

  button.innerHTML = '<span>Processing...</span>';
  button.disabled = true;

  try {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Please log in to upgrade to Pro');
    }

    try {
      // First try the Flask route
      console.log("Trying to use Flask checkout endpoint...");
      const response = await fetch(`${location.origin}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_pro_monthly',
          successUrl: `${location.origin}/success`,
          cancelUrl: `${location.origin}/pro.html`
        })
      });

      const data = await response.json();
      
      if (data.url) {
        console.log("Got checkout URL from server:", data.url);
        window.location.href = data.url;
        return; // Exit function if successful
      }
    } catch (error) {
      console.log("Flask checkout failed, falling back to Firebase:", error);
      // Continue with Firebase method if Flask route fails
    }

    // Fallback: Use Firebase directly
    console.log("Using Firebase fallback method...");
    await updateDoc(doc(db, "users", user.uid), {
      membershipLevel: "Pro",
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      lastUpdated: new Date().toISOString()
    });
    
    showSuccess('Successfully upgraded to Pro! Redirecting...');
    
    // Redirect to implemented.html
    setTimeout(() => {
      window.location.href = 'implemented.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error upgrading to Pro:', error);
    
    // Show error message
    showError(error.message || 'Failed to upgrade. Please try again.');
    
    // Reset button
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

function showSuccess(message) {
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => successDiv.remove(), 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);