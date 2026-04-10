# GITHUB PAGES DEPLOYMENT GUIDE

## 🎯 Objective
Deploy the tripwire landing page to GitHub Pages for free hosting with custom domain support.

## 📋 Prerequisites

### 1. GitHub Account
- **Required:** GitHub account (you have: LovableAiLab)
- **Repository:** Already created: `LovableAiLab/Nova`

### 2. Local Git Setup
- **Git installed:** `git --version`
- **SSH key configured** (recommended) or HTTPS with token
- **Repository cloned:** `git clone https://github.com/LovableAiLab/Nova.git`

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Landing Page Files

**Current structure:**
```
/root/.openclaw/workspace/nova/landing/
├── tripwire-landing.html
├── thank-you.html
├── vercel.json
├── api/download.js
└── deploy.sh
```

**Required for GitHub Pages:**
1. Move files to `docs/` folder OR root of `gh-pages` branch
2. GitHub Pages serves from:
   - `docs/` folder in main branch
   - OR root of `gh-pages` branch
   - OR root of main branch (configurable)

### Step 2: Manual Deployment Process

#### Option A: Using `docs/` folder (Simplest)
```bash
# 1. Clone your repository (if not already)
git clone https://github.com/LovableAiLab/Nova.git
cd Nova

# 2. Create docs directory
mkdir -p docs

# 3. Copy landing page files
cp /root/.openclaw/workspace/nova/landing/tripwire-landing.html docs/
cp /root/.openclaw/workspace/nova/landing/thank-you.html docs/
cp /root/.openclaw/workspace/nova/landing/api/download.js docs/

# 4. Create index.html redirect (optional)
echo '<meta http-equiv="refresh" content="0; url=tripwire-landing.html">' > docs/index.html

# 5. Commit and push
git add docs/
git commit -m "Deploy landing page to GitHub Pages"
git push origin main
```

#### Option B: Using `gh-pages` branch
```bash
# 1. Create and switch to gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# 2. Copy landing page files to root
cp /root/.openclaw/workspace/nova/landing/tripwire-landing.html .
cp /root/.openclaw/workspace/nova/landing/thank-you.html .
# ... etc

# 3. Commit and push
git add .
git commit -m "Deploy landing page"
git push origin gh-pages

# 4. Switch back to main
git checkout main
```

### Step 3: Configure GitHub Pages

1. Go to: https://github.com/LovableAiLab/Nova/settings/pages
2. **Source:** Select deployment source:
   - **Branch:** `gh-pages` (if using Option B)
   - **Folder:** `/docs` (if using Option A)
3. **Custom domain:** (Optional) Enter your domain
4. **Enforce HTTPS:** Enable (recommended)
5. Click **"Save"**

### Step 4: Verify Deployment

1. **Wait 1-2 minutes** for deployment
2. **Visit your site:**
   - Default: `https://lovableailab.github.io/Nova/`
   - With docs folder: `https://lovableailab.github.io/Nova/tripwire-landing.html`
3. **Check deployment status:** Settings → Pages → "Visit site"

## 🔧 Configuration Files

### Create `.nojekyll` file (Important!)
GitHub Pages uses Jekyll by default, which ignores files starting with `_`. Create empty `.nojekyll` file:

```bash
touch docs/.nojekyll
# OR for gh-pages branch
touch .nojekyll
```

### Create `CNAME` file (For custom domain)
```bash
echo "tripwire.nova.openclaw.ai" > docs/CNAME
# OR
echo "tripwire.nova.openclaw.ai" > CNAME
```

### Update `api/download.js` for GitHub Pages
GitHub Pages doesn't support serverless functions. Update to use redirect:

```javascript
// For GitHub Pages, use simple redirect
window.location.href = 'https://github.com/LovableAiLab/Nova/raw/main/shopify-inventory-skill.tar.gz';
```

## 📁 Final File Structure

### For `/docs` folder approach:
```
Nova/
├── docs/
│   ├── .nojekyll
│   ├── CNAME (optional)
│   ├── tripwire-landing.html
│   ├── thank-you.html
│   ├── index.html (redirect)
│   └── assets/ (if any images)
├── shopify-inventory-skill/
├── scripts/
└── README.md
```

### For `gh-pages` branch:
```
gh-pages branch root:
├── .nojekyll
├── CNAME (optional)
├── tripwire-landing.html
├── thank-you.html
├── index.html
└── assets/
```

## 🔗 URL Structure

### Default GitHub Pages URL:
- **Main page:** `https://lovableailab.github.io/Nova/tripwire-landing.html`
- **Thank you:** `https://lovableailab.github.io/Nova/thank-you.html`
- **Download:** `https://lovableailab.github.io/Nova/api/download.js?id=123`

### With custom domain (tripwire.nova.openclaw.ai):
- **Main page:** `https://tripwire.nova.openclaw.ai/tripwire-landing.html`
- **Thank you:** `https://tripwire.nova.openclaw.ai/thank-you.html`

## ⚡ Performance Optimization

### GitHub Pages Limits:
- **Bandwidth:** 100GB/month (soft)
- **Builds:** 10/minute (hard)
- **File size:** 100MB max
- **Our usage:** ~30KB/page = 3.3M pageviews/month

### Optimization Tips:
1. **Use CDN for assets:** Tailwind CSS, Font Awesome (already done)
2. **Minify HTML:** Optional (already minimal)
3. **Enable compression:** GitHub Pages does this automatically
4. **Cache headers:** GitHub Pages sets optimal cache headers

## 🔐 Security Considerations

### GitHub Pages Security:
- **HTTPS enforced:** Yes (with custom domain too)
- **SSL certificate:** Provided by GitHub (Let's Encrypt)
- **DDoS protection:** GitHub infrastructure
- **Access control:** Public only (no private pages on free tier)

### Custom Domain Security:
- **DNS verification:** Required
- **HTTPS enforcement:** Automatic after DNS propagates
- **Certificate renewal:** Automatic by GitHub

## 🚨 Common Issues & Solutions

### Issue: Page not updating
- **Solution:** Wait 1-5 minutes for cache
- **Check:** GitHub Actions tab for build errors
- **Verify:** Files are in correct location

### Issue: Custom domain not working
- **Solution:** Check DNS records (A records to GitHub IPs)
- **Wait:** DNS propagation can take 24-48 hours
- **Verify:** CNAME file in repository

### Issue: Jekyll processing issues
- **Solution:** Add `.nojekyll` file to root
- **Check:** Files not starting with `_`
- **Verify:** File extensions correct (.html not .htm)

### Issue: API endpoints not working
- **Solution:** GitHub Pages is static only
- **Workaround:** Use client-side JavaScript or external service
- **Alternative:** Use Netlify/Vercel for serverless functions

## 📊 Analytics Integration

### Add to landing page:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### GitHub Pages Analytics:
- **Built-in:** GitHub provides basic traffic analytics
- **Access:** Repository Insights → Traffic
- **Limits:** 14-day retention, no real-time

## 🔄 Continuous Deployment

### Manual Deployment Workflow:
1. Make changes to landing page files
2. Copy to `docs/` folder
3. Commit and push to main branch
4. GitHub Pages auto-deploys within minutes

### Automated Deployment (Optional):
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 🎯 Testing After Deployment

### Functional Tests:
- [ ] Homepage loads without errors
- [ ] Mobile responsive design works
- [ ] Form validation functions
- [ ] Stripe payment link works (with your link)
- [ ] Thank you page accessible
- [ ] Download links work

### Performance Tests:
- [ ] Page load < 3 seconds
- [ ] HTTPS working (padlock icon)
- [ ] No mixed content warnings
- [ ] Mobile-friendly test passes

### Analytics Tests:
- [ ] Google Analytics tracking
- [ ] Conversion tracking
- [ ] UTM parameter support

## 💰 Cost & Limitations

### Free Tier (GitHub Pages):
- **Cost:** $0
- **Storage:** 1GB
- **Bandwidth:** 100GB/month
- **Builds:** 10 builds per hour
- **Custom domain:** Supported
- **HTTPS:** Supported

### When to Upgrade:
- **>100GB/month bandwidth:** Consider CDN
- **Need serverless functions:** Use Netlify/Vercel
- **Need private pages:** GitHub Pro ($4/month)
- **Enterprise features:** GitHub Enterprise

## 📞 Support Resources

### GitHub Pages Documentation:
- **Official docs:** https://docs.github.com/en/pages
- **Custom domains:** https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **Troubleshooting:** https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-jekyll-build-errors-for-github-pages-sites

### Community Support:
- **GitHub Community:** https://github.community/
- **Stack Overflow:** `github-pages` tag
- **GitHub Support:** https://support.github.com/

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] Stripe account created and configured
- [ ] Stripe payment link generated
- [ ] Landing page updated with production Stripe link
- [ ] Custom domain configured (optional)
- [ ] Analytics tracking code added

### Deployment:
- [ ] Files copied to `docs/` folder or `gh-pages` branch
- [ ] `.nojekyll` file created
- [ ] `CNAME` file created (if using custom domain)
- [ ] Files committed and pushed
- [ ] GitHub Pages enabled in settings
- [ ] Custom domain configured (if using)

### Post-Deployment:
- [ ] Site accessible via GitHub Pages URL
- [ ] Custom domain working (if configured)
- [ ] HTTPS enforced
- [ ] All links and forms working
- [ ] Test purchase completed
- [ ] Analytics tracking verified

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Test complete funnel:** Visitor → Purchase → Thank You → Download
2. **Set up email automation:** Welcome email, audit delivery
3. **Configure analytics:** Conversion tracking, funnel analysis
4. **Implement retargeting:** Ads for abandoned carts
5. **Monitor performance:** Conversion rate, bounce rate, revenue

**Estimated deployment time:** 15-30 minutes  
**Cost:** $0 (GitHub Pages free)  
**Uptime:** 99.9% (GitHub infrastructure)