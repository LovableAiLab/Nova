# Stripe Customer Journey Automation Guide

## 🚀 **AUTOMATE EMAILS FOR EVERY PAYMENT**

### **Step 1: Go to Stripe Customer Journey**
1. **Login to Stripe:** https://dashboard.stripe.com
2. **Navigate to:** Customers → Customer Journey
3. **Click:** "Create journey"

### **Step 2: Create Email Template**
1. **Go to:** Settings → Email
2. **Click:** "Create template"
3. **Name:** `shopify-audit-welcome`
4. **Subject:** `Your Shopify Inventory Audit is Ready! ✅`
5. **Copy HTML** from `stripe-email-template.html`
6. **Save template**

### **Step 3: Create Customer Journey**
1. **Trigger:** Select "Payment succeeded"
2. **Add Action:** Click "+" → "Send email"
3. **Configure:**
   - **Template:** `shopify-audit-welcome`
   - **Send to:** Customer's email
   - **Variables:** 
     - `{{customer_name}}` (auto-filled by Stripe)
     - `{{shopify_url}}` (from custom field)
4. **Save journey**

### **Step 4: Test Automation**
1. **Make test payment** using card `4242 4242 4242 4242`
2. **Check email** arrives within 1-2 minutes
3. **Verify** download link works

## 📧 **EMAIL TEMPLATE VARIABLES:**

Stripe will automatically fill:
- `{{customer_name}}` - Customer's name
- `{{customer_email}}` - Customer's email
- `{{payment_amount}}` - Payment amount ($1.00)
- `{{shopify_url}}` - From custom field at checkout

## ⚙️ **ADVANCED AUTOMATION (OPTIONAL):**

### **Multi-Email Sequence:**
Create additional journeys for:
1. **Day 1:** Welcome + download (immediate)
2. **Day 2:** Audit delivery (24 hours)
3. **Day 3:** $49 upsell (72 hours)
4. **Day 7:** $1,500+ agency offer (7 days)

### **Segment by Revenue:**
Create different journeys for:
- Customers with revenue under $10K
- Customers with revenue over $50K
- Customers who opened previous emails

## 🔧 **TROUBLESHOOTING:**

### **Emails not sending?**
1. **Check journey status:** Is it active?
2. **Check trigger:** "Payment succeeded" not "Payment created"
3. **Check template:** Is it published?
4. **Test payment:** Use test mode card

### **Variables not working?**
1. Custom fields must be collected at checkout
2. Ensure `shopify_url` field is required in payment link
3. Test with actual data

### **Email formatting issues?**
1. Use simple HTML
2. Test in multiple email clients
3. Keep mobile-responsive

## 🎯 **COMPLETE AUTOMATION FLOW:**

```
Customer Payment → Stripe Processes → 
Customer Journey Triggered → Email Sent → 
Customer Receives Download Link → 
24h Later: Audit Email → 
72h Later: Upsell Email → 
7d Later: Agency Email
```

## 💡 **PRO TIPS:**

1. **Test thoroughly** before going live
2. **Monitor open rates** in Stripe dashboard
3. **A/B test** subject lines
4. **Personalize** with customer data
5. **Include clear CTAs** (download, upgrade, contact)

## 📞 **SUPPORT:**

- **Stripe Support:** https://support.stripe.com
- **Customer Journey Docs:** https://stripe.com/docs/customer-journeys
- **Email Templates:** https://dashboard.stripe.com/settings/email

---

**Your email automation will be live in 10 minutes!** 🚀