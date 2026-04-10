# Email Templates for Tripwire Upsell Sequence

## 📧 Email 1: Welcome & Delivery (0 minutes after purchase)

**Subject:** Your Shopify Inventory Auditor is Ready! 🚀

**Body:**
```
Hi {{first_name}},

Thank you for purchasing the Shopify Inventory Auditor!

📦 **Your download links:**
1. Skill Package: https://nova.openclaw.ai/download/{{order_id}}/shopify-inventory-skill.tar.gz
2. SHA-256 Checksum: a28ed98f58115be73c986b766501f2998e1dd19ac5c73691781c9c26f9c96d05

🔍 **What happens next:**
1. We're analyzing your store ({{shopify_url}}) right now
2. Your personalized inventory audit arrives in 24 hours
3. The audit will show exactly how much revenue you can recover

⚡ **5-Minute Quickstart:**
```bash
# Download and verify
curl -L https://nova.openclaw.ai/download/{{order_id}}/shopify-inventory-skill.tar.gz -o shopify-inventory-skill.tar.gz
echo "a28ed98f58115be73c986b766501f2998e1dd19ac5c73691781c9c26f9c96d05 shopify-inventory-skill.tar.gz" | sha256sum -c

# Install via OpenClaw
openclaw skill install shopify-inventory-skill.tar.gz
```

🛠️ **Need help with setup?**
Book our Priority Setup service ($49) and we'll install and configure everything for you:
👉 https://calendly.com/nova-setup/priority-install

We'll be in touch tomorrow with your audit results!

Best,
The NOVA Team
```

**CTA Button:** "Download Your Skill Package"
**Secondary CTA:** "Book Priority Setup ($49)"

---

## 📧 Email 2: Audit Results (24 hours after purchase)

**Subject:** Your Inventory Audit: {{lost_revenue}} in recoverable revenue

**Body:**
```
Hi {{first_name}},

Your inventory audit is complete. Here's what we found for {{shopify_url}}:

📊 **Audit Summary:**
• Stock-out rate: {{stockout_rate}}%
• Lost monthly revenue: {{lost_revenue}}
• Pricing inefficiency: {{pricing_inefficiency}}%
• Time wasted on inventory: {{hours_wasted}} hours/month

🎯 **Immediate Recovery Potential:**
Based on your {{monthly_revenue}} monthly revenue, you could recover **{{recovery_potential}}/month** by fixing these issues.

🚀 **Recommended Solution: Inventory Guardian ($49/month)**

Our managed service automates all the fixes identified in your audit:

✅ 24/7 inventory monitoring & alerts
✅ Automated restocking based on sales velocity  
✅ Competitor price tracking with auto-adjustments
✅ Multi-channel sync (Shopify + Amazon + TikTok Shop)
✅ Zero-maintenance - we handle all technical operations
✅ Daily optimization reports delivered to your inbox

📈 **ROI Calculation:**
• Your time value: {{hours_wasted}} hours × $50/hour = {{time_cost}}/month
• Lost revenue recovery: {{recovery_potential}}/month  
• Nova cost: $49/month
• **Net gain: {{net_gain}}/month**

👉 **Start 14-Day Free Trial:** https://nova.openclaw.ai/upgrade/tier1?email={{email}}

🏗️ **Considering a Complete Overhaul?**

If your audit revealed significant technical debt, our Migration Agency service ($1,500+) rebuilds your store on a modern stack (Lovable + Vite) with integrated agents, delivering 2-3x performance improvements.

👉 **Free Consultation:** https://calendly.com/nova-migration/audit

**Attached:** Your complete audit report (PDF)

Best,
The NOVA Team
```

**CTA Button:** "Start 14-Day Free Trial"
**Secondary CTA:** "Schedule Migration Consultation"
**Attachment:** personalized_audit.pdf

---

## 📧 Email 3: Consultation Offer (72 hours after purchase)

**Subject:** From {{lost_revenue}} lost to 2-3x growth: Your migration path

**Body:**
```
Hi {{first_name}},

Following up on your audit - I wanted to share what a complete modernization could look like for {{shopify_url}}.

Your audit showed {{lost_revenue}} in recoverable revenue from inventory issues alone. But what if you could 2-3x your entire store's performance?

🏗️ **The Migration Agency Approach:**

We don't just fix symptoms - we rebuild foundations. Here's what a $1,500+ migration includes:

1. **Technical Modernization**
   • Rebuild on Lovable.dev + Vite + React (95+ Lighthouse score)
   • Integrated agent architecture (inventory, customer service, marketing)
   • Performance optimization (2-3x faster load times)

2. **Revenue Optimization**  
   • SEO restructuring (+50% organic traffic potential)
   • Conversion rate optimization (2-3x improvement)
   • Checkout flow optimization (15-30% increase)

3. **Agent Integration**
   • 24/7 inventory management agents
   • Customer service automation
   • Marketing campaign automation
   • Analytics and reporting dashboards

📊 **Case Study: Similar Store**
• Before: $25K/month, 1.8% conversion, 15% stock-out rate
• After migration: $50K/month, 3.2% conversion, 3% stock-out rate
• Investment: $2,500
• ROI: 10x in first year

🎯 **Your Store's Potential:**
Based on your {{monthly_revenue}} revenue, a similar improvement could mean:
• **New monthly revenue:** {{potential_revenue}}  
• **Annual increase:** {{annual_increase}}
• **Migration cost recovery:** {{recovery_timeline}} months

👉 **Free 30-Minute Consultation:** https://calendly.com/nova-migration/audit

During this call, we'll:
1. Review your audit findings in detail
2. Map your exact migration path
3. Calculate precise ROI for your store
4. Answer all your technical questions

No obligation - just clarity on what's possible.

Best,
{{agent_name}}
Technical Founder, NOVA
```

**CTA Button:** "Schedule Free Consultation"
**No secondary CTA** (focus on high-ticket conversion)

---

## 📧 Email 4: Tier 1 Reminder (7 days after purchase)

**Subject:** Still managing inventory manually? Let's fix that.

**Body:**
```
Hi {{first_name}},

Checking in on your inventory automation progress.

Your audit showed you're losing {{lost_revenue}}/month and wasting {{hours_wasted}} hours on manual tasks.

The merchants who act fastest on audit insights typically recover 80% of identified losses within 30 days.

🚀 **Inventory Guardian - 14-Day Free Trial Still Available**

Try our managed service risk-free:
• No credit card required for trial
• Cancel anytime during 14 days
• We migrate your configuration for you
• Start recovering revenue immediately

👉 **Start Free Trial:** https://nova.openclaw.ai/upgrade/tier1?email={{email}}

💬 **What Our Customers Say:**

"Recovered $2,500 in first month. The automated restocking alone paid for the service 10x over." - Sarah, Fashion Store ($45K/month)

"Went from 15% stock-out rate to 3% in 2 weeks. My customers are happier, my revenue is up 22%." - Mike, Electronics Store ($82K/month)

"Saved 20 hours/week on inventory tasks. Finally have time to focus on growth instead of operations." - Jessica, Home Goods Store ($28K/month)

⏰ **Limited-Time Bonus:**
Start your trial in the next 48 hours and get Priority Setup ($49 value) included free.

👉 **Claim Bonus Trial:** https://nova.openclaw.ai/upgrade/tier1?email={{email}}&bonus=setup

Questions? Reply to this email - I'm here to help.

Best,
The NOVA Team
```

**CTA Button:** "Start Free Trial (With Bonus)"
**Social Proof:** Customer testimonials
**Scarcity:** 48-hour bonus deadline

---

## 📧 Email 5: Win-back (30 days after purchase)

**Subject:** Your audit insights expire soon - claim your recovery

**Body:**
```
Hi {{first_name}},

It's been 30 days since your inventory audit. The insights we discovered about {{shopify_url}} are time-sensitive.

Remember, your audit showed:
• {{lost_revenue}} in monthly recoverable revenue
• {{hours_wasted}} hours wasted on manual tasks
• {{stockout_rate}}% stock-out rate losing sales daily

🔄 **Inventory Patterns Change:**
Competitor prices shift, customer demand evolves, supply chains adjust. The audit snapshot from 30 days ago is already aging.

🎯 **Final Opportunity: 50% Off First 3 Months**

We want you to experience the recovery potential. For the next 7 days only:

**Inventory Guardian: $24.50/month for first 3 months** (50% off)
Then $49/month thereafter

👉 **Claim 50% Discount:** https://nova.openclaw.ai/upgrade/tier1?email={{email}}&discount=50percent

**What you get:**
✅ All features of Inventory Guardian
✅ Priority Setup included ($49 value)
✅ 30-day money-back guarantee
✅ Cancel anytime

📊 **The Math:**
• Your potential recovery: {{recovery_potential}}/month
• 3-month Nova cost: $73.50
• 3-month potential gain: {{three_month_gain}}
• **Net: {{net_three_month_gain}}**

This offer expires in 7 days. After that, your audit insights lose relevance and competitor gaps widen.

👉 **Last Chance:** https://nova.openclaw.ai/upgrade/tier1?email={{email}}&discount=50percent

Questions? Simply reply to this email.

Best,
The NOVA Team
```

**CTA Button:** "Claim 50% Discount"
**Scarcity:** 7-day expiration
**Discount:** 50% off first 3 months

---

## 📧 Bonus: Tier 1 → Tier 3 Upgrade Email

**Subject:** Ready to 2-3x your store? Your Migration Agency path

**Body:**
```
Hi {{first_name}},

I noticed you've been using Inventory Guardian for {{months_active}} months - great to see you recovering {{estimated_recovery}}/month!

You've fixed the inventory leaks. Now let's talk about 2-3x growth.

Based on your store's performance with automation, we estimate a complete modernization could deliver:

📈 **Growth Projection for {{shopify_url}}:**
• Current: {{current_revenue}}/month
• Post-migration: {{potential_revenue}}/month ({{growth_percentage}}% increase)
• Technical debt reduction: {{debt_reduction}}%
• Founder time recovery: {{time_recovery}} hours/month

🏗️ **Migration Agency Special Offer:**

As an existing Tier 1 customer, you qualify for:
• **15% discount** on Migration Agency services
• **Priority scheduling** (2-week implementation vs 4-week standard)
• **Extended support** (6 months included vs 3 months standard)

Total investment: {{discounted_price}} (normally {{full_price}})

👉 **Schedule Strategy Session:** https://calendly.com/nova-migration/existing-client

During this 45-minute session, we'll:
1. Analyze your current automation performance
2. Map exact migration requirements for your stack
3. Calculate precise ROI with your actual data
4. Present implementation timeline and team

Limited to 3 migration slots this month. Currently 1 slot remaining.

Best,
{{agent_name}}
Technical Founder, NOVA
```

**CTA Button:** "Claim Remaining Slot"
**Exclusivity:** Limited slots
**Discount:** 15% for existing customers

---

## 🔧 Template Variables

### Customer Data:
- `{{first_name}}` - Customer first name
- `{{email}}` - Customer email
- `{{shopify_url}}` - Store URL
- `{{monthly_revenue}}` - Revenue range
- `{{order_id}}` - Stripe order ID

### Audit Data:
- `{{lost_revenue}}` - Calculated monthly lost revenue
- `{{stockout_rate}}` - Stock-out percentage
- `{{pricing_inefficiency}}` - Pricing gap percentage
- `{{hours_wasted}}` - Monthly hours wasted
- `{{recovery_potential}}` - Recoverable revenue
- `{{time_cost}}` - Dollar value of wasted time

### Personalization:
- `{{agent_name}}` - Assigned account manager
- `{{months_active}}` - Months as Tier 1 customer
- `{{current_revenue}}` - Current monthly revenue
- `{{estimated_recovery}}` - Estimated monthly recovery

### Calculations:
- `{{net_gain}}` = `{{recovery_potential}}` + `{{time_cost}}` - 49
- `{{potential_revenue}}` = `{{current_revenue}}` × 2 (or 3)
- `{{three_month_gain}}` = `{{recovery_potential}}` × 3
- `{{net_three_month_gain}}` = `{{three_month_gain}}` - 73.50

---

## 🎯 Email Sequence Timing & Goals

| Email | Timing | Goal | Target Conversion |
|-------|--------|------|-------------------|
| 1 | 0 minutes | Deliver product, establish trust | 95% open rate |
| 2 | 24 hours | Present audit, upsell Tier 1 | 30% to Tier 1 trial |
| 3 | 72 hours | Position Tier 3 as investment | 5% to consultation |
| 4 | 7 days | Re-engage, add social proof | 15% to Tier 1 trial |
| 5 | 30 days | Final win-back with discount | 10% to Tier 1 paid |
| Bonus | 60+ days | Tier 1 → Tier 3 upgrade | 20% of active Tier 1 |

**Total expected conversion:** 40-50% of tripwire buyers to paying customers within 60 days.