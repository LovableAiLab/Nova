// Simple webhook handler for Stripe payments
// This would be deployed as a serverless function to handle payment success
// and send custom email receipts with license keys

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a license key
function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let license = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) license += '-';
    license += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return license;
}

// Handle successful payment webhook
async function handlePaymentSuccess(event) {
  const session = event.data.object;
  
  console.log('💰 Payment successful:', session.id);
  console.log('Customer email:', session.customer_details?.email);
  console.log('Amount:', session.amount_total / 100);
  
  // Generate license key
  const licenseKey = generateLicenseKey();
  
  // Send email with license key
  const mailOptions = {
    from: `"Nova 3MM Marketplace" <${process.env.EMAIL_FROM || 'support@nova3mm.com'}>`,
    to: session.customer_details?.email,
    subject: '🎉 Your Nova 3MM License Key & Download Instructions',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .license-box { background: white; border: 2px dashed #10b981; padding: 20px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 18px; font-weight: bold; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Thank You for Your Purchase!</h1>
            <p>Your Shopify Inventory Automation Skill is ready</p>
          </div>
          
          <div class="content">
            <h2>Your License Details</h2>
            <p><strong>Product:</strong> Shopify Inventory Automation Skill</p>
            <p><strong>License Type:</strong> Commercial License</p>
            <p><strong>Order ID:</strong> ${session.id}</p>
            <p><strong>Amount Paid:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
            
            <div class="license-box">
              <strong>LICENSE KEY:</strong><br>
              ${licenseKey}
            </div>
            
            <h3>📥 Download Instructions</h3>
            <p>1. Visit: <a href="https://github.com/LovableAiLab/shopify-inventory-skill">GitHub Repository</a></p>
            <p>2. Download the skill files</p>
            <p>3. Follow the installation guide in README.md</p>
            <p>4. Use the license key above during setup</p>
            
            <a href="https://github.com/LovableAiLab/shopify-inventory-skill" class="button">📦 Download Skill Files</a>
            
            <h3>🛠️ Setup Support</h3>
            <p>Need help? Contact our support team:</p>
            <p>📧 Email: support@nova3mm.com</p>
            <p>📚 Documentation: <a href="https://docs.nova3mm.com">docs.nova3mm.com</a></p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply directly.</p>
              <p>© 2026 Nova 3MM Marketplace. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  
  try {
    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', session.customer_details?.email);
    
    // Store license key in Stripe metadata for future reference
    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...session.metadata,
        license_key: licenseKey,
        email_sent: 'true',
        email_sent_at: new Date().toISOString(),
      },
    });
    
    return { success: true, licenseKey };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

// Main webhook handler
module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const result = await handlePaymentSuccess(event);
      if (result.success) {
        res.json({ received: true, licenseKey: result.licenseKey });
      } else {
        res.status(500).json({ error: result.error });
      }
      break;
      
    case 'payment_intent.succeeded':
      console.log('💳 Payment intent succeeded');
      res.json({ received: true });
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
      res.json({ received: true });
  }
};