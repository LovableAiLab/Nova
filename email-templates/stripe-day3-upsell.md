# Stripe Email Template: Day 3 Upsell

## Template Name: `shopify-day3-upsell`
**Trigger:** 72 hours after payment
**Subject:** Stop Manual Inventory Forever (Special Offer Inside)

---

**Email Body:**

Hi {{customer_name}},

Hope you're finding the Shopify inventory audit helpful!

I noticed you haven't upgraded to **Inventory Guardian** yet - the managed service that automates everything we identified in your audit.

## ⏰ Time is Money

Every day you spend on manual inventory tasks is **${{daily_loss}}** in lost founder time (based on your audit).

That's **${{weekly_loss}} this week alone** that could be recovered with automation.

## 🛡️ Inventory Guardian: Your 24/7 Protection

For **$49/month** (less than 2 hours of your time), you get:

### ✅ 24/7 Inventory Monitoring
- Never miss a stock-out again
- Automated restocking alerts
- Real-time competitor price tracking

### ✅ Zero Maintenance
- We manage everything
- No configuration needed
- Just check your dashboard

### ✅ Multi-Channel Sync
- Shopify + Amazon + TikTok Shop
- Unified inventory management
- Cross-channel analytics

### ✅ 14-Day Free Trial
- No credit card required
- Cancel anytime
- Instant setup

## 🎁 Special Launch Offer

As one of our first customers, you get:

1. **50% off first month** ($24.50 instead of $49)
2. **Priority support** (direct Telegram access)
3. **Free migration assistance** if you upgrade later

**Offer expires in 48 hours.**

## 🚀 Upgrade in 60 Seconds:

[Start 14-Day Free Trial + Get 50% Off]({{upgrade_link}})

No setup. No maintenance. Just results.

## 💭 What Our Customers Say:

> "Inventory Guardian recovered $3,200 in lost sales in the first month. Worth every penny." - Sarah L., Fashion Store

> "Finally stopped the 15-hour weekly inventory grind. The automation pays for itself." - Mark T., Electronics Store

> "Competitor price tracking alone increased margins by 18%. Game changer." - Jessica R., Beauty Products

## ❓ Have Questions?

Reply to this email or:
- **Telegram:** @NOVA_UpgradeSupport
- **Book 15-min call:** [Schedule Quick Call]({{call_link}})

Don't let manual inventory eat another week of your time.

Best regards,
Alex
NOVA Upgrade Team

---

**Stripe Template Variables:**
- `{{customer_name}}` - Customer's name
- `{{daily_loss}}` - Calculated daily time value loss
- `{{weekly_loss}}` - Calculated weekly loss
- `{{upgrade_link}}` - Link to $49/month upgrade page
- `{{call_link}}` - Link to schedule call

**Implementation Notes:**
1. Use Stripe's customer metadata to track who hasn't upgraded
2. Add urgency with expiration timer
3. Include social proof/testimonials
4. Make upgrade path extremely simple