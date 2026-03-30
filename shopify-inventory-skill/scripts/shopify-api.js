#!/usr/bin/env node

/**
 * Shopify Admin API Wrapper
 * Lightweight implementation for OpenClaw skill
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class ShopifyAPI {
  constructor(configPath = './configs/shopify.json') {
    this.configPath = configPath;
    this.stores = {};
    this.cache = new Map();
    this.rateLimit = {
      remaining: 40,
      reset: Date.now() + 60000
    };
  }

  async initialize() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      for (const storeConfig of config.stores) {
        this.stores[storeConfig.name] = {
          ...storeConfig,
          client: axios.create({
            baseURL: `https://${storeConfig.shop_url}/admin/api/${config.api_version}`,
            headers: {
              'X-Shopify-Access-Token': storeConfig.access_token,
              'Content-Type': 'application/json'
            },
            timeout: config.sync_settings?.timeout || 30000
          })
        };
      }
      
      this.syncSettings = config.sync_settings;
      this.rateLimits = config.rate_limits;
      
      console.log(`ShopifyAPI initialized with ${Object.keys(this.stores).length} stores`);
      return true;
    } catch (error) {
      console.error('Failed to initialize ShopifyAPI:', error.message);
      return false;
    }
  }

  async checkRateLimit() {
    const now = Date.now();
    if (now >= this.rateLimit.reset) {
      this.rateLimit.remaining = this.rateLimits?.requests_per_minute || 40;
      this.rateLimit.reset = now + 60000;
    }
    
    if (this.rateLimit.remaining <= 0) {
      const waitTime = this.rateLimit.reset - now;
      console.log(`Rate limit exceeded. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimit.remaining = this.rateLimits?.requests_per_minute || 40;
      this.rateLimit.reset = Date.now() + 60000;
    }
    
    this.rateLimit.remaining--;
    return true;
  }

  async getProducts(storeName, params = {}) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    const cacheKey = `products:${storeName}:${JSON.stringify(params)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await store.client.get('/products.json', { params });
      const products = response.data.products;
      
      // Cache for 5 minutes
      this.cache.set(cacheKey, products);
      setTimeout(() => this.cache.delete(cacheKey), 300000);
      
      return products;
    } catch (error) {
      console.error(`Error fetching products from ${storeName}:`, error.message);
      throw error;
    }
  }

  async getInventoryLevels(storeName, locationIds = []) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    try {
      const params = locationIds.length > 0 ? { location_ids: locationIds.join(',') } : {};
      const response = await store.client.get('/inventory_levels.json', { params });
      return response.data.inventory_levels;
    } catch (error) {
      console.error(`Error fetching inventory levels from ${storeName}:`, error.message);
      throw error;
    }
  }

  async updateInventoryLevel(storeName, inventoryItemId, locationId, availableAdjustment) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    try {
      const payload = {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available_adjustment: availableAdjustment
      };

      const response = await store.client.post('/inventory_levels/adjust.json', payload);
      return response.data.inventory_level;
    } catch (error) {
      console.error(`Error updating inventory level in ${storeName}:`, error.message);
      throw error;
    }
  }

  async getOrders(storeName, params = {}) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    const cacheKey = `orders:${storeName}:${JSON.stringify(params)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await store.client.get('/orders.json', { params });
      const orders = response.data.orders;
      
      // Cache for 2 minutes
      this.cache.set(cacheKey, orders);
      setTimeout(() => this.cache.delete(cacheKey), 120000);
      
      return orders;
    } catch (error) {
      console.error(`Error fetching orders from ${storeName}:`, error.message);
      throw error;
    }
  }

  async fulfillOrder(storeName, orderId, fulfillmentData) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    try {
      const response = await store.client.post(`/orders/${orderId}/fulfillments.json`, {
        fulfillment: fulfillmentData
      });
      return response.data.fulfillment;
    } catch (error) {
      console.error(`Error fulfilling order ${orderId} in ${storeName}:`, error.message);
      throw error;
    }
  }

  async createWebhook(storeName, webhookData) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    try {
      const response = await store.client.post('/webhooks.json', {
        webhook: webhookData
      });
      return response.data.webhook;
    } catch (error) {
      console.error(`Error creating webhook in ${storeName}:`, error.message);
      throw error;
    }
  }

  async batchUpdateProducts(storeName, updates) {
    await this.checkRateLimit();
    
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    try {
      // Implement batch updates using GraphQL for efficiency
      const graphqlQuery = {
        query: `
          mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
              product {
                id
                title
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: updates
        }
      };

      const response = await store.client.post('/graphql.json', graphqlQuery);
      return response.data.data.productUpdate;
    } catch (error) {
      console.error(`Error batch updating products in ${storeName}:`, error.message);
      throw error;
    }
  }

  async syncAllInventory(storeName) {
    console.log(`Starting inventory sync for ${storeName}`);
    
    try {
      const products = await this.getProducts(storeName, { limit: 250 });
      const inventoryLevels = await this.getInventoryLevels(storeName);
      
      const inventoryMap = {};
      inventoryLevels.forEach(level => {
        inventoryMap[level.inventory_item_id] = level;
      });
      
      const syncResults = {
        totalProducts: products.length,
        updated: 0,
        errors: 0,
        details: []
      };
      
      for (const product of products) {
        try {
          const variants = product.variants || [];
          for (const variant of variants) {
            const inventoryItemId = variant.inventory_item_id;
            const currentLevel = inventoryMap[inventoryItemId];
            
            if (currentLevel) {
              // Compare and update if needed
              const syncDetail = {
                productId: product.id,
                variantId: variant.id,
                sku: variant.sku,
                current: currentLevel.available,
                updated: null
              };
              
              syncResults.details.push(syncDetail);
            }
          }
        } catch (error) {
          syncResults.errors++;
          console.error(`Error syncing product ${product.id}:`, error.message);
        }
      }
      
      console.log(`Inventory sync completed for ${storeName}:`, syncResults);
      return syncResults;
    } catch (error) {
      console.error(`Failed to sync inventory for ${storeName}:`, error.message);
      throw error;
    }
  }

  validateWebhook(storeName, hmacHeader, data) {
    const store = this.stores[storeName];
    if (!store) {
      throw new Error(`Store ${storeName} not found`);
    }

    const calculatedHmac = crypto
      .createHmac('sha256', store.api_secret)
      .update(data)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac),
      Buffer.from(hmacHeader)
    );
  }

  clearCache() {
    this.cache.clear();
    console.log('ShopifyAPI cache cleared');
  }

  getStoreStats(storeName) {
    const store = this.stores[storeName];
    if (!store) {
      return null;
    }

    return {
      name: store.name,
      plan: store.plan,
      apiCalls: 40 - this.rateLimit.remaining,
      cacheSize: this.cache.size,
      nextReset: new Date(this.rateLimit.reset).toISOString()
    };
  }
}

// Export for use in OpenClaw
module.exports = ShopifyAPI;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const api = new ShopifyAPI();
    const initialized = await api.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize ShopifyAPI');
      process.exit(1);
    }
    
    const command = process.argv[2];
    const storeName = process.argv[3] || 'main-store';
    
    switch (command) {
      case 'sync-inventory':
        await api.syncAllInventory(storeName);
        break;
      case 'get-products':
        const products = await api.getProducts(storeName, { limit: 10 });
        console.log(JSON.stringify(products, null, 2));
        break;
      case 'get-orders':
        const orders = await api.getOrders(storeName, { limit: 10 });
        console.log(JSON.stringify(orders, null, 2));
        break;
      case 'stats':
        const stats = api.getStoreStats(storeName);
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'clear-cache':
        api.clearCache();
        console.log('Cache cleared');
        break;
      default:
        console.log('Available commands:');
        console.log('  sync-inventory [store] - Sync all inventory');
        console.log('  get-products [store] - Get products');
        console.log('  get-orders [store] - Get orders');
        console.log('  stats [store] - Get store stats');
        console.log('  clear-cache - Clear API cache');
    }
  })().catch(console.error);
}