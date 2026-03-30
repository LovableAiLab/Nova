#!/usr/bin/env node

/**
 * x402 Payment License Check
 * Validates license payments via x402 protocol
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LicenseCheck {
  constructor(config = {}) {
    this.config = {
      x402Endpoint: 'https://api.x402.org/v1',
      licenseFee: 50, // USDC
      walletAddress: process.env.X402_WALLET_ADDRESS,
      apiKey: process.env.X402_API_KEY,
      ...config
    };
    
    this.licenseCache = new Map();
    this.paymentHistory = [];
  }

  async initialize() {
    try {
      // Check for required environment variables
      if (!this.config.walletAddress) {
        throw new Error('X402_WALLET_ADDRESS environment variable not set');
      }
      
      console.log('LicenseCheck initialized');
      console.log(`Wallet: ${this.config.walletAddress}`);
      console.log(`License Fee: ${this.config.licenseFee} USDC`);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize LicenseCheck:', error.message);
      return false;
    }
  }

  async validateLicense(licenseKey, userId = null) {
    const cacheKey = licenseKey;
    
    // Check cache first
    if (this.licenseCache.has(cacheKey)) {
      const cached = this.licenseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
        return cached;
      }
    }
    
    try {
      // In production, this would call x402 API
      // For now, simulate validation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mock validation logic
      const isValid = this.mockValidateLicense(licenseKey);
      const licenseData = this.mockGetLicenseData(licenseKey);
      
      const result = {
        valid: isValid,
        licenseKey,
        userId,
        data: licenseData,
        timestamp: new Date().toISOString(),
        checkedAt: new Date().toISOString()
      };
      
      // Cache result
      this.licenseCache.set(cacheKey, {
        ...result,
        timestamp: Date.now()
      });
      
      // Store in history
      this.paymentHistory.push({
        licenseKey,
        userId,
        valid: isValid,
        timestamp: new Date().toISOString()
      });
      
      // Keep history manageable
      if (this.paymentHistory.length > 1000) {
        this.paymentHistory = this.paymentHistory.slice(-1000);
      }
      
      return result;
      
    } catch (error) {
      console.error(`Error validating license ${licenseKey}:`, error.message);
      
      return {
        valid: false,
        licenseKey,
        userId,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  mockValidateLicense(licenseKey) {
    // Mock validation rules
    if (!licenseKey || licenseKey.length !== 32) {
      return false;
    }
    
    // Check format: LIC-XXXX-XXXX-XXXX-XXXX
    const pattern = /^LIC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!pattern.test(licenseKey)) {
      return false;
    }
    
    // Check checksum (last 4 chars)
    const parts = licenseKey.split('-');
    const checksum = parts[4];
    const data = parts.slice(1, 4).join('');
    
    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substr(0, 4)
      .toUpperCase();
    
    return checksum === calculatedChecksum;
  }

  mockGetLicenseData(licenseKey) {
    // Mock license data
    const issueDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const plans = ['basic', 'pro', 'enterprise'];
    const stores = Math.floor(Math.random() * 5) + 1;
    
    return {
      issueDate: issueDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      plan: plans[Math.floor(Math.random() * plans.length)],
      storesAllowed: stores,
      storesUsed: Math.floor(Math.random() * stores),
      paymentAmount: this.config.licenseFee,
      currency: 'USDC',
      status: 'active',
      features: [
        'inventory_sync',
        'competitor_monitoring',
        'order_automation',
        'margin_optimization'
      ]
    };
  }

  async checkPayment(walletAddress, amount = this.config.licenseFee) {
    try {
      // In production, query blockchain or x402 API
      // For now, simulate payment check
      
      const paymentExists = await this.mockCheckPayment(walletAddress, amount);
      
      return {
        walletAddress,
        amount,
        currency: 'USDC',
        paid: paymentExists,
        lastPaymentDate: paymentExists ? new Date().toISOString() : null,
        nextPaymentDue: paymentExists ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error checking payment for ${walletAddress}:`, error.message);
      
      return {
        walletAddress,
        amount,
        paid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async mockCheckPayment(walletAddress, amount) {
    // Simulate blockchain query
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock: 80% chance of having paid
    return Math.random() > 0.2;
  }

  async generateLicense(userId, plan = 'pro', stores = 1) {
    try {
      // Check if user has paid
      const paymentCheck = await this.checkPayment(this.config.walletAddress);
      
      if (!paymentCheck.paid) {
        return {
          success: false,
          error: 'Payment not found',
          paymentRequired: true,
          amount: this.config.licenseFee,
          currency: 'USDC',
          walletAddress: this.config.walletAddress
        };
      }
      
      // Generate license key
      const licenseKey = this.generateLicenseKey(userId, plan, stores);
      
      // Store license (in production, save to database)
      const licenseData = {
        licenseKey,
        userId,
        plan,
        stores,
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        paymentAmount: this.config.licenseFee,
        paymentCurrency: 'USDC',
        paymentDate: paymentCheck.lastPaymentDate,
        features: this.getPlanFeatures(plan)
      };
      
      // Cache license
      this.licenseCache.set(licenseKey, {
        valid: true,
        licenseKey,
        userId,
        data: licenseData,
        timestamp: Date.now()
      });
      
      return {
        success: true,
        licenseKey,
        licenseData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error generating license for ${userId}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateLicenseKey(userId, plan, stores) {
    // Generate unique license key
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    const data = `${userId}:${plan}:${stores}:${timestamp}:${random}`;
    
    // Create checksum
    const checksum = crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substr(0, 4)
      .toUpperCase();
    
    // Format: LIC-XXXX-XXXX-XXXX-XXXX
    const parts = [
      'LIC',
      random.substr(0, 4),
      random.substr(4, 4),
      timestamp.substr(-4).toUpperCase(),
      checksum
    ];
    
    return parts.join('-');
  }

  getPlanFeatures(plan) {
    const features = {
      basic: [
        'inventory_sync',
        'basic_reports',
        'email_support',
        '1_store'
      ],
      pro: [
        'inventory_sync',
        'competitor_monitoring',
        'order_automation',
        'margin_optimization',
        'advanced_reports',
        'priority_support',
        '3_stores'
      ],
      enterprise: [
        'inventory_sync',
        'competitor_monitoring',
        'order_automation',
        'margin_optimization',
        'multi_store_management',
        'custom_integrations',
        'api_access',
        'dedicated_support',
        'unlimited_stores'
      ]
    };
    
    return features[plan] || features.basic;
  }

  async revokeLicense(licenseKey, reason = 'violation') {
    try {
      // Remove from cache
      this.licenseCache.delete(licenseKey);
      
      // In production, update database
      
      return {
        success: true,
        licenseKey,
        revoked: true,
        reason,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error revoking license ${licenseKey}:`, error.message);
      
      return {
        success: false,
        licenseKey,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getLicenseStats() {
    const validLicenses = Array.from(this.licenseCache.values())
      .filter(license => license.valid);
    
    const plans = {};
    validLicenses.forEach(license => {
      const plan = license.data?.plan || 'unknown';
      plans[plan] = (plans[plan] || 0) + 1;
    });
    
    const today = new Date().toISOString().split('T')[0];
    const todayChecks = this.paymentHistory.filter(
      p => p.timestamp.split('T')[0] === today
    );
    
    return {
      totalLicenses: validLicenses.length,
      plans,
      todayChecks: todayChecks.length,
      todayValid: todayChecks.filter(c => c.valid).length,
      cacheSize: this.licenseCache.size,
      historySize: this.paymentHistory.length,
      licenseFee: this.config.licenseFee,
      estimatedRevenue: validLicenses.length * this.config.licenseFee,
      timestamp: new Date().toISOString()
    };
  }

  clearCache() {
    this.licenseCache.clear();
    console.log('License cache cleared');
  }

  getPaymentInstructions() {
    return {
      amount: this.config.licenseFee,
      currency: 'USDC',
      walletAddress: this.config.walletAddress,
      network: 'Polygon', // Example network
      memo: 'Shopify Inventory Skill License',
      steps: [
        'Send 50 USDC to the wallet address above',
        'Include your user ID in the transaction memo',
        'Wait for blockchain confirmation (2-3 minutes)',
        'Your license will be automatically activated'
      ],
      support: 'Contact support@example.com for help',
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in OpenClaw
module.exports = LicenseCheck;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const licenseCheck = new LicenseCheck();
    const initialized = await licenseCheck.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize LicenseCheck');
      process.exit(1);
    }
    
    const command = process.argv[2];
    const arg1 = process.argv[3];
    
    switch (command) {
      case 'validate':
        if (!arg1) {
          console.error('Please provide license key');
          process.exit(1);
        }
        const result = await licenseCheck.validateLicense(arg1);
        console.log(JSON.stringify(result, null, 2));
        break;
      case 'generate':
        if (!arg1) {
          console.error('Please provide user ID');
          process.exit(1);
        }
        const license = await licenseCheck.generateLicense(arg1);
        console.log(JSON.stringify(license, null, 2));
        break;
      case 'stats':
        const stats = await licenseCheck.getLicenseStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'instructions':
        const instructions = licenseCheck.getPaymentInstructions();
        console.log(JSON.stringify(instructions, null, 2));
        break;
      case 'clear-cache':
        licenseCheck.clearCache();
        console.log('Cache cleared');
        break;
      default:
        console.log('Available commands:');
        console.log('  validate [licenseKey] - Validate license key');
        console.log('  generate [userId] - Generate new license');
        console.log('  stats - Get license statistics');
        console.log('  instructions - Get payment instructions');
        console.log('  clear-cache - Clear license cache');
    }
  })().catch(console.error);
}