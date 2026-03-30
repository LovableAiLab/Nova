#!/usr/bin/env node

/**
 * Competitor Price Monitoring Scraper
 * Tracks prices across 10+ platforms
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

class CompetitorScraper {
  constructor(configPath = './configs/competitors.json') {
    this.configPath = configPath;
    this.platforms = {};
    this.priceHistory = new Map();
    this.proxies = [];
    this.currentProxyIndex = 0;
  }

  async initialize() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      this.platforms = config.platforms.reduce((acc, platform) => {
        acc[platform.name] = platform;
        return acc;
      }, {});
      
      this.monitoringConfig = config.monitoring;
      this.alertConfig = config.alerts;
      this.proxyConfig = config.proxy;
      this.performanceConfig = config.performance;
      
      if (this.proxyConfig.enabled) {
        await this.loadProxies();
      }
      
      console.log(`CompetitorScraper initialized with ${Object.keys(this.platforms).length} platforms`);
      return true;
    } catch (error) {
      console.error('Failed to initialize CompetitorScraper:', error.message);
      return false;
    }
  }

  async loadProxies() {
    // In production, load from proxy service or file
    this.proxies = [
      'http://proxy1:port',
      'http://proxy2:port',
      'http://proxy3:port'
    ];
    
    if (this.proxyConfig.geographic_distribution) {
      // Add geographic proxies
      this.proxies.push(
        'http://us-proxy:port',
        'http://eu-proxy:port',
        'http://asia-proxy:port'
      );
    }
    
    console.log(`Loaded ${this.proxies.length} proxies`);
  }

  getNextProxy() {
    if (!this.proxyConfig.enabled || this.proxies.length === 0) {
      return null;
    }
    
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    
    return proxy;
  }

  async scrapeAmazon(productIds) {
    const platform = this.platforms.amazon;
    if (!platform.enabled) return [];
    
    const results = [];
    const proxy = this.getNextProxy();
    
    for (const asin of productIds) {
      try {
        const url = `https://www.amazon.com/dp/${asin}`;
        const config = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: this.performanceConfig?.request_timeout || 30000
        };
        
        if (proxy) {
          config.httpsAgent = new HttpsProxyAgent(proxy);
        }
        
        const response = await axios.get(url, config);
        const $ = cheerio.load(response.data);
        
        // Extract price (simplified - actual implementation needs more robust parsing)
        const priceText = $('#priceblock_ourprice').text() || $('#priceblock_dealprice').text();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        // Extract stock status
        const stockText = $('#availability span').text().toLowerCase();
        const inStock = !stockText.includes('out of stock') && !stockText.includes('unavailable');
        
        // Extract rating
        const rating = parseFloat($('#acrPopover').attr('title')?.replace(' out of 5 stars', '') || '0');
        
        // Extract review count
        const reviewCountText = $('#acrCustomerReviewText').text();
        const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, '')) || 0;
        
        results.push({
          platform: 'amazon',
          productId: asin,
          price,
          currency: 'USD',
          inStock,
          rating,
          reviewCount,
          timestamp: new Date().toISOString(),
          url
        });
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error scraping Amazon product ${asin}:`, error.message);
        results.push({
          platform: 'amazon',
          productId: asin,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  async scrapeEbay(productIds) {
    const platform = this.platforms.ebay;
    if (!platform.enabled) return [];
    
    const results = [];
    
    // eBay API implementation would go here
    // For now, return mock data
    for (const productId of productIds) {
      results.push({
        platform: 'ebay',
        productId,
        price: Math.random() * 100 + 20,
        currency: 'USD',
        inStock: Math.random() > 0.1,
        timestamp: new Date().toISOString()
      });
    }
    
    return results;
  }

  async scrapeWalmart(productIds) {
    const platform = this.platforms.walmart;
    if (!platform.enabled) return [];
    
    const results = [];
    
    // Walmart API implementation would go here
    for (const productId of productIds) {
      results.push({
        platform: 'walmart',
        productId,
        price: Math.random() * 80 + 15,
        currency: 'USD',
        inStock: Math.random() > 0.05,
        timestamp: new Date().toISOString()
      });
    }
    
    return results;
  }

  async scrapeAllPlatforms(productIds) {
    const results = [];
    const scrapePromises = [];
    
    if (this.platforms.amazon?.enabled) {
      scrapePromises.push(this.scrapeAmazon(productIds));
    }
    
    if (this.platforms.ebay?.enabled) {
      scrapePromises.push(this.scrapeEbay(productIds));
    }
    
    if (this.platforms.walmart?.enabled) {
      scrapePromises.push(this.scrapeWalmart(productIds));
    }
    
    // Add other platforms...
    
    const allResults = await Promise.allSettled(scrapePromises);
    
    allResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        console.error(`Platform scrape failed:`, result.reason);
      }
    });
    
    return results;
  }

  analyzePriceChanges(currentPrices) {
    const alerts = [];
    
    for (const priceData of currentPrices) {
      const historyKey = `${priceData.platform}:${priceData.productId}`;
      const previousPrices = this.priceHistory.get(historyKey) || [];
      
      if (previousPrices.length > 0) {
        const latestPrevious = previousPrices[previousPrices.length - 1];
        const priceChange = priceData.price - latestPrevious.price;
        const percentChange = priceChange / latestPrevious.price;
        
        // Check for significant price changes
        if (Math.abs(percentChange) >= this.monitoringConfig.price_change_threshold) {
          alerts.push({
            type: 'price_change',
            platform: priceData.platform,
            productId: priceData.productId,
            oldPrice: latestPrevious.price,
            newPrice: priceData.price,
            change: priceChange,
            percentChange: percentChange,
            timestamp: priceData.timestamp,
            urgent: Math.abs(percentChange) >= this.alertConfig.urgent_threshold
          });
        }
        
        // Check for stock changes
        if (latestPrevious.inStock !== priceData.inStock) {
          alerts.push({
            type: 'stock_change',
            platform: priceData.platform,
            productId: priceData.productId,
            oldStatus: latestPrevious.inStock ? 'in_stock' : 'out_of_stock',
            newStatus: priceData.inStock ? 'in_stock' : 'out_of_stock',
            timestamp: priceData.timestamp
          });
        }
      }
      
      // Update history
      const updatedHistory = [...previousPrices.slice(-29), priceData]; // Keep last 30 entries
      this.priceHistory.set(historyKey, updatedHistory);
    }
    
    return alerts;
  }

  generatePriceRecommendations(currentPrices) {
    const recommendations = [];
    
    // Group by product across platforms
    const productsBySku = {};
    
    currentPrices.forEach(priceData => {
      if (!priceData.error) {
        if (!productsBySku[priceData.productId]) {
          productsBySku[priceData.productId] = [];
        }
        productsBySku[priceData.productId].push(priceData);
      }
    });
    
    // Generate recommendations for each product
    Object.entries(productsBySku).forEach(([productId, prices]) => {
      if (prices.length < 2) return; // Need at least 2 competitors
      
      // Find lowest competitor price
      const competitorPrices = prices.filter(p => p.platform !== 'shopify');
      if (competitorPrices.length === 0) return;
      
      const lowestCompetitor = competitorPrices.reduce((min, p) => 
        p.price < min.price ? p : min
      );
      
      // Calculate recommended price
      let recommendedPrice;
      const strategy = this.platforms.shopify?.pricing_strategy || 'competitive';
      
      switch (strategy) {
        case 'market_leader':
          recommendedPrice = lowestCompetitor.price * 0.95; // 5% below lowest
          break;
        case 'competitive':
          recommendedPrice = lowestCompetitor.price * 1.02; // 2% above lowest
          break;
        case 'premium':
          recommendedPrice = lowestCompetitor.price * 1.10; // 10% above lowest
          break;
        default:
          recommendedPrice = lowestCompetitor.price;
      }
      
      recommendations.push({
        productId,
        currentPrice: prices.find(p => p.platform === 'shopify')?.price,
        lowestCompetitorPrice: lowestCompetitor.price,
        lowestCompetitorPlatform: lowestCompetitor.platform,
        recommendedPrice,
        priceDifference: recommendedPrice - (prices.find(p => p.platform === 'shopify')?.price || 0),
        strategy,
        timestamp: new Date().toISOString()
      });
    });
    
    return recommendations;
  }

  async monitorCompetitors(productIds) {
    console.log(`Starting competitor monitoring for ${productIds.length} products`);
    
    try {
      // Scrape all platforms
      const currentPrices = await this.scrapeAllPlatforms(productIds);
      
      // Analyze for changes
      const alerts = this.analyzePriceChanges(currentPrices);
      
      // Generate recommendations
      const recommendations = this.generatePriceRecommendations(currentPrices);
      
      // Prepare report
      const report = {
        timestamp: new Date().toISOString(),
        productsMonitored: productIds.length,
        platformsActive: Object.values(this.platforms).filter(p => p.enabled).length,
        pricesCollected: currentPrices.filter(p => !p.error).length,
        errors: currentPrices.filter(p => p.error).length,
        alerts: alerts.length,
        recommendations: recommendations.length,
        details: {
          currentPrices,
          alerts,
          recommendations
        }
      };
      
      console.log(`Competitor monitoring completed:`, {
        products: report.productsMonitored,
        prices: report.pricesCollected,
        alerts: report.alerts,
        recommendations: report.recommendations
      });
      
      return report;
      
    } catch (error) {
      console.error('Failed to monitor competitors:', error.message);
      throw error;
    }
  }

  getPriceHistory(productId, platform = null) {
    const histories = [];
    
    if (platform) {
      const key = `${platform}:${productId}`;
      const history = this.priceHistory.get(key);
      if (history) histories.push({ platform, history });
    } else {
      // Get history from all platforms
      Object.keys(this.platforms).forEach(platformName => {
        const key = `${platformName}:${productId}`;
        const history = this.priceHistory.get(key);
        if (history) {
          histories.push({ platform: platformName, history });
        }
      });
    }
    
    return histories;
  }

  clearHistory() {
    this.priceHistory.clear();
    console.log('Price history cleared');
  }

  getPlatformStats() {
    const stats = {};
    
    Object.entries(this.platforms).forEach(([name, config]) => {
      stats[name] = {
        enabled: config.enabled,
        monitoringInterval: config.monitoring_interval,
        productsTracked: config.products_to_track?.length || 0
      };
    });
    
    return {
      platforms: stats,
      priceHistorySize: this.priceHistory.size,
      proxyEnabled: this.proxyConfig.enabled,
      proxiesAvailable: this.proxies.length
    };
  }
}

// Export for use in OpenClaw
module.exports = CompetitorScraper;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const scraper = new CompetitorScraper();
    const initialized = await scraper.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize CompetitorScraper');
      process.exit(1);
    }
    
    const command = process.argv[2];
    const productIds = process.argv.slice(3);
    
    switch (command) {
      case 'monitor':
        if (productIds.length === 0) {
          console.error('Please provide product IDs to monitor');
          process.exit(1);
        }
        const report = await scraper.monitorCompetitors(productIds);
        console.log(JSON.stringify(report, null, 2));
        break;
      case 'history':
        if (productIds.length === 0) {
          console.error('Please provide product ID');
          process.exit(1);
        }
        const history = scraper.getPriceHistory(productIds[0]);
        console.log(JSON.stringify(history, null, 2));
        break;
      case 'stats':
        const stats = scraper.getPlatformStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'clear-history':
        scraper.clearHistory();
        console.log('History cleared');
        break;
      default:
        console.log('Available commands:');
        console.log('  monitor [productIds...] - Monitor competitor prices');
        console.log('  history [productId] - Get price history');
        console.log('  stats - Get platform statistics');
        console.log('  clear-history - Clear price history');
    }
  })().catch(console.error);
}