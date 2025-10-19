// Pro Paywall JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const upgradeBtn = document.getElementById('upgrade-btn');
    
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', handleUpgrade);
    }
});

async function handleUpgrade() {
    const button = document.getElementById('upgrade-btn');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<span>Processing...</span>';
    button.disabled = true;
    
    try {
        // Create checkout session
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: 'price_pro_monthly', // Stripe price ID
                successUrl: window.location.origin + '/success',
                cancelUrl: window.location.origin + '/pro'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        
        const { url } = await response.json();
        
        // Redirect to Stripe Checkout
        window.location.href = url;
        
    } catch (error) {
        console.error('Error creating checkout session:', error);
        
        // Show error message
        showError('Failed to start checkout. Please try again.');
        
        // Reset button
        button.innerHTML = originalText;
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
