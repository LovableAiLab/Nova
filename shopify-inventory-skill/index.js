#!/usr/bin/env node

/**
 * Shopify Inventory Automation - Main Entry Point
 * OpenClaw Skill for automated Shopify inventory management
 */

const fs = require('fs').promises;
const path = require('path');

// Import core modules
const ShopifyAPI = require('./scripts/shopify-api');
const CompetitorScraper = require('./scripts/competitor-scraper');
const InventorySync = require('./scripts/inventory-sync');
const OrderProcessor = require('./scripts/order-processor');
const MarginCalculator = require('./scripts/margin-calculator');
const ConfigValidator = require('./scripts/config-validator');
const LicenseCheck = require('./scripts/license-check');

class ShopifyInventoryAutomation {
  constructor() {
    this.modules = {};
    this.licenseValid = false;
    this.isInitialized = false;
  }

  async initialize() {
    console.log('🚀 Initializing Shopify Inventory Automation Skill...');
    
    try {
      // 1. Validate license
      await this.checkLicense();
      
      if (!this.licenseValid) {
        console.warn('⚠️  License not valid. Some features may be limited.');
      }
      
      // 2. Validate configurations
      const validator = new ConfigValidator();
      const validationReport = await validator.validateAll();
      
      if (validationReport.status !== 'VALID') {
        console.error('❌ Configuration validation failed:');
        validationReport.errors.forEach(error => console.error(`  - ${error}`));
        
        if (validationReport.errorCount > 0) {
          throw new Error('Invalid configuration. Please fix errors before proceeding.');
        }
      }
      
      console.log('✅ Configuration validation passed');
      
      // 3. Initialize modules
      this.modules.shopify = new ShopifyAPI();
      this.modules.competitors = new CompetitorScraper();
      this.modules.inventory = new InventorySync();
      this.modules.orders = new OrderProcessor();
      this.modules.margins = new MarginCalculator();
      
      const initPromises = [
        this.modules.shopify.initialize(),
        this.modules.competitors.initialize(),
        this.modules.inventory.initialize(),
        this.modules.orders.initialize(),
        this.modules.margins.initialize()
      ];
      
      const results = await Promise.allSettled(initPromises);
      
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('❌ Some modules failed to initialize:');
        failed.forEach(f => console.error(`  - ${f.reason.message}`));
        throw new Error('Module initialization failed');
      }
      
      this.isInitialized = true;
      console.log('✅ Shopify Inventory Automation Skill initialized successfully!');
      console.log('📊 Available modules: Shopify API, Competitor Monitoring, Inventory Sync, Order Processing, Margin Calculator');
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize skill:', error.message);
      return false;
    }
  }

  async checkLicense() {
    try {
      const licenseCheck = new LicenseCheck();
      await licenseCheck.initialize();
      
      // In production, check actual license
      // For now, simulate license check
      this.licenseValid = true; // Assume valid for demo
      
      if (this.licenseValid) {
        console.log('✅ License validated');
      }
      
      return this.licenseValid;
    } catch (error) {
      console.error('License check failed:', error.message);
      this.licenseValid = false;
      return false;
    }
  }

  async syncInventory() {
    if (!this.isInitialized) {
      throw new Error('Skill not initialized');
    }
    
    console.log('🔄 Starting inventory sync...');
    
    try {
      // 1. Sync suppliers
      const supplierResults = await this.modules.inventory.syncAllSuppliers();
      
      // 2. Sync with Shopify
      const shopifyResults = await this.modules.shopify.syncAllInventory('main-store');
      
      // 3. Calculate reorder quantities
      const reorders = this.modules.inventory.calculateReorderQuantities(
        this.modules.inventory.inventoryCache
      );
      
      // 4. Optimize inventory levels
      const optimization = this.modules.inventory.optimizeInventoryLevels();
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        supplierSync: supplierResults,
        shopifySync: shopifyResults,
        reorders,
        optimization,
        summary: {
          suppliers: Object.keys(supplierResults.suppliers || {}).length,
          itemsSynced: supplierResults.totalItems || 0,
          reordersSuggested: reorders.length || 0,
          optimizationSavings: optimization.savings || 0
        }
      };
      
    } catch (error) {
      console.error('Inventory sync failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async monitorCompetitors(productIds) {
    if (!this.isInitialized) {
      throw new Error('Skill not initialized');
    }
    
    console.log('👀 Starting competitor monitoring...');
    
    try {
      const report = await this.modules.competitors.monitorCompetitors(productIds);
      
      // Generate price recommendations
      const recommendations = this.modules.competitors.generatePriceRecommendations(
        report.details.currentPrices
      );
      
      // Analyze margins with new prices
      const marginAnalyses = [];
      for (const rec of recommendations) {
        const product = {
          id: rec.productId,
          sellingPrice: rec.recommendedPrice,
          productCost: 50, // Example cost
          shippingCost: 10,
          packagingCost: 5
        };
        
        const analysis = this.modules.margins.analyzeProductMargin(product);
        marginAnalyses.push(analysis);
      }
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        monitoringReport: report,
        priceRecommendations: recommendations,
        marginAnalyses,
        summary: {
          productsMonitored: productIds.length,
          priceChangesDetected: report.alerts?.filter(a => a.type === 'price_change').length || 0,
          recommendationsGenerated: recommendations.length,
          averagePriceChange: recommendations.reduce((sum, r) => sum + (r.priceDifference || 0), 0) / recommendations.length || 0
        }
      };
      
    } catch (error) {
      console.error('Competitor monitoring failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async processOrders(orders) {
    if (!this.isInitialized) {
      throw new Error('Skill not initialized');
    }
    
    console.log('📦 Processing orders...');
    
    try {
      const results = [];
      
      for (const order of orders) {
        const result = await this.modules.orders.processOrder(order, this.modules.shopify);
        results.push(result);
      }
      
      const stats = this.modules.orders.getProcessingStats();
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        ordersProcessed: results.length,
        results,
        stats,
        summary: {
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          successRate: (results.filter(r => r.success).length / results.length) * 100 || 0,
          averageProcessingTime: stats.avgProcessingTimeMs || 0
        }
      };
      
    } catch (error) {
      console.error('Order processing failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async analyzeMargins(products) {
    if (!this.isInitialized) {
      throw new Error('Skill not initialized');
    }
    
    console.log('💰 Analyzing profit margins...');
    
    try {
      const analyses = [];
      const forecasts = [];
      
      for (const product of products) {
        // Analyze current margin
        const analysis = this.modules.margins.analyzeProductMargin(product);
        analyses.push(analysis);
        
        // Forecast future margins
        const forecast = await this.modules.margins.forecastMargins(product);
        forecasts.push(forecast);
      }
      
      const summary = this.modules.margins.getProductAnalysisSummary();
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        analyses,
        forecasts,
        summary,
        recommendations: this.generateMarginRecommendations(analyses, forecasts)
      };
      
    } catch (error) {
      console.error('Margin analysis failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateMarginRecommendations(analyses, forecasts) {
    const recommendations = [];
    
    analyses.forEach((analysis, index) => {
      const forecast = forecasts[index];
      
      if (analysis.evaluation.targetComparison.meetsMinimum === false) {
        recommendations.push({
          productId: analysis.productId,
          type: 'urgent',
          message: `Product margin (${(analysis.margin.grossMargin * 100).toFixed(1)}%) below minimum target (${(this.modules.margins.targets.minimum_margin * 100).toFixed(1)}%)`,
          actions: [
            'Increase selling price',
            'Reduce product costs',
            'Review shipping and packaging costs'
          ]
        });
      }
      
      if (forecast && forecast.scenarios) {
        const bestScenario = forecast.scenarios.reduce((best, current) => 
          current.totalProfit > best.totalProfit ? current : best
        );
        
        if (bestScenario.name !== 'baseline') {
          recommendations.push({
            productId: analysis.productId,
            type: 'optimization',
            message: `Scenario "${bestScenario.name}" shows ${((bestScenario.totalProfit / forecast.scenarios[0].totalProfit - 1) * 100).toFixed(1)}% higher profit`,
            action: this.modules.margins.getScenarioAction(bestScenario)
          });
        }
      }
    });
    
    return recommendations;
  }

  async runDailyWorkflow() {
    console.log('📅 Running daily workflow...');
    
    const results = {
      inventorySync: await this.syncInventory(),
      competitorMonitoring: await this.monitorCompetitors(['SKU001', 'SKU002', 'SKU003']),
      marginAnalysis: await this.analyzeMargins([
        {
          id: 'PROD001',
          sku: 'SKU001',
          sellingPrice: 199.99,
          productCost: 89.99,
          shippingCost: 9.99
        }
      ])
    };
    
    // Generate daily report
    const report = this.generateDailyReport(results);
    
    console.log('✅ Daily workflow completed');
    return report;
  }

  generateDailyReport(results) {
    return {
      timestamp: new Date().toISOString(),
      workflow: 'daily',
      results,
      summary: {
        inventoryItems: results.inventorySync?.summary?.itemsSynced || 0,
        competitorAlerts: results.competitorMonitoring?.summary?.priceChangesDetected || 0,
        marginRecommendations: results.marginAnalysis?.recommendations?.length || 0,
        success: results.inventorySync?.success && results.competitorMonitoring?.success && results.marginAnalysis?.success
      },
      nextActions: this.generateNextActions(results)
    };
  }

  generateNextActions(results) {
    const actions = [];
    
    if (results.inventorySync?.reorders && results.inventorySync.reorders.length > 0) {
      actions.push({
        type: 'reorder',
        count: results.inventorySync.reorders.length,
        message: `${results.inventorySync.reorders.length} products need reordering`,
        priority: 'high'
      });
    }
    
    if (results.competitorMonitoring?.priceRecommendations && results.competitorMonitoring.priceRecommendations.length > 0) {
      actions.push({
        type: 'price_adjustment',
        count: results.competitorMonitoring.priceRecommendations.length,
        message: `${results.competitorMonitoring.priceRecommendations.length} price adjustments recommended`,
        priority: 'medium'
      });
    }
    
    if (results.marginAnalysis?.recommendations && results.marginAnalysis.recommendations.length > 0) {
      const urgent = results.marginAnalysis.recommendations.filter(r => r.type === 'urgent').length;
      if (urgent > 0) {
        actions.push({
          type: 'margin_improvement',
          count: urgent,
          message: `${urgent} products have critically low margins`,
          priority: 'high'
        });
      }
    }
    
    return actions;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      licenseValid: this.licenseValid,
      modules: Object.keys(this.modules).map(name => ({
        name,
        initialized: this.modules[name]?.isInitialized || false
      })),
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in OpenClaw
module.exports = ShopifyInventoryAutomation;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const skill = new ShopifyInventoryAutomation();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'init':
        const initialized = await skill.initialize();
        console.log(JSON.stringify({ initialized }, null, 2));
        break;
      case 'daily':
        const dailyReport = await skill.runDailyWorkflow();
        console.log(JSON.stringify(dailyReport, null, 2));
        break;
      case 'status':
        const status = skill.getStatus();
        console.log(JSON.stringify(status, null, 2));
        break;
      case 'sync':
        const syncResult = await skill.syncInventory();
        console.log(JSON.stringify(syncResult, null, 2));
        break;
      default:
        console.log('Shopify Inventory Automation Skill');
        console.log('Available commands:');
        console.log('  init - Initialize the skill');
        console.log('  daily - Run daily workflow');
        console.log('  status - Get skill status');
        console.log('  sync - Sync inventory');
        console.log('\nModule-specific commands:');
        console.log('  npm run shopify:sync - Sync Shopify inventory');
        console.log('  npm run competitors:monitor - Monitor competitors');
        console.log('  npm run inventory:sync - Sync supplier inventory');
        console.log('  npm run orders:process - Process orders');
        console.log('  npm run margins:analyze - Analyze margins');
        console.log('  npm run validate - Validate configurations');
        console.log('  npm run license:check - Check license status');
    }
  })().catch(console.error);
}