const ShopifyInventoryAutomation = require('../index');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const skill = new ShopifyInventoryAutomation();
  
  try {
    // Initialize skill
    await skill.initialize();
    
    // Route requests based on path and method
    const { method, url } = req;
    const path = url.split('?')[0];
    
    switch (path) {
      case '/api':
      case '/':
        return handleRoot(req, res, skill);
      case '/api/sync':
        return handleSync(req, res, skill);
      case '/api/monitor':
        return handleMonitor(req, res, skill);
      case '/api/process':
        return handleProcess(req, res, skill);
      case '/api/analyze':
        return handleAnalyze(req, res, skill);
      case '/api/daily':
        return handleDaily(req, res, skill);
      case '/api/status':
        return handleStatus(req, res, skill);
      default:
        return res.status(404).json({
          error: 'Not found',
          availableEndpoints: [
            '/api/sync - Sync inventory',
            '/api/monitor - Monitor competitors',
            '/api/process - Process orders',
            '/api/analyze - Analyze margins',
            '/api/daily - Run daily workflow',
            '/api/status - Get system status'
          ]
        });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

async function handleRoot(req, res, skill) {
  return res.json({
    service: 'Shopify Inventory Automation API',
    version: '1.0.0',
    status: 'operational',
    endpoints: [
      { path: '/api/sync', method: 'POST', description: 'Sync inventory' },
      { path: '/api/monitor', method: 'POST', description: 'Monitor competitors' },
      { path: '/api/process', method: 'POST', description: 'Process orders' },
      { path: '/api/analyze', method: 'POST', description: 'Analyze margins' },
      { path: '/api/daily', method: 'POST', description: 'Run daily workflow' },
      { path: '/api/status', method: 'GET', description: 'Get system status' }
    ],
    documentation: 'https://docs.shopify-inventory-automation.com',
    license: 'Commercial - $50 USDC',
    timestamp: new Date().toISOString()
  });
}

async function handleSync(req, res, skill) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const result = await skill.syncInventory();
  return res.json(result);
}

async function handleMonitor(req, res, skill) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { productIds } = req.body || {};
  
  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'productIds array is required'
    });
  }
  
  const result = await skill.monitorCompetitors(productIds);
  return res.json(result);
}

async function handleProcess(req, res, skill) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { orders } = req.body || {};
  
  if (!orders || !Array.isArray(orders)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'orders array is required'
    });
  }
  
  const result = await skill.processOrders(orders);
  return res.json(result);
}

async function handleAnalyze(req, res, skill) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { products } = req.body || {};
  
  if (!products || !Array.isArray(products)) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'products array is required'
    });
  }
  
  const result = await skill.analyzeMargins(products);
  return res.json(result);
}

async function handleDaily(req, res, skill) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const result = await skill.runDailyWorkflow();
  return res.json(result);
}

async function handleStatus(req, res, skill) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const status = skill.getStatus();
  return res.json(status);
}