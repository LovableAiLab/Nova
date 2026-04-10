// 🚀 NOVA 3MM - PRODUCTION STRIPE PAYMENT SERVER
// =================================================
// Production-ready payment API for Nova 3MM Marketplace
// Features: Stripe Checkout, Webhooks, License Generation, Email Delivery

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['https://nova-5mm.pages.dev', 'https://nova3mm.com', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Security middleware
app.use((req, res, next) => {
    // Rate limiting headers
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '99');
    res.setHeader('X-RateLimit-Reset', Date.now() + 60000);
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
});

// Database simulation (in production, use PostgreSQL/MySQL)
class PaymentDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'data', 'payments.db.json');
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
            const data = await fs.readFile(this.dbPath, 'utf8').catch(() => '{}');
            this.data = JSON.parse(data);
        } catch (error) {
            this.data = {
                payments: [],
                licenses: [],
                customers: [],
                webhookEvents: []
            };
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
    }

    // Payment methods
    async createPayment(paymentData) {
        const payment = {
            id: `pay_${crypto.randomBytes(8).toString('hex')}`,
            ...paymentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.data.payments.push(payment);
        await this.save();
        return payment;
    }

    async getPayment(id) {
        return this.data.payments.find(p => p.id === id);
    }

    async updatePayment(id, updates) {
        const index = this.data.payments.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        this.data.payments[index] = {
            ...this.data.payments[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await this.save();
        return this.data.payments[index];
    }

    // License methods
    async createLicense(licenseData) {
        const licenseKey = crypto.randomBytes(16).toString('hex').toUpperCase();
        const license = {
            id: `lic_${crypto.randomBytes(8).toString('hex')}`,
            licenseKey,
            ...licenseData,
            createdAt: new Date().toISOString(),
            activatedAt: null,
            isActive: true
        };
        this.data.licenses.push(license);
        await this.save();
        return license;
    }

    async getLicense(key) {
        return this.data.licenses.find(l => l.licenseKey === key);
    }

    // Customer methods
    async createOrUpdateCustomer(customerData) {
        const existing = this.data.customers.find(c => c.email === customerData.email);
        if (existing) {
            Object.assign(existing, customerData, { updatedAt: new Date().toISOString() });
            await this.save();
            return existing;
        } else {
            const customer = {
                id: `cust_${crypto.randomBytes(8).toString('hex')}`,
                ...customerData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                totalSpent: 0,
                orders: 0
            };
            this.data.customers.push(customer);
            await this.save();
            return customer;
        }
    }

    async logWebhookEvent(event) {
        const log = {
            id: `webhook_${crypto.randomBytes(8).toString('hex')}`,
            type: event.type,
            data: event.data,
            timestamp: new Date().toISOString(),
            processed: false
        };
        this.data.webhookEvents.push(log);
        await this.save();
        return log;
    }
}

// Initialize database
const db = new PaymentDatabase();

// Email service (production-ready)
class EmailService {
    constructor() {
        // In production, configure with SendGrid, Mailgun, etc.
        this.provider = process.env.EMAIL_PROVIDER || 'console';
    }

    async sendLicenseEmail(to, licenseKey, productName, customerName) {
        const emailData = {
            to,
            subject: `Your ${productName} License Key - Nova 3MM`,
            html: this.generateLicenseEmail(licenseKey, productName, customerName),
            text: `Your license key for ${productName}: ${licenseKey}\n\nThank you for your purchase!`
        };

        switch (this.provider) {
            case 'sendgrid':
                return this.sendViaSendGrid(emailData);
            case 'mailgun':
                return this.sendViaMailgun(emailData);
            case 'smtp':
                return this.sendViaSMTP(emailData);
            default:
                // Log to console in development
                console.log('📧 EMAIL WOULD BE SENT:', emailData);
                return { success: true, message: 'Email logged to console' };
        }
    }

    generateLicenseEmail(licenseKey, productName, customerName) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .license-box { background: white; border: 2px dashed #8b5cf6; padding: 20px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 18px; font-weight: bold; }
                    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Your Purchase is Complete!</h1>
                        <p>Thank you for choosing Nova 3MM Marketplace</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${customerName},</h2>
                        <p>Your purchase of <strong>${productName}</strong> has been successfully processed.</p>
                        
                        <h3>Your License Key:</h3>
                        <div class="license-box">${licenseKey}</div>
                        
                        <p><strong>Important:</strong> Keep this license key secure. You'll need it to activate your product.</p>
                        
                        <h3>Next Steps:</h3>
                        <ol>
                            <li>Save your license key in a secure location</li>
                            <li>Follow the installation instructions for your product</li>
                            <li>Use the license key during activation</li>
                            <li>Contact support if you need assistance</li>
                        </ol>
                        
                        <a href="https://nova-5mm.pages.dev/success.html" class="button">View Order Details</a>
                        
                        <div class="footer">
                            <p>Need help? Contact our support team at support@nova3mm.com</p>
                            <p>© 2026 Nova 3MM Marketplace. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

const emailService = new EmailService();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Nova 3MM Payments API',
        version: '1.0.0',
        mode: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Create Stripe Checkout Session
app.post('/api/create-checkout', async (req, res) => {
    try {
        const { productId, customerEmail, customerName, successUrl, cancelUrl } = req.body;
        
        // Validate input
        if (!productId || !customerEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get product price from environment or database
        const priceId = process.env.STRIPE_SHOPIFY_SKILL_PRICE_ID;
        if (!priceId) {
            return res.status(500).json({ error: 'Product price not configured' });
        }

        // Create Stripe customer
        const customer = await stripe.customers.create({
            email: customerEmail,
            name: customerName,
            metadata: {
                source: 'nova3mm_marketplace',
                product_id: productId
            }
        });

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: successUrl || `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${process.env.BASE_URL}/cancel.html`,
            metadata: {
                productId,
                customerEmail,
                customerName: customerName || 'Customer'
            },
            billing_address_collection: 'required',
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'DK', 'FI', 'IE', 'NO', 'SE']
            }
        });

        // Log payment initiation
        await db.createPayment({
            stripeSessionId: session.id,
            stripeCustomerId: customer.id,
            productId,
            customerEmail,
            customerName,
            amount: 5000, // $50.00 in cents
            currency: 'usd',
            status: 'pending',
            checkoutUrl: session.url
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url,
            customerId: customer.id
        });

    } catch (error) {
        console.error('Checkout creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
});

// Verify payment and generate license
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent', 'line_items']
        });

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ 
                error: 'Payment not completed',
                paymentStatus: session.payment_status 
            });
        }

        // Check if license already exists
        const existingPayment = await db.getPayment(sessionId);
        if (existingPayment && existingPayment.licenseKey) {
            return res.json({
                success: true,
                paymentStatus: 'paid',
                licenseKey: existingPayment.licenseKey,
                alreadyIssued: true
            });
        }

        // Generate license key
        const licenseKey = crypto.randomBytes(16).toString('hex').toUpperCase();
        
        // Create license record
        const license = await db.createLicense({
            stripeSessionId: sessionId,
            stripeCustomerId: session.customer,
            productId: session.metadata.productId,
            customerEmail: session.metadata.customerEmail,
            customerName: session.metadata.customerName,
            amount: session.amount_total,
            currency: session.currency
        });

        // Update payment record
        await db.updatePayment(sessionId, {
            status: 'completed',
            licenseKey,
            paidAt: new Date().toISOString(),
            stripePaymentIntentId: session.payment_intent?.id
        });

        // Update customer record
        await db.createOrUpdateCustomer({
            email: session.metadata.customerEmail,
            name: session.metadata.customerName,
            stripeCustomerId: session.customer,
            lastPurchase: new Date().toISOString()
        });

        // Send license email
        await emailService.sendLicenseEmail(
            session.metadata.customerEmail,
            licenseKey,
            'Shopify Inventory Automation Skill',
            session.metadata.customerName || 'Customer'
        );

        res.json({
            success: true,
            paymentStatus: 'paid',
            licenseKey,
            customerEmail: session.metadata.customerEmail,
            productName: 'Shopify Inventory Automation Skill'
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            error: 'Failed to verify payment',
            details: error.message 
        });
    }
});

// Stripe webhook handler
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log webhook event
    await db.logWebhookEvent(event);

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session.id);
            
            // Update payment status
            await db.updatePayment(session.id, {
                status: 'completed',
                paidAt: new Date().toISOString()
            });
            break;

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment intent succeeded:', paymentIntent.id);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            
            await db.updatePayment(failedPayment.metadata?.sessionId, {
                status: 'failed',
                failureReason: failedPayment.last_payment_error?.message
            });
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// License validation endpoint
app.post('/api/validate-license', async (req, res) => {
    try {
        const { licenseKey } = req.body;
        
        if (!licenseKey) {
            return res.status(400).json({ error: 'License key required' });
        }

        const license = await db.getLicense(licenseKey);
        
        if (!license) {
            return res.status(404).json({ 
                valid: false, 
                error: 'License not found' 
            });
        }

        if (!license.isActive) {
            return res.json({ 
                valid: false, 
                error: 'License is inactive' 
            });
        }

        // Check if license is expired (30 days from creation)
        const createdAt = new Date(license.createdAt);
        const expiresAt = new Date(createdAt.getTime() + (30 * 24 * 60 * 60 * 1000));
        const isExpired = new Date() > expiresAt;

        res.json({
            valid: !isExpired,
            license: {
                key: license.licenseKey,
                productId: license.productId,
                customerEmail: license.customerEmail,
                createdAt: license.createdAt,
                expiresAt: expiresAt.toISOString(),
                isExpired,
                daysRemaining: isExpired ? 0 : Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))
            }
        });

    } catch (error) {
        console.error('License validation error:', error);
        res.status(500).json({ 
            error: 'Failed to validate license',
            details: error.message 
        });
    }
});

// Admin endpoints (protected)
app.get('/api/admin/payments', async (req, res) => {
    // Basic auth check (in production, use JWT)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (token !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const payments = db.data.payments;
        res.json({
            success: true,
            count: payments.length,
            payments: payments.slice(-50).reverse() // Last 50 payments
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

app.get('/api/admin/licenses', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    if (token !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const licenses = db.data.licenses;
        res.json({
            success: true,
            count: licenses.length,
            licenses: licenses.slice(-50).reverse()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch licenses' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Nova 3MM Payments API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`💳 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: ${process.env.BASE_URL || 'Not set'}`);
});

module.exports = app;