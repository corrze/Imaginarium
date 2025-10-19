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
    // 1) Require a signed-in Firebase user (client check)
    const user = auth.currentUser;
    if (!user) throw new Error('Please log in to upgrade to Pro');

    // 2) Start Stripe Checkout via your Flask route
    const res = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: 'price_pro_monthly',                 // <- your Stripe Price ID
        successUrl: `${location.origin}/success`,     // <- where Stripe returns
        cancelUrl:  `${location.origin}/pro.html`     // <- when user cancels
      })
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Failed to start checkout');
    }

    // 3) Redirect the browser to Stripe
    window.location.assign(data.url);

  } catch (err) {
    console.error(err);
    showError(err.message || 'Upgrade failed. Please try again.');
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