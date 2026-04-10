# 🚀 Nova 3MM - Production Stripe Payment System Deployment Guide

## 📋 Overview
This guide will help you deploy a production-ready Stripe payment system for the Nova 3MM marketplace. The system handles:
- Stripe Checkout integration
- License key generation and delivery
- Email notifications
- Payment verification
- Admin dashboard integration

## 🎯 Prerequisites

### 1. **Stripe Account**
- [x] Create Stripe account: https://dashboard.stripe.com/register
- [x] Switch to **Live mode** (not Test mode)
- [x] Get Live API keys:
  - `sk_live_...` (Secret key)
  - `pk_live_...` (Publishable key)

### 2. **Stripe Product Setup**
1. Go to **Products** → **Add Product**
2. Name: `Shopify Inventory Automation Skill`
3. Description: `Professional Shopify inventory management skill for OpenClaw`
4. Add Price: `$50.00` (one-time)
5. Copy Price ID: `price_live_...`

### 3. **Stripe Webhook Setup**
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-server.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy Webhook Secret: `whsec_...`

### 4. **Server Requirements**
- Node.js 18+ and npm
- PostgreSQL/MySQL database (or SQLite for testing)
- SSL certificate (HTTPS)
- Domain name for API
- Email service (SendGrid/Mailgun/Gmail)

## 🚀 Quick Deployment (5 Minutes)

### Option A: Deploy to VPS (Recommended)

```bash
# 1. Connect to your server
ssh user@your-server.com

# 2. Clone the payments system
git clone https://github.com/LovableAiLab/Nova.git
cd Nova/payments-production

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.production .env
nano .env  # Edit with your production keys

# 5. Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "nova-payments"
pm2 save
pm2 startup

# 6. Configure Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/nova-payments
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name payments.nova3mm.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name payments.nova3mm.com;

    ssl_certificate /etc/letsencrypt/live/payments.nova3mm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/payments.nova3mm.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option B: Deploy to Railway/Render/Heroku

1. **Create new project** on your platform
2. **Connect GitHub repository**
3. **Set environment variables** (copy from `.env.production`)
4. **Deploy** automatically

### Option C: Local Development

```bash
# 1. Clone and setup
git clone https://github.com/LovableAiLab/Nova.git
cd Nova/payments-production

# 2. Install dependencies
npm install

# 3. Configure test environment
cp .env.production .env.test
# Edit .env.test with test keys

# 4. Start development server
npm run dev

# 5. Test at http://localhost:3001/health
```

## 🔧 Configuration

### 1. **Environment Variables (.env)**
```env
# REQUIRED: Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SHOPIFY_SKILL_PRICE_ID=price_live_...

# REQUIRED: Server Configuration
NODE_ENV=production
PORT=3001
BASE_URL=https://nova-5mm.pages.dev

# REQUIRED: Email Service (Choose one)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG...

# OR
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.nova3mm.com

# OR
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# REQUIRED: Security
ADMIN_API_KEY=generate_with: openssl rand -hex 32
JWT_SECRET=generate_with: openssl rand -hex 32

# OPTIONAL: Database
DATABASE_URL=postgresql://user:pass@localhost:5432/nova_payments
```

### 2. **Generate Secure Keys**
```bash
# Generate random secure keys
openssl rand -hex 32  # For ADMIN_API_KEY
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For SESSION_SECRET
```

### 3. **Email Service Setup**

**SendGrid (Recommended):**
1. Sign up at https://sendgrid.com
2. Create API key with "Full Access"
3. Verify sender email
4. Copy API key to `SENDGRID_API_KEY`

**Mailgun:**
1. Sign up at https://www.mailgun.com
2. Add domain and verify DNS
3. Create API key
4. Copy to `MAILGUN_API_KEY`

**Gmail SMTP:**
1. Enable 2FA on Google account
2. Generate App Password
3. Use: `SMTP_USER=your@gmail.com`, `SMTP_PASS=app-password`

## 🧪 Testing

### 1. **Test Payment Flow**
```bash
# Use Stripe test mode first
curl -X POST https://payments.nova3mm.com/api/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"productId":"shopify-inventory-skill","customerEmail":"test@example.com"}'
```

### 2. **Test Webhooks Locally**
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3001/api/webhook/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

### 3. **Verify Endpoints**
- Health: `GET /health`
- Create checkout: `POST /api/create-checkout`
- Verify payment: `POST /api/verify-payment`
- Validate license: `POST /api/validate-license`

## 🔒 Security Checklist

- [ ] **HTTPS enabled** (SSL certificate)
- [ ] **Environment variables** not in code
- [ ] **Rate limiting** implemented
- [ ] **CORS properly configured**
- [ ] **Input validation** on all endpoints
- [ ] **SQL injection prevention**
- [ ] **XSS protection headers**
- [ ] **CSRF protection** (if using sessions)
- [ ] **Secure random keys** for secrets
- [ ] **Regular dependency updates**
- [ ] **Logging and monitoring**
- [ ] **Backup strategy** for database

## 📊 Monitoring

### 1. **PM2 Monitoring**
```bash
pm2 monit           # Real-time monitoring
pm2 logs            # View logs
pm2 status          # Check status
pm2 restart all     # Restart all processes
```

### 2. **Logging**
- Application logs: `/var/log/nova-payments.log`
- Error tracking: Sentry/Bugsnag
- Performance: New Relic/Datadog

### 3. **Alerting**
- Payment failures
- Server downtime
- High error rates
- Unusual traffic patterns

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid API Key"**
   - Check `STRIPE_SECRET_KEY` is correct
   - Verify you're using Live keys (not Test)
   - Ensure no extra spaces in .env file

2. **Webhook Failures**
   - Verify webhook URL is correct
   - Check webhook secret matches
   - Test with Stripe CLI locally

3. **Email Not Sending**
   - Check email provider configuration
   - Verify API keys are valid
   - Check spam folder

4. **Database Connection**
   - Verify DATABASE_URL format
   - Check database is running
   - Test connection manually

5. **CORS Errors**
   - Update ALLOWED_ORIGINS in .env
   - Check frontend URL is included
   - Clear browser cache

## 🔄 Maintenance

### Daily:
- Check payment logs
- Monitor error rates
- Verify email delivery

### Weekly:
- Backup database
- Update dependencies
- Review security logs

### Monthly:
- Security audit
- Performance review
- Update SSL certificates

## 📞 Support

- **Stripe Support:** https://support.stripe.com
- **Server Issues:** Check PM2 logs
- **Code Issues:** GitHub repository
- **Emergency:** Contact development team

## 🎯 Go Live Checklist

- [ ] Stripe Live keys configured
- [ ] SSL certificate installed
- [ ] Webhook endpoint verified
- [ ] Email service working
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Test payment successful
- [ ] License delivery working
- [ ] Admin dashboard integrated
- [ ] Rate limiting enabled
- [ ] Security headers configured

## 🚀 Launch Sequence

1. **Final Testing** (Test mode)
2. **Switch to Live keys**
3. **Update marketplace integration**
4. **Monitor first 24 hours**
5. **Review analytics**
6. **Optimize based on data**

---

**✅ Ready for Production!** Your Nova 3MM payment system is now ready to accept real payments and generate revenue from $50 license sales.