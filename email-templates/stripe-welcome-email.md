# Stripe Email Template: Welcome & Download

## Template Name: `shopify-audit-welcome`
**Trigger:** Payment successful (immediate)
**Subject:** Your Shopify Inventory Audit is Ready! ✅

---

**Email Body:**

Hi {{customer_name}},

Thank you for purchasing the Shopify Inventory Automation Audit! 

## 🚀 Your Download is Ready:

**Skill Package:** [Download Shopify Inventory Auditor Skill]({{download_link}})
**SHA-256:** `a28ed98f58115be73c986b766501f2998e1dd19ac5c73691781c9c26f9c96d05`

## 📋 Quick Installation (5 minutes):

1. **Install OpenClaw** (if not already):
   ```bash
   npm install -g openclaw
   ```

2. **Install the skill:**
   ```bash
   clawhub install shopify-inventory-automation
   ```

3. **Configure your Shopify store:**
   - Open `~/.openclaw/skills/shopify-inventory-automation/config.json`
   - Add your Shopify API credentials
   - Save and restart OpenClaw

## 🔍 What Happens Next:

1. **Within 24 hours:** You'll receive your personalized audit analyzing {{shopify_url}}
2. **The audit will show:** Exact revenue leaks, recovery potential, and action plan
3. **Optional upgrades:** $49/month managed service or $1,500+ complete migration

## ❓ Need Help?

- **Priority Setup ($49):** Our team installs & configures everything for you
- **Email:** support@nova.openclaw.ai
- **Telegram:** @NOVA_Support

Welcome to automated inventory management!

Best regards,
The NOVA Team

---

**Stripe Template Variables:**
- `{{customer_name}}` - Customer's name
- `{{download_link}}` - URL to download the skill package
- `{{shopify_url}}` - Customer's Shopify store URL (from checkout)
- `{{payment_id}}` - Stripe payment ID

**Notes for Stripe Setup:**
1. Create template in Stripe Dashboard → Settings → Email
2. Name: `shopify-audit-welcome`
3. Use HTML editor for better formatting
4. Test with your own email first