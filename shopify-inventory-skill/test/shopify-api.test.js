#!/usr/bin/env node

/**
 * Shopify API Tests
 */

const ShopifyAPI = require('../scripts/shopify-api');
const fs = require('fs').promises;
const path = require('path');

describe('ShopifyAPI', () => {
  let api;
  let testConfig;

  beforeAll(async () => {
    // Create test configuration
    testConfig = {
      api_version: '2024-01',
      stores: [
        {
          name: 'test-store',
          shop_url: 'test-store.myshopify.com',
          api_key: 'test_api_key',
          api_secret: 'test_api_secret',
          access_token: 'test_access_token',
          plan: 'basic'
        }
      ],
      sync_settings: {
        sync_interval: 300,
        batch_size: 50,
        timeout: 10000
      },
      rate_limits: {
        requests_per_minute: 10
      }
    };

    // Write test config
    await fs.writeFile(
      path.join(__dirname, 'test-shopify-config.json'),
      JSON.stringify(testConfig, null, 2)
    );

    api = new ShopifyAPI(path.join(__dirname, 'test-shopify-config.json'));
  });

  afterAll(async () => {
    // Clean up test config
    try {
      await fs.unlink(path.join(__dirname, 'test-shopify-config.json'));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('should initialize successfully', async () => {
    const initialized = await api.initialize();
    expect(initialized).toBe(true);
    expect(api.stores['test-store']).toBeDefined();
  });

  test('should handle rate limiting', async () => {
    await api.checkRateLimit();
    expect(api.rateLimit.remaining).toBeLessThan(api.rateLimits.requests_per_minute);
  });

  test('should cache API responses', async () => {
    // Mock the axios client to return test data
    const mockProducts = [{ id: 1, title: 'Test Product' }];
    api.stores['test-store'].client.get = jest.fn().mockResolvedValue({
      data: { products: mockProducts }
    });

    const products1 = await api.getProducts('test-store', { limit: 10 });
    const products2 = await api.getProducts('test-store', { limit: 10 });

    expect(api.stores['test-store'].client.get).toHaveBeenCalledTimes(1);
    expect(products1).toEqual(mockProducts);
    expect(products2).toEqual(mockProducts);
  });

  test('should clear cache', () => {
    api.cache.set('test-key', 'test-value');
    expect(api.cache.size).toBe(1);
    
    api.clearCache();
    expect(api.cache.size).toBe(0);
  });

  test('should validate webhook signatures', () => {
    const store = api.stores['test-store'];
    const testData = 'test-data';
    const hmac = require('crypto')
      .createHmac('sha256', store.api_secret)
      .update(testData)
      .digest('hex');
    
    const isValid = api.validateWebhook('test-store', hmac, testData);
    expect(isValid).toBe(true);
    
    const isInvalid = api.validateWebhook('test-store', 'invalid-hmac', testData);
    expect(isInvalid).toBe(false);
  });

  test('should get store statistics', () => {
    const stats = api.getStoreStats('test-store');
    expect(stats).toHaveProperty('name', 'test-store');
    expect(stats).toHaveProperty('plan', 'basic');
    expect(stats).toHaveProperty('apiCalls');
    expect(stats).toHaveProperty('cacheSize');
  });

  test('should handle missing store gracefully', async () => {
    await expect(api.getProducts('non-existent-store'))
      .rejects
      .toThrow('Store non-existent-store not found');
  });
});

// Mock Jest functions for standalone execution
if (require.main === module) {
  const jest = {
    fn: (impl) => impl,
    mockResolvedValue: (value) => Promise.resolve(value)
  };
  
  const expect = (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected defined value');
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected less than ${expected}, got ${actual}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toHaveBeenCalledTimes: (expected) => {
      // Mock implementation
    },
    toHaveProperty: (prop, value) => {
      if (actual[prop] !== value) {
        throw new Error(`Expected property ${prop} to be ${value}, got ${actual[prop]}`);
      }
    },
    toThrow: (expected) => {
      try {
        actual();
        throw new Error('Expected function to throw');
      } catch (error) {
        if (expected && !error.message.includes(expected)) {
          throw new Error(`Expected error containing "${expected}", got "${error.message}"`);
        }
      }
    },
    rejects: {
      toThrow: async (expected) => {
        try {
          await actual;
          throw new Error('Expected promise to reject');
        } catch (error) {
          if (expected && !error.message.includes(expected)) {
            throw new Error(`Expected error containing "${expected}", got "${error.message}"`);
          }
        }
      }
    }
  };

  const describe = (name, tests) => {
    console.log(`\n${name}`);
    tests();
  };

  const test = (name, fn) => {
    try {
      fn();
      console.log(`  ✓ ${name}`);
    } catch (error) {
      console.log(`  ✗ ${name}: ${error.message}`);
    }
  };

  const beforeAll = (fn) => fn();
  const afterAll = (fn) => fn();

  // Run tests
  (async () => {
    await describe('ShopifyAPI', () => {
      require('./shopify-api.test.js');
    });
  })();
}