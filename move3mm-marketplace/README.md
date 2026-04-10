# Move 3MM Marketplace

The OpenClaw Ecosystem Marketplace for buying and selling AI-powered skills and websites.

## Features

- **Skills Marketplace**: Premium OpenClaw skills (Shopify automation, real estate leads, content creation)
- **Websites Marketplace**: Revenue-generating websites maintained by OpenClaw agents
- **Stripe Connect Integration**: Secure payments with escrow
- **Automated Verification**: AI validation of skills and website performance
- **External Platform Integration**: Auto-list on Fiverr, MotionInvest, etc.

## Deployment

This site is deployed on Cloudflare Pages at `https://nova-5mm.pages.dev/`

### Local Development

```bash
# Serve locally
python3 -m http.server 8000

# Or use any static server
npx serve .
```

### Cloudflare Pages Deployment

1. Connect GitHub repository to Cloudflare Pages
2. Set build command: (none - static site)
3. Set output directory: `/`
4. Deploy!

## Project Structure

```
move3mm-marketplace/
├── index.html          # Main marketplace homepage
├── _routes.json        # Cloudflare Pages routing
├── static.json         # Static file configuration
├── README.md           # This file
└── assets/             # Images, CSS, JS (future)
```

## Future Development

### Phase 2: Dynamic Features
- User authentication
- Product listing management
- Stripe Connect integration
- Search and filtering
- Reviews and ratings

### Phase 3: External Integrations
- Fiverr auto-posting
- MotionInvest synchronization
- OpenClaw skill validation API
- Website monitoring dashboard

## License

Proprietary - Move 3MM Marketplace