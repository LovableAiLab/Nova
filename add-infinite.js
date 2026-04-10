const fs = require('fs');

// Read the file
let content = fs.readFileSync('index.html', 'utf8');

// Create the Infinite Intelligence Pass HTML
const infinitePass = `<!-- Infinite Intelligence Pass -->
<div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%); border: 2px solid rgba(139, 92, 246, 0.4); border-radius: 16px; margin: 4rem 0;">
    <div style="color: #8b5cf6; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 1rem;">
        INFINITE INTELLIGENCE PASS
    </div>
    <h2 style="color: #f8fafc; font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">
        Own Every AI Skill We Build. Forever.
    </h2>
    <div style="color: #94a3b8; font-size: 1.1rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
        The final subscription you will ever need. Secure your stake in the Machine Economy.
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
        <div style="color: #f8fafc; font-size: 3.5rem; font-weight: 800; margin-bottom: 0.5rem;">
            $1,000.00
        </div>
        <div style="color: #94a3b8; margin-bottom: 1.5rem;">
            One-time payment · Infinite upgrades · Only 15 licenses remaining
        </div>
        <a href="https://checkout.stripe.com/c/pay/cs_live_a1gIlmmfd2sJEKEtL6W8PKCLFPAOUhGgRONwDTvxMyR7E9LKrlo62maJRR" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 1.1rem;">
            CLAIM YOUR LIFETIME ACCESS
        </a>
    </div>
    
    <div style="color: #94a3b8; font-size: 0.9rem;">
        Secure Checkout Powered by Stripe & x402 · White-Glove Onboarding Included
    </div>
</div>`;

// Find where to insert (before the footer)
const footerIndex = content.indexOf('<footer class="nova-footer"');
if (footerIndex !== -1) {
    // Insert the Infinite Intelligence Pass before the footer
    const newContent = content.slice(0, footerIndex) + infinitePass + content.slice(footerIndex);
    fs.writeFileSync('index.html', newContent);
    console.log('✅ Infinite Intelligence Pass added successfully!');
    
    // Deploy
    const { execSync } = require('child_process');
    console.log('🚀 Deploying to production...');
    execSync('git add index.html', { stdio: 'inherit' });
    execSync('git commit -m "ADD: Infinite Intelligence Pass - $1000 premium package with scarcity and machine economy framing"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n🎉 INFINITE INTELLIGENCE PASS DEPLOYED!');
    console.log('🔗 Live at: https://nova-5mm.pages.dev');
    console.log('\n💰 PREMIUM $1000 PACKAGE FEATURES:');
    console.log('• Infinite Intelligence Pass branding');
    console.log('• "Own Every AI Skill We Build. Forever."');
    console.log('• Machine Economy positioning');
    console.log('• Scarcity: "Only 15 licenses remaining"');
    console.log('• White-Glove Onboarding included');
    console.log('• Stripe & x402 payment options');
    console.log('• Premium $1,000 pricing');
} else {
    console.log('❌ Could not find footer');
}