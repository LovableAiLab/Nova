const fs = require('fs');

console.log('⚡ UPDATING INFINITE INTELLIGENCE PASS...');

let content = fs.readFileSync('index.html', 'utf8');

// Find the Infinite Intelligence Pass section
const infiniteStart = content.indexOf('<!-- Infinite Intelligence Pass -->');
if (infiniteStart === -1) {
    console.log('❌ Could not find Infinite Intelligence Pass section');
    process.exit(1);
}

// Find where this section ends (look for the footer)
const footerStart = content.indexOf('<footer class="nova-footer"', infiniteStart);
const infiniteEnd = footerStart !== -1 ? footerStart : content.indexOf('</div>', infiniteStart + 2000);

if (infiniteEnd === -1) {
    console.log('❌ Could not find end of Infinite Intelligence Pass section');
    process.exit(1);
}

// Create the new story-selling Infinite Intelligence Pass
const newInfiniteSection = `<!-- Infinite Intelligence Pass -->
<div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%); border: 2px solid rgba(139, 92, 246, 0.4); border-radius: 16px; margin: 4rem 0; position: relative;">
    <!-- Premium Badge -->
    <div style="position: absolute; top: 20px; right: 20px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.5px;">
        SOVEREIGN INTELLIGENCE OWNERSHIP
    </div>
    
    <!-- Limited Availability Badge -->
    <div style="position: absolute; top: 20px; left: 20px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
        ⚡ ONLY 15 SOVEREIGNTY LICENSES REMAINING
    </div>
    
    <div style="margin-bottom: 2rem;">
        <div style="color: #8b5cf6; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 1rem;">
            THE FINAL SUBSCRIPTION YOU'LL EVER NEED
        </div>
        <h2 style="color: #f8fafc; font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2;">
            Own Every AI Skill We Build. Forever.
        </h2>
        <div style="color: #94a3b8; font-size: 1.1rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
            Secure your stake in the Machine Economy. Escape subscription serfdom.
        </div>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">The Villain: The SaaS Tax</div>
            <div style="color: #d1d5db; line-height: 1.6; margin-bottom: 1rem;">
                Modern-day serfdom. Every month, you pay for the same tools. Every year, prices increase. Every innovation comes with another subscription. You're funding someone else's empire while your growth is throttled by recurring bills.
            </div>
            
            <div style="color: #10b981; font-weight: 600; margin-bottom: 0.5rem;">The Hero: The Visionary Commander</div>
            <div style="color: #d1d5db; line-height: 1.6; margin-bottom: 1rem;">
                You see beyond monthly bills to sovereign ownership. You're not buying tools—you're securing your stake in the Machine Economy. This is for builders who think in decades, not monthly payments.
            </div>
        </div>
        
        <div style="color: #f8fafc; font-size: 3.5rem; font-weight: 800; margin-bottom: 0.5rem;">
            $1,000.00
        </div>
        <div style="color: #94a3b8; margin-bottom: 1.5rem;">
            One-time payment · Eternal access · Infinite upgrades
        </div>
        
        <a href="https://checkout.stripe.com/c/pay/cs_live_a1gIlmmfd2sJEKEtL6W8PKCLFPAOUhGgRONwDTvxMyR7E9LKrlo62maJRR" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 1.1rem; margin-bottom: 1.5rem;">
            ⚡ SECURE MY SOVEREIGNTY - $1,000 LIFETIME
        </a>
        
        <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem;">
            Own every AI skill forever. Escape subscription serfdom. Lead the Machine Economy.
        </div>
        
        <div style="margin-bottom: 2rem;">
            <div style="color: #f8fafc; font-weight: 600; margin-bottom: 1rem;">The Power You Gain:</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div style="background: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 1rem;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">Total Sovereignty</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        Every skill we build becomes yours—today, tomorrow, forever
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 1rem;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">First-Mover Advantage</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        Deploy cutting-edge AI capabilities years ahead of competitors
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 1rem;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">White-Glove Onboarding</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        Personal deployment assistance ensuring perfect integration
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #f8fafc; font-weight: 600; margin-bottom: 0.5rem;">Traditional vs. Autonomous Business Models:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1rem;">
                    <div style="color: #fca5a5; font-weight: 600; margin-bottom: 0.5rem;">The Rental Model</div>
                    <div style="color: #d1d5db; font-size: 0.9rem; line-height: 1.5;">
                        • Pay monthly forever for the same tools<br>
                        • Risk price increases and feature deprecation<br>
                        • Your growth funds their VC returns<br>
                        • You're a tenant in someone else's ecosystem
                    </div>
                </div>
                <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 1rem;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">The Ownership Model</div>
                    <div style="color: #d1d5db; font-size: 0.9rem; line-height: 1.5;">
                        • <strong>One payment of $1,000—eternal access</strong><br>
                        • Your tools appreciate as we add more value<br>
                        • Your success compounds without monthly overhead<br>
                        • You're building equity in your intelligence stack
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #f8fafc; font-weight: 600; margin-bottom: 0.5rem;">What's Included (Your Sovereign Arsenal):</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
                <div style="background: rgba(139, 92, 246, 0.1); border-radius: 6px; padding: 0.75rem; text-align: center;">
                    <div style="color: #a78bfa; font-weight: 500; font-size: 0.9rem;">Shopify Inventory Automation</div>
                </div>
                <div style="background: rgba(139, 92, 246, 0.1); border-radius: 6px; padding: 0.75rem; text-align: center;">
                    <div style="color: #a78bfa; font-weight: 500; font-size: 0.9rem;">All Future E-commerce Skills</div>
                </div>
                <div style="background: rgba(139, 92, 246, 0.1); border-radius: 6px; padding: 0.75rem; text-align: center;">
                    <div style="color: #a78bfa; font-weight: 500; font-size: 0.9rem;">Customer Service AI Agents</div>
                </div>
                <div style="background: rgba(139, 92, 246, 0.1); border-radius: 6px; padding: 0.75rem; text-align: center;">
                    <div style="color: #a78bfa; font-weight: 500; font-size: 0.9rem;">Supply Chain Optimization</div>
                </div>
            </div>
            <div style="color: #94a3b8; font-size: 0.9rem; font-style: italic;">
                Plus every AI capability we develop—period. Your sovereignty expands with our innovation.
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="color: #f8fafc; font-weight: 600; margin-bottom: 0.5rem;">The Stakes:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="text-align: center; padding: 1rem; background: rgba(239, 68, 68, 0.05); border-radius: 8px;">
                    <div style="color: #fca5a5; font-weight: 600; margin-bottom: 0.5rem;">If You Keep Renting</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        Another year of monthly bills<br>
                        Another round of price increases<br>
                        Watching competitors deploy new AI<br>
                        Calculating if you can afford another subscription
                    </div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.05); border-radius: 8px;">
                    <div style="color: #4ade80; font-weight: 600; margin-bottom: 0.5rem;">If You Own</div>
                    <div style="color: #94a3b8; font-size: 0.9rem;">
                        Complete tool sovereignty<br>
                        Zero recurring costs<br>
                        Every new skill becomes an asset<br>
                        Your intelligence compounds exponentially
                    </div>
                </div>
            </div>
        </div>
        
        <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1.5rem;">
            <div style="color: #d1d5db; font-size: 0.95rem; margin-bottom: 10px; font-weight: 500;">Secure Checkout Powered by</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                <div style="color: #94a3b8; font-size: 0.9rem;">
                    Stripe (Traditional)
                </div>
                <div style="color: #94a3b8; font-size: 0.9rem;">•</div>
                <div style="color: #94a3b8; font-size: 0.9rem;">
                    x402 Protocol (Autonomous)
                </div>
            </div>
            <div style="color: #64748b; font-size: 0.85rem; margin-top: 10px;">
                White-Glove Onboarding Included · Machine Economy Infrastructure
            </div>
        </div>
    </div>
</div>`;

// Replace the section
const newContent = content.slice(0, infiniteStart) + newInfiniteSection + content.slice(infiniteEnd);

fs.writeFileSync('index.html', newContent);
console.log('✅ Infinite Intelligence Pass updated with story-selling copy!');

// Deploy the changes
console.log('\n🚀 DEPLOYING TO PRODUCTION...');
const { execSync } = require('child_process');
execSync('git add index.html', { stdio: 'inherit' });
execSync('git commit -m "STORY-SELLING: Transform Infinite Intelligence Pass with sovereignty narrative and escape-from-SaaS-tax framing"', { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log('\n🎉 INFINITE INTELLIGENCE PASS TRANSFORMATION DEPLOYED!');
console.log('🔗 Live at: https://nova-5mm.pages.dev');
console.log('\n✨ Key changes implemented:');
console.log('• Hero/Villain: "SaaS Tax" vs "Visionary Commander"');
console.log('• Business model framing: Rental vs. Ownership');
console.log('• "Power You Gain" with sovereign benefits');
console.log('• Stakes comparison (If You Keep Renting vs. If You Own)');
console.log('• Sovereign Arsenal visualization');
console.log('• Empowering CTA: "SECURE MY SOVEREIGNTY"');
console.log('• Machine Economy positioning throughout');