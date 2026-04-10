// 🚀 Nova 3MM - Updated Payment Integration
// =================================================
// Production-ready payment integration for marketplace

class NovaPaymentIntegration {
    constructor() {
        this.apiUrl = 'https://payments.nova3mm.com'; // Your production API URL
        this.productId = 'shopify-inventory-skill';
        this.productName = 'Shopify Inventory Automation Skill';
        this.price = 50.00;
        
        this.init();
    }

    init() {
        // Add payment button handlers
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPaymentButtons();
            this.handleSuccessPage();
        });
    }

    setupPaymentButtons() {
        // Find all payment buttons
        const paymentButtons = document.querySelectorAll('.nova-payment-button, [data-action="purchase-license"]');
        
        paymentButtons.forEach(button => {
            // Remove old Stripe link
            if (button.href && button.href.includes('checkout.stripe.com')) {
                button.removeAttribute('href');
                button.removeAttribute('target');
            }
            
            // Add click handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiatePayment();
            });
        });
    }

    async initiatePayment() {
        try {
            // Show email collection modal
            const email = await this.collectCustomerEmail();
            if (!email) return;

            // Show loading
            this.showLoading('Creating secure checkout...');

            // Call payment API
            const response = await fetch(`${this.apiUrl}/api/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: this.productId,
                    customerEmail: email,
                    customerName: '',
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
            this.showError(`Payment error: ${error.message}`);
            console.error('Payment error:', error);
        }
    }

    async collectCustomerEmail() {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 400px;
                width: 100%;
                text-align: center;
                color: #333;
            `;

            const title = document.createElement('h3');
            title.textContent = 'Enter Your Email';
            title.style.cssText = `
                font-size: 20px;
                margin-bottom: 10px;
                color: #0f172a;
            `;

            const description = document.createElement('p');
            description.textContent = 'Your license key will be sent to this email address.';
            description.style.cssText = `
                color: #666;
                margin-bottom: 20px;
                font-size: 14px;
            `;

            const input = document.createElement('input');
            input.type = 'email';
            input.placeholder = 'your@email.com';
            input.style.cssText = `
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
                margin-bottom: 20px;
                box-sizing: border-box;
            `;
            input.focus();

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                gap: 10px;
                justify-content: center;
            `;

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.style.cssText = `
                padding: 10px 20px;
                border: 1px solid #e2e8f0;
                background: white;
                color: #666;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
            `;
            cancelButton.onclick = () => {
                document.body.removeChild(modal);
                resolve(null);
            };

            const continueButton = document.createElement('button');
            continueButton.textContent = 'Continue to Payment';
            continueButton.style.cssText = `
                padding: 10px 20px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            `;
            continueButton.onclick = () => {
                const email = input.value.trim();
                if (!email || !this.validateEmail(email)) {
                    input.style.borderColor = '#ef4444';
                    return;
                }
                document.body.removeChild(modal);
                resolve(email);
            };

            // Enter key support
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    continueButton.click();
                }
            });

            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(continueButton);

            modalContent.appendChild(title);
            modalContent.appendChild(description);
            modalContent.appendChild(input);
            modalContent.appendChild(buttonContainer);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        });
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    handleSuccessPage() {
        if (!window.location.pathname.includes('success.html')) return;

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
            this.verifyPaymentOnSuccess(sessionId);
        }
    }

    async verifyPaymentOnSuccess(sessionId) {
        try {
            this.showLoading('Verifying your payment...');

            const response = await fetch(`${this.apiUrl}/api/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });

            const data = await response.json();

            this.hideLoading();

            if (data.success && data.licenseKey) {
                // Update success page
                this.updateSuccessPage(data);
            } else {
                this.showError('Payment verification failed. Please contact support.');
            }

        } catch (error) {
            this.hideLoading();
            console.error('Verification error:', error);
        }
    }

    updateSuccessPage(paymentData) {
        // Update license key display
        const licenseElement = document.getElementById('licenseKey');
        if (licenseElement) {
            licenseElement.textContent = paymentData.licenseKey;
        }

        // Update customer email
        const emailElement = document.getElementById('customerEmail');
        if (emailElement) {
            emailElement.textContent = paymentData.customerEmail;
        }

        // Update order status
        const statusElement = document.getElementById('paymentStatus');
        if (statusElement) {
            statusElement.textContent = 'Payment Verified ✓';
            statusElement.style.color = '#10b981';
        }

        // Show success message
        const messageElement = document.getElementById('successMessage');
        if (messageElement) {
            messageElement.innerHTML = `
                <div style="background: #10b98120; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i>
                    <strong>Payment verified successfully!</strong> Your license key has been sent to ${paymentData.customerEmail}.
                </div>
            `;
        }
    }

    showLoading(message) {
        let overlay = document.getElementById('payment-loading');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'payment-loading';
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
                z-index: 10000;
                color: white;
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
            text.textContent = message;
            text.style.fontSize = '18px';

            overlay.appendChild(spinner);
            overlay.appendChild(text);
            document.body.appendChild(overlay);

            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoading() {
        const overlay = document.getElementById('payment-loading');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle';

        const text = document.createElement('span');
        text.textContent = message;

        const close = document.createElement('button');
        close.innerHTML = '&times;';
        close.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
            padding: 0 5px;
        `;
        close.onclick = () => document.body.removeChild(errorDiv);

        errorDiv.appendChild(icon);
        errorDiv.appendChild(text);
        errorDiv.appendChild(close);
        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize payment system
window.NovaPayments = new NovaPaymentIntegration();

// Add to existing payment buttons
document.addEventListener('DOMContentLoaded', function() {
    // Update existing payment button
    const paymentButton = document.querySelector('a.nova-payment-button');
    if (paymentButton) {
        paymentButton.onclick = function(e) {
            e.preventDefault();
            window.NovaPayments.initiatePayment();
        };
    }
});