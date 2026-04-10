const fs = require('fs');

console.log('🛒 UPDATING SHOPIFY INVENTORY AUTOMATION SKILL...');

let content = fs.readFileSync('index.html', 'utf8');

// Find the Shopify skill section (from "Eliminate Inventory Stress Forever" to before the next section)
const shopifyStart = content.indexOf('<!-- Featured Skill: Eliminate Inventory Stress Forever -->');
if (shopifyStart === -1) {
    console.log('❌ Could not find Shopify skill section');
    process.exit(1);
}

// Find where this section ends (look for the next skill section or the Infinite Intelligence Pass)
const nextSection = content.indexOf('<!-- Infinite Intelligence Pass -->', shopifyStart);
const shopifyEnd = nextSection !== -1 ? nextSection : content.indexOf('</div>', shopifyStart + 2000);

if (shopifyEnd === -1) {
    console.log('❌ Could not find end of Shopify section');
    process.exit(1);
}

// Create the new story-selling Shopify section
const newShopifySection = `<!-- Featured Skill: Eliminate Inventory Stress Forever -->
<div class="skill-card">
    <div class="skill-header">
        <div>
            <h3 class="skill-title">Command Your E-commerce Empire: Eliminate Inventory Stress Forever</h3>
            <div class="skill-subtitle">
                Stop losing revenue to stockouts and human error. Become the Architect of Your Business.
            </div>
        </div>
        <div class="skill-price">
            $50
        </div>
    </div>
    
    <div class="skill-description">
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">The Villain: Inventory Stress</div>
            <div style="color: #d1d5db; line-height: 1.6;">
                The silent thief stealing your sleep, revenue, and sanity. Every stockout loses customers. Every manual error burns money. Every competitor price change you miss is profit slipping away. And you're paying monthly fees just to maintain this fragile system.
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 0.5rem;">The Hero: You, The Business Architect</div>
            <div style="color: #d1d5db; line-height: 1.6;">
                You built this from nothing. You deserve to command your operations with precision, not babysit spreadsheets at 2 AM. It's time to take back control and build an empire that runs itself.
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #8b5cf6; font-weight: 600; margin-bottom: 0.5rem;">The Power You Gain:</div>
            <div class="features-grid">
                <div class="feature-item">
                    <i class="fas fa-crown feature-icon"></i>
                    <span><strong>Sovereign Automation:</strong> Inventory syncs perfectly while you sleep—no errors, no missed opportunities</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-chart-line feature-icon"></i>
                    <span><strong>Competitor Intelligence:</strong> Real-time price monitoring as your strategic advantage</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-tachometer-alt feature-icon"></i>
                    <span><strong>Command Center Control:</strong> Orchestrate multi-store operations from one dashboard</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-bolt feature-icon"></i>
                    <span><strong>Profit Optimization Engine:</strong> Automated order processing that maximizes margins</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-shield-alt feature-icon"></i>
                    <span><strong>Future-Proof Architecture:</strong> Deploy-ready on Vercel with comprehensive testing</span>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #f8fafc; font-weight: 600; margin-bottom: 0.5rem;">Traditional vs. Sovereign Payment:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1rem;">
                    <div style="color: #fca5a5; font-weight: 600; margin-bottom: 0.5rem;">The Old Way (SaaS Tax)</div>
                    <div style="color: #d1d5db; font-size: 0.9rem; line-height: 1.5;">
                        • Monthly fees that never end<br>
                        • Locked into vendor ecosystems<br>
                        • Paying for the privilege of stress<br>
                        • Your data held hostage
                    </div>
                </div>
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 1rem;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">The Sovereign Way</div>
                    <div style="color: #d1d5db; font-size: 0.9rem; line-height: 1.5;">
                        • <strong>One payment of $50—forever</strong><br>
                        • Own your automation outright<br>
                        • No monthly bills, no vendor lock-in<br>
                        • Your data, your rules, your empire
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #f8fafc; font-weight: 600; margin-bottom: 0.5rem;">The Stakes:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="text-align: center; padding: 1rem; background: rgba(239, 68, 68, 0.05); border-radius: 8px;">
                    <div style="color: #fca5a5; font-weight: 600; margin-bottom: 0.5rem;">If You Don't Act</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        More wasted hours<br>
                        More monthly bills<br>
                        More revenue lost<br>
                        Business remains fragile
                    </div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.05); border-radius: 8px;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">If You Command</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        24/7 automated operations<br>
                        Zero subscription fees<br>
                        Complete sovereignty<br>
                        You become the architect
                    </div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <a href="https://checkout.stripe.com/c/pay/cs_live_a1BT4xJBcxmIOMYmDNz7ZEW1YhoDRVUxLQsCn8uHYyBYaKigH80UTbWgVN#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blppbHNgWjA0VktfSnM0aHdPcGh2b0ldSm1RUzVrbEdOZDVyaDR%2FckZUVVxicnNSaHxuYk98NWFLRlBVMHJffV8wbVU2an1JZGoxMERxcU5oSnAyVzBwYGBPMWl1aTBANTVUMWozNG5kNCcpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl" target="_blank" class="nova-payment-button" style="text-decoration: none; width: 100%; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 1.05rem; margin-bottom: 1rem; transition: all 0.3s ease;">
                🚀 COMMAND MY EMPIRE NOW - $50 ONE-TIME
            </a>
            <div style="color: #94a3b8; font-size: 0.9rem; font-style: italic;">
                Escape the SaaS tax. Own your automation forever. Deploy in minutes.
            </div>
        </div>
    </div>
</div>`;

// Replace the section
const newContent = content.slice(0, shopifyStart) + newShopifySection + content.slice(shopifyEnd);

fs.writeFileSync('index.html', newContent);
console.log('✅ Shopify Inventory Automation Skill updated with story-selling copy!');

// Now update the marketplace header
console.log('\n🎯 UPDATING MARKETPLACE HEADER...');
let updatedContent = fs.readFileSync('index.html', 'utf8');

// Find and replace the header text
updatedContent = updatedContent.replace(
    'Discover, purchase, and deploy production-ready AI skills for OpenClaw. Built for humans and autonomous agents.',
    'Build Your Autonomous Empire: Sovereign AI Tools That Never Charge Rent. Escape the SaaS tax. Own your automation forever. Deploy production-ready AI skills on cutting-edge x402 infrastructure.'
);

fs.writeFileSync('index.html', updatedContent);
console.log('✅ Marketplace header updated with empowering copy!');

// Deploy the changes
console.log('\n🚀 DEPLOYING TO PRODUCTION...');
const { execSync } = require('child_process');
execSync('git add index.html', { stdio: 'inherit' });
execSync('git commit -m "STORY-SELLING: Transform Shopify skill with hero/villain narrative and sovereignty framing"', { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log('\n🎉 SHOPIFY SKILL TRANSFORMATION DEPLOYED!');
console.log('🔗 Live at: https://nova-5mm.pages.dev');
console.log('\n✨ Key changes implemented:');
console.log('• Hero/Villain narrative framework');
console.log('• "Power You Gain" instead of features');
console.log('• Traditional vs. Sovereign payment framing');
console.log('• Stakes comparison (If You Don\'t Act vs. If You Command)');
console.log('• Empowering CTA: "COMMAND MY EMPIRE NOW"');
console.log('• Marketplace header: "Build Your Autonomous Empire"');