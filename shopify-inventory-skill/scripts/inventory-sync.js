#!/usr/bin/env node

/**
 * Inventory Synchronization Engine
 * Syncs inventory across suppliers and Shopify
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { Readable } = require('stream');

class InventorySync {
  constructor(configPath = './configs/inventory.json') {
    this.configPath = configPath;
    this.suppliers = {};
    this.inventoryCache = new Map();
    this.syncHistory = [];
  }

  async initialize() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      this.suppliers = config.suppliers.reduce((acc, supplier) => {
        acc[supplier.name] = supplier;
        return acc;
      }, {});
      
      this.rules = config.rules;
      this.alerts = config.alerts;
      this.forecasting = config.forecasting;
      this.optimization = config.optimization;
      this.syncConfig = config.sync;
      
      console.log(`InventorySync initialized with ${Object.keys(this.suppliers).length} suppliers`);
      return true;
    } catch (error) {
      console.error('Failed to initialize InventorySync:', error.message);
      return false;
    }
  }

  async fetchSupplierInventory(supplierName) {
    const supplier = this.suppliers[supplierName];
    if (!supplier) {
      throw new Error(`Supplier ${supplierName} not found`);
    }

    try {
      switch (supplier.type) {
        case 'api':
          return await this.fetchFromAPI(supplier);
        case 'csv':
          return await this.fetchFromCSV(supplier);
        case 'ftp':
          return await this.fetchFromFTP(supplier);
        default:
          throw new Error(`Unsupported supplier type: ${supplier.type}`);
      }
    } catch (error) {
      console.error(`Error fetching from supplier ${supplierName}:`, error.message);
      throw error;
    }
  }

  async fetchFromAPI(supplier) {
    const response = await axios.get(supplier.endpoint, {
      headers: {
        'Authorization': `Bearer ${supplier.api_key}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Transform API response to standard format
    return response.data.map(item => ({
      sku: item.sku || item.product_code,
      quantity: parseInt(item.quantity || item.stock || 0),
      cost: parseFloat(item.cost || item.price || 0),
      leadTime: parseInt(item.lead_time || supplier.lead_time_days || 7),
      updated: item.updated_at || new Date().toISOString()
    }));
  }

  async fetchFromCSV(supplier) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      // In production, this would fetch from URL
      // For now, simulate with mock data
      setTimeout(() => {
        const mockData = [
          { sku: 'SKU001', quantity: 100, cost: 25.99, leadTime: 7 },
          { sku: 'SKU002', quantity: 50, cost: 45.50, leadTime: 14 },
          { sku: 'SKU003', quantity: 200, cost: 12.75, leadTime: 5 }
        ];
        
        // Filter by specific products if configured
        if (supplier.products && supplier.products.length > 0) {
          resolve(mockData.filter(item => supplier.products.includes(item.sku)));
        } else {
          resolve(mockData);
        }
      }, 1000);
    });
  }

  async fetchFromFTP(supplier) {
    // FTP implementation would go here
    // For now, return mock data
    return [
      { sku: 'SKU004', quantity: 75, cost: 32.25, leadTime: 10 },
      { sku: 'SKU005', quantity: 150, cost: 18.99, leadTime: 21 }
    ];
  }

  async syncAllSuppliers() {
    console.log(`Starting sync for ${Object.keys(this.suppliers).length} suppliers`);
    
    const syncResults = {
      timestamp: new Date().toISOString(),
      suppliers: {},
      totalItems: 0,
      updated: 0,
      errors: 0,
      alerts: []
    };

    for (const [supplierName, supplier] of Object.entries(this.suppliers)) {
      if (!supplier.sync_enabled !== false) { // Default to enabled
        try {
          console.log(`Syncing supplier: ${supplierName}`);
          
          const inventory = await this.fetchSupplierInventory(supplierName);
          this.inventoryCache.set(supplierName, {
            data: inventory,
            timestamp: new Date().toISOString()
          });

          syncResults.suppliers[supplierName] = {
            status: 'success',
            items: inventory.length,
            lastUpdated: new Date().toISOString()
          };

          syncResults.totalItems += inventory.length;
          
          // Check for alerts
          const supplierAlerts = this.checkInventoryAlerts(supplierName, inventory);
          if (supplierAlerts.length > 0) {
            syncResults.alerts.push(...supplierAlerts);
          }
          
          // Rate limiting between suppliers
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Failed to sync supplier ${supplierName}:`, error.message);
          
          syncResults.suppliers[supplierName] = {
            status: 'error',
            error: error.message,
            lastUpdated: new Date().toISOString()
          };
          
          syncResults.errors++;
        }
      }
    }

    // Store sync history (keep last 100 entries)
    this.syncHistory.push(syncResults);
    if (this.syncHistory.length > 100) {
      this.syncHistory = this.syncHistory.slice(-100);
    }

    console.log(`Supplier sync completed:`, {
      suppliers: Object.keys(syncResults.suppliers).length,
      items: syncResults.totalItems,
      alerts: syncResults.alerts.length,
      errors: syncResults.errors
    });

    return syncResults;
  }

  checkInventoryAlerts(supplierName, inventory) {
    const alerts = [];
    
    inventory.forEach(item => {
      // Low stock alert
      if (this.alerts.low_stock.enabled && item.quantity <= this.rules.restock_threshold) {
        alerts.push({
          type: 'low_stock',
          supplier: supplierName,
          sku: item.sku,
          quantity: item.quantity,
          threshold: this.rules.restock_threshold,
          timestamp: new Date().toISOString(),
          channels: this.alerts.low_stock.channels
        });
      }
      
      // Out of stock alert
      if (this.alerts.out_of_stock.enabled && item.quantity <= 0) {
        alerts.push({
          type: 'out_of_stock',
          supplier: supplierName,
          sku: item.sku,
          timestamp: new Date().toISOString(),
          channels: this.alerts.out_of_stock.channels,
          urgent: this.alerts.out_of_stock.urgent
        });
      }
    });
    
    return alerts;
  }

  calculateReorderQuantities(inventoryData) {
    const reorders = [];
    
    // Group inventory by SKU across suppliers
    const skuInventory = {};
    
    Object.entries(inventoryData).forEach(([supplierName, cache]) => {
      cache.data.forEach(item => {
        if (!skuInventory[item.sku]) {
          skuInventory[item.sku] = [];
        }
        skuInventory[item.sku].push({
          supplier: supplierName,
          quantity: item.quantity,
          cost: item.cost,
          leadTime: item.leadTime
        });
      });
    });
    
    // Calculate reorder quantities for each SKU
    Object.entries(skuInventory).forEach(([sku, suppliers]) => {
      const totalStock = suppliers.reduce((sum, s) => sum + s.quantity, 0);
      
      // Calculate reorder point
      const dailySales = this.calculateDailySales(sku); // Would come from sales data
      const reorderPoint = dailySales * this.rules.lead_time_days + this.rules.safety_stock;
      
      if (totalStock <= reorderPoint) {
        // Find best supplier for reorder
        const bestSupplier = suppliers.reduce((best, current) => {
          if (!best) return current;
          
          // Consider cost, lead time, and reliability
          const bestScore = (1 / best.cost) * (1 / best.leadTime);
          const currentScore = (1 / current.cost) * (1 / current.leadTime);
          
          return currentScore > bestScore ? current : best;
        });
        
        // Calculate Economic Order Quantity (EOQ)
        const annualDemand = dailySales * 365;
        const orderingCost = 50; // Fixed ordering cost
        const holdingCost = bestSupplier.cost * this.optimization.carrying_cost_percent;
        
        const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
        const reorderQuantity = Math.ceil(Math.max(eoq, this.rules.restock_threshold));
        
        reorders.push({
          sku,
          currentStock: totalStock,
          reorderPoint,
          supplier: bestSupplier.supplier,
          quantity: reorderQuantity,
          cost: bestSupplier.cost * reorderQuantity,
          leadTime: bestSupplier.leadTime,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return reorders;
  }

  calculateDailySales(sku) {
    // In production, this would query sales data
    // For now, return mock data based on SKU
    const mockSales = {
      'SKU001': 5,
      'SKU002': 2,
      'SKU003': 8,
      'SKU004': 3,
      'SKU005': 4
    };
    
    return mockSales[sku] || 1;
  }

  async forecastDemand(sku, days = 30) {
    if (!this.forecasting.enabled) {
      return null;
    }

    try {
      const salesHistory = await this.getSalesHistory(sku, 90); // Last 90 days
      
      if (salesHistory.length < 7) {
        return { sku, forecast: null, confidence: 0, message: 'Insufficient data' };
      }
      
      // Simple exponential smoothing forecast
      const alpha = 0.3; // Smoothing factor
      let forecast = salesHistory[0];
      
      for (let i = 1; i < salesHistory.length; i++) {
        forecast = alpha * salesHistory[i] + (1 - alpha) * forecast;
      }
      
      // Adjust for seasonality if enabled
      if (this.forecasting.seasonal_patterns) {
        forecast = this.applySeasonalAdjustment(sku, forecast);
      }
      
      // Calculate confidence interval
      const errors = salesHistory.map((actual, idx) => 
        Math.abs(actual - (idx > 0 ? salesHistory[idx - 1] : actual))
      );
      const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
      const confidence = Math.max(0, 1 - (meanError / forecast));
      
      return {
        sku,
        forecast: Math.ceil(forecast * days),
        confidence: Math.min(confidence, this.forecasting.confidence_interval),
        method: this.forecasting.method,
        historyDays: salesHistory.length,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error forecasting demand for ${sku}:`, error.message);
      return { sku, forecast: null, error: error.message };
    }
  }

  async getSalesHistory(sku, days) {
    // In production, query database
    // For now, generate mock data
    const history = [];
    for (let i = 0; i < days; i++) {
      const baseSales = this.calculateDailySales(sku);
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      history.push(Math.ceil(baseSales * randomFactor));
    }
    return history;
  }

  applySeasonalAdjustment(sku, forecast) {
    // Simple seasonal adjustment based on month
    const month = new Date().getMonth();
    const adjustments = {
      0: 1.1,  // January
      1: 0.9,  // February
      2: 1.0,  // March
      3: 1.2,  // April
      4: 1.3,  // May
      5: 1.4,  // June
      6: 1.2,  // July
      7: 1.1,  // August
      8: 1.0,  // September
      9: 1.3,  // October
      10: 1.5, // November
      11: 1.8  // December
    };
    
    return forecast * (adjustments[month] || 1.0);
  }

  optimizeInventoryLevels() {
    const optimization = {
      timestamp: new Date().toISOString(),
      recommendations: [],
      savings: 0
    };

    // ABC Analysis
    const abcResults = this.performABCAnalysis();
    optimization.abcAnalysis = abcResults;

    // XYZ Analysis
    const xyzResults = this.performXYZAnalysis();
    optimization.xyzAnalysis = xyzResults;

    // Generate recommendations
    Object.entries(this.inventoryCache).forEach(([supplierName, cache]) => {
      cache.data.forEach(item => {
        const abcClass = abcResults.classification[item.sku];
        const xyzClass = xyzResults.classification[item.sku];
        
        let recommendation = null;
        
        if (abcClass === 'A' && xyzClass === 'X') {
          // High value, predictable demand - keep safety stock low
          recommendation = {
            sku: item.sku,
            action: 'optimize_reorder',
            currentSafety: this.rules.safety_stock,
            recommendedSafety: Math.ceil(this.rules.safety_stock * 0.8),
            reason: 'High value with predictable demand'
          };
        } else if (abcClass === 'C' && xyzClass === 'Z') {
          // Low value, unpredictable demand - consider drop shipping
          recommendation = {
            sku: item.sku,
            action: 'consider_dropship',
            currentStock: item.quantity,
            reason: 'Low value with unpredictable demand'
          };
        }
        
        if (recommendation) {
          optimization.recommendations.push(recommendation);
        }
      });
    });

    // Calculate potential savings
    optimization.savings = optimization.recommendations.reduce((sum, rec) => {
      if (rec.action === 'optimize_reorder') {
        const costReduction = (rec.currentSafety - rec.recommendedSafety) * 
          this.getAverageCost(rec.sku) * this.optimization.carrying_cost_percent;
        return sum + costReduction;
      }
      return sum;
    }, 0);

    return optimization;
  }

  performABCAnalysis() {
    // Calculate total value of inventory
    let totalValue = 0;
    const skuValues = {};
    
    Object.values(this.inventoryCache).forEach(cache => {
      cache.data.forEach(item => {
        const value = item.quantity * item.cost;
        skuValues[item.sku] = (skuValues[item.sku] || 0) + value;
        totalValue += value;
      });
    });
    
    // Sort SKUs by value
    const sortedSkus = Object.entries(skuValues)
      .sort((a, b) => b[1] - a[1]);
    
    // Classify as A (80% of value), B (15%), C (5%)
    const classification = {};
    let cumulativeValue = 0;
    
    sortedSkus.forEach(([sku, value], index) => {
      cumulativeValue += value;
      const percentage = (cumulativeValue / totalValue) * 100;
      
      if (percentage <= 80) {
        classification[sku] = 'A';
      } else if (percentage <= 95) {
        classification[sku] = 'B';
      } else {
        classification[sku] = 'C';
      }
    });
    
    return {
      totalValue,
      skuCount: sortedSkus.length,
      classification,
      timestamp: new Date().toISOString()
    };
  }

  performXYZAnalysis() {
    // XYZ analysis based on demand variability
    // X: Predictable demand (low variability)
    // Y: Moderate variability
    // Z: Unpredictable demand (high variability)
    
    const classification = {};
    
    // For now, mock classification
    // In production, analyze sales history variability
    Object.keys(this.getAllSkus()).forEach(sku => {
      const random = Math.random();
      if (random < 0.7) {
        classification[sku] = 'X';
      } else if (random < 0.9) {
        classification[sku] = 'Y';
      } else {
        classification[sku] = 'Z';
      }
    });
    
    return {
      classification,
      timestamp: new Date().toISOString()
    };
  }

  getAverageCost(sku) {
    let totalCost = 0;
    let totalQuantity = 0;
    
    Object.values(this.inventoryCache).forEach(cache => {
      cache.data.forEach(item => {
        if (item.sku === sku) {
          totalCost += item.cost * item.quantity;
          totalQuantity += item.quantity;
        }
      });
    });
    
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  getAllSkus() {
    const skus = new Set();
    
    Object.values(this.inventoryCache).forEach(cache => {
      cache.data.forEach(item => {
        skus.add(item.sku);
      });
    });
    
    return Array.from(skus);
  }

  getSupplierStats() {
    const stats = {};
    
    Object.entries(this.suppliers).forEach(([name, supplier]) => {
      const cache = this.inventoryCache.get(name);
      
      stats[name] = {
        type: supplier.type,
        syncInterval: supplier.sync_interval,
        products: supplier.products?.length || 'all',
        lastSync: cache?.timestamp || 'never',
        itemCount: cache?.data?.length || 0,
        enabled: supplier.sync_enabled !== false
      };
    });
    
    return {
      suppliers: stats,
      totalSkus: this.getAllSkus().length,
      syncHistoryCount: this.syncHistory.length,
      rules: this.rules,
      alertsEnabled: Object.values(this.alerts).filter(a => a.enabled).length
    };
  }

  clearCache() {
    this.inventoryCache.clear();
    console.log('Inventory cache cleared');
  }
}

// Export for use in OpenClaw
module.exports = InventorySync;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const sync = new InventorySync();
    const initialized = await sync.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize InventorySync');
      process.exit(1);
    }
    
    const command = process.argv[2];
    const supplierName = process.argv[3];
    
    switch (command) {
      case 'sync':
        const results = await sync.syncAllSuppliers();
        console.log(JSON.stringify(results, null, 2));
        break;
      case 'forecast':
        if (!supplierName) {
          console.error('Please provide SKU');
          process.exit(1);
        }
        const forecast = await sync.forecastDemand(supplierName);
        console.log(JSON.stringify(forecast, null, 2));
        break;
      case 'reorders':
        const reorders = sync.calculateReorderQuantities(sync.inventoryCache);
        console.log(JSON.stringify(reorders, null, 2));
        break;
      case 'optimize':
        const optimization = sync.optimizeInventoryLevels();
        console.log(JSON.stringify(optimization, null, 2));
        break;
      case 'stats':
        const stats = sync.getSupplierStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'clear-cache':
        sync.clearCache();
        console.log('Cache cleared');
        break;
      default:
        console.log('Available commands:');
        console.log('  sync - Sync all suppliers');
        console.log('  forecast [sku] - Forecast demand for SKU');
        console.log('  reorders - Calculate reorder quantities');
        console.log('  optimize - Optimize inventory levels');
        console.log('  stats - Get supplier statistics');
        console.log('  clear-cache - Clear inventory cache');
    }
  })().catch(console.error);
}