// API endpoint for secure skill package downloads
export default async function handler(req, res) {
  const { id } = req.query;
  
  // Validate download ID
  if (!id || id.length !== 24) {
    return res.status(400).json({ error: 'Invalid download ID' });
  }
  
  // In production, you would:
  // 1. Verify the ID corresponds to a valid purchase
  // 2. Check download limits
  // 3. Log the download for analytics
  // 4. Serve from CDN
  
  // For now, redirect to GitHub raw file
  const downloadUrl = 'https://github.com/LovableAiLab/Nova/raw/main/shopify-inventory-skill.tar.gz';
  
  // Set headers for file download
  res.setHeader('Content-Type', 'application/gzip');
  res.setHeader('Content-Disposition', `attachment; filename="shopify-inventory-skill.tar.gz"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Redirect to actual file (in production, you would proxy or serve directly)
  res.redirect(307, downloadUrl);
  
  // Log the download (in production)
  console.log(`Download requested: ID=${id}, IP=${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
}

// For Vercel serverless deployment
export const config = {
  api: {
    externalResolver: true,
  },
};