// Pro Paywall JavaScript with Firebase Integration
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { app, auth, db } from '../../firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, attaching event listener to upgrade button");
    const upgradeBtn = document.getElementById('upgrade-btn');
    
    if (upgradeBtn) {
        console.log("Upgrade button found");
        upgradeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Button clicked");
            handleUpgrade();
        });
    } else {
        console.error("Upgrade button not found");
    }
});

async function handleUpgrade() {
    console.log("handleUpgrade called");
    const button = document.getElementById('upgrade-btn');
    const originalHTML = button.innerHTML;

    button.innerHTML = '<span>Processing...</span>';
    button.disabled = true;

    try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
            console.log("No user logged in");
            throw new Error('Please log in to upgrade to Pro');
        }

        console.log("User is logged in:", user.uid);

        // Update Firebase directly
        console.log("Updating Firebase document");
        await updateDoc(doc(db, "users", user.uid), {
            membershipLevel: "Pro",
            membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
            lastUpdated: new Date().toISOString()
        });
        
        console.log("Firebase update successful");
        showSuccess('Successfully upgraded to Pro! Redirecting...');
        
        // Simple redirect with timeout
        console.log("Setting timeout for redirect");
        setTimeout(() => {
            console.log("Redirecting to implemented.html");
            window.location.href = '/success';
        }, 2000);
        
    } catch (error) {
        console.error('Error upgrading to Pro:', error);
        showError(error.message || 'Failed to upgrade. Please try again.');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

function showError(message) {
    console.log("Showing error:", message);
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
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

function showSuccess(message) {
    console.log("Showing success:", message);
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