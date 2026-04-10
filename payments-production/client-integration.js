// 🚀 NOVA 3MM - CLIENT-SIDE PAYMENT INTEGRATION
// =================================================
// Production-ready payment integration for marketplace
// Handles Stripe Checkout and license delivery

class NovaPaymentSystem {
    constructor(config = {}) {
        this.config = {
            apiUrl: config.apiUrl || 'https://payments.nova3mm.com',
            stripePublishableKey: config.stripePublishableKey || 'pk_live_YOUR_KEY_HERE',
            productId: config.productId || 'shopify-inventory-skill',
            productName: config.productName || 'Shopify Inventory Automation Skill',
            price: config.price || 50.00,
            ...config
        };
        
        this.initializeStripe();
    }

    initializeStripe() {
        // Load Stripe.js
        if (!window.Stripe) {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => this.setupStripe();
            document.head.appendChild(script);
        } else {
            this.setupStripe();
        }
    }

    setupStripe() {
        this.stripe = window.Stripe(this.config.stripePublishableKey);
    }

    // Create checkout session
    async createCheckout(customerData = {}) {
        try {
            this.showLoading('Creating secure checkout...');

            const response = await fetch(`${this.config.apiUrl}/api/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: this.config.productId,
                    customerEmail: customerData.email || '',
                    customerName: customerData.name || '',
                    successUrl: `${window.location.origin}/success.html`,
                    cancelUrl: window.location.href
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create checkout');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (error) {
            this.hideLoading();
            this.showError(`Checkout error: ${error.message}`);
            console.error('Checkout error:', error);
        }
    }

    // Verify payment and get license
    async verifyPayment(sessionId) {
        try {
            this.showLoading('Verifying payment...');

            const response = await fetch(`${this.config.apiUrl}/api/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Payment verification failed');
            }

            this.hideLoading();
            return data;

        } catch (error) {
            this.hideLoading();
            this.showError(`Verification error: ${error.message}`);
            console.error('Verification error:', error);
            return null;
        }
    }

    // Validate license key
    async validateLicense(licenseKey) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/validate-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ licenseKey })
            });

            return await response.json();

        } catch (error) {
            console.error('License validation error:', error);
            return { valid: false, error: error.message };
        }
    }

    // UI helpers
    showLoading(message = 'Processing...') {
        // Create or show loading overlay
        let overlay = document.getElementById('payment-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'payment-loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-family: Arial, sans-serif;
            `;
            
            const spinner = document.createElement('div');
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #8b5cf6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            `;
            
            const text = document.createElement('div');
            text.id = 'payment-loading-text';
            text.textContent = message;
            text.style.fontSize = '18px';
            
            overlay.appendChild(spinner);
            overlay.appendChild(text);
            document.body.appendChild(overlay);
            
            // Add spinner animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        } else {
            overlay.style.display = 'flex';
            document.getElementById('payment-loading-text').textContent = message;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('payment-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        // Create error modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            width: 90%;
            text-align: center;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Payment Error';
        title.style.cssText = `
            color: #ef4444;
            margin-bottom: 15px;
            font-size: 20px;
        `;
        
        const text = document.createElement('p');
        text.textContent = message;
        text.style.cssText = `
            color: #333;
            margin-bottom: 20px;
            line-height: 1.5;
        `;
        
        const button = document.createElement('button');
        button.textContent = 'OK';
        button.style.cssText = `
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        button.onclick = () => modal.remove();
        
        modal.appendChild(title);
        modal.appendChild(text);
        modal.appendChild(button);
        document.body.appendChild(modal);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        `;
        overlay.onclick = () => {
            modal.remove();
            overlay.remove();
        };
        document.body.appendChild(overlay);
    }

    showSuccess(licenseKey, customerEmail) {
        // Create success modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            text-align: center;
        `;
        
        const icon = document.createElement('div');
        icon.innerHTML = '🎉';
        icon.style.cssText = `
            font-size: 50px;
            margin-bottom: 20px;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Payment Successful!';
        title.style.cssText = `
            color: #10b981;
            margin-bottom: 15px;
            font-size: 24px;
        `;
        
        const message = document.createElement('p');
        message.textContent = `Your license key has been sent to ${customerEmail}`;
        message.style.cssText = `
            color: #333;
            margin-bottom: 20px;
            line-height: 1.5;
        `;
        
        const licenseBox = document.createElement('div');
        licenseBox.textContent = licenseKey;
        licenseBox.style.cssText = `
            background: #f3f4f6;
            border: 2px dashed #8b5cf6;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1px;
            border-radius: 5px;
            word-break: break-all;
        `;
        
        const note = document.createElement('p');
        note.textContent = 'Please save this license key. You will need it to activate your product.';
        note.style.cssText = `
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        `;
        
        const button = document.createElement('button');
        button.textContent = 'Continue';
        button.style.cssText = `
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 12px 40px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        `;
        button.onclick = () => {
            modal.remove();
            window.location.href = '/success.html';
        };
        
        modal.appendChild(icon);
        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(licenseBox);
        modal.appendChild(note);
        modal.appendChild(button);
        document.body.appendChild(modal);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        `;
        document.body.appendChild(overlay);
    }
}

// Global payment system instance
window.NovaPayments = new NovaPaymentSystem({
    apiUrl: 'https://payments.nova3mm.com', // Your production API URL
    stripePublishableKey: 'pk_live_YOUR_KEY_HERE', // Your live publishable key
    productId: 'shopify-inventory-skill',
    productName: 'Shopify Inventory Automation Skill',
    price: 50.00
});

// Auto-verify payment on success page
if (window.location.pathname.includes('success.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        document.addEventListener('DOMContentLoaded', async () => {
            const result = await window.NovaPayments.verifyPayment(sessionId);
            if (result && result.licenseKey) {
                // Update success page with license info
                const licenseElement = document.getElementById('licenseKey');
                if (licenseElement) {
                    licenseElement.textContent = result.licenseKey;
                }
                
                const emailElement = document.getElementById('customerEmail');
                if (emailElement) {
                    emailElement.textContent = result.customerEmail;
                }
            }
        });
    }
}

// Example usage in marketplace:
/*
// Add to your product card:
<button onclick="window.NovaPayments.createCheckout({email: 'customer@example.com', name: 'John Doe'})">
    Buy Now - $50
</button>

// Or with email collection:
<button onclick="showPaymentModal()">
    Buy Now - $50
</button>

function showPaymentModal() {
    // Show modal to collect email
    const email = prompt('Enter your email for license delivery:');
    if (email) {
        window.NovaPayments.createCheckout({email});
    }
}
*/