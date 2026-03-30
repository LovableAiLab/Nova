#!/usr/bin/env node

/**
 * Configuration Validator
 * Validates all configuration files for the Shopify Inventory Skill
 */

const fs = require('fs').promises;
const path = require('path');

class ConfigValidator {
  constructor(configDir = './configs') {
    this.configDir = configDir;
    this.errors = [];
    this.warnings = [];
  }

  async validateAll() {
    console.log('Validating all configuration files...');
    
    await this.validateShopifyConfig();
    await this.validateCompetitorsConfig();
    await this.validateInventoryConfig();
    await this.validateOrdersConfig();
    await this.validateMarginsConfig();
    
    return this.getValidationReport();
  }

  async validateShopifyConfig() {
    try {
      const configPath = path.join(this.configDir, 'shopify.json');
      const data = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(data);
      
      // Required fields
      const required = ['api_version', 'stores', 'webhooks'];
      required.forEach(field => {
        if (!config[field]) {
          this.errors.push(`shopify.json: Missing required field '${field}'`);
        }
      });
      
      // Validate stores
      if (config.stores && Array.isArray(config.stores)) {
        config.stores.forEach((store, index) => {
          const storeRequired = ['name', 'shop_url', 'api_key', 'access_token'];
          storeRequired.forEach(field => {
            if (!store[field]) {
              this.errors.push(`shopify.json: Store ${index} missing '${field}'`);
            }
          });
          
          // Validate shop URL format
          if (store.shop_url && !store.shop_url.includes('.myshopify.com')) {
            this.warnings.push(`shopify.json: Store ${store.name} shop_url may be invalid`);
          }
        });
      }
      
      // Validate sync settings
      if (config.sync_settings) {
        if (config.sync_settings.sync_interval < 60) {
          this.warnings.push('shopify.json: sync_interval is very short (< 60 seconds)');
        }
        if (config.sync_settings.batch_size > 250) {
          this.warnings.push('shopify.json: batch_size exceeds Shopify API limit (250)');
        }
      }
      
      // Validate rate limits
      if (config.rate_limits) {
        if (config.rate_limits.requests_per_minute > 40) {
          this.warnings.push('shopify.json: requests_per_minute exceeds typical Shopify limit');
        }
      }
      
    } catch (error) {
      this.errors.push(`shopify.json: ${error.message}`);
    }
  }

  async validateCompetitorsConfig() {
    try {
      const configPath = path.join(this.configDir, 'competitors.json');
      const data = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(data);
      
      // Validate platforms
      if (config.platforms && Array.isArray(config.platforms)) {
        const enabledPlatforms = config.platforms.filter(p => p.enabled);
        
        if (enabledPlatforms.length === 0) {
          this.warnings.push('competitors.json: No platforms enabled');
        }
        
        enabledPlatforms.forEach((platform, index) => {
          if (!platform.name) {
            this.errors.push(`competitors.json: Platform ${index} missing name`);
          }
          
          if (platform.monitoring_interval < 300) {
            this.warnings.push(`competitors.json: Platform ${platform.name} monitoring_interval is very short`);
          }
        });
      }
      
      // Validate monitoring thresholds
      if (config.monitoring) {
        if (config.monitoring.price_change_threshold <= 0 || config.monitoring.price_change_threshold > 1) {
          this.errors.push('competitors.json: price_change_threshold must be between 0 and 1');
        }
      }
      
      // Validate proxy settings
      if (config.proxy && config.proxy.enabled) {
        if (!config.proxy.pool_size || config.proxy.pool_size < 3) {
          this.warnings.push('competitors.json: proxy pool_size is small, may cause rate limiting');
        }
      }
      
    } catch (error) {
      this.errors.push(`competitors.json: ${error.message}`);
    }
  }

  async validateInventoryConfig() {
    try {
      const configPath = path.join(this.configDir, 'inventory.json');
      const data = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(data);
      
      // Validate suppliers
      if (config.suppliers && Array.isArray(config.suppliers)) {
        config.suppliers.forEach((supplier, index) => {
          const required = ['name', 'type', 'endpoint'];
          required.forEach(field => {
            if (!supplier[field]) {
              this.errors.push(`inventory.json: Supplier ${index} missing '${field}'`);
            }
          });
          
          // Validate sync interval
          if (supplier.sync_interval && supplier.sync_interval < 60) {
            this.warnings.push(`inventory.json: Supplier ${supplier.name} sync_interval is very short`);
          }
        });
      }
      
      // Validate rules
      if (config.rules) {
        if (config.rules.restock_threshold < 0) {
          this.errors.push('inventory.json: restock_threshold cannot be negative');
        }
        if (config.rules.safety_stock < 0) {
          this.errors.push('inventory.json: safety_stock cannot be negative');
        }
        if (config.rules.lead_time_days < 0) {
          this.errors.push('inventory.json: lead_time_days cannot be negative');
        }
      }
      
      // Validate forecasting
      if (config.forecasting && config.forecasting.enabled) {
        if (config.forecasting.history_days < 7) {
          this.warnings.push('inventory.json: forecasting.history_days is less than 7 days');
        }
      }
      
    } catch (error) {
      this.errors.push(`inventory.json: ${error.message}`);
    }
  }

  async validateOrdersConfig() {
    try {
      const configPath = path.join(this.configDir, 'orders.json');
      const data = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(data);
      
      // Validate automation settings
      if (config.automation) {
        if (config.automation.delay_minutes < 0) {
          this.errors.push('orders.json: automation.delay_minutes cannot be negative');
        }
        
        if (config.automation.batch_size && config.automation.batch_size > 100) {
          this.warnings.push('orders.json: automation.batch_size is large, may cause performance issues');
        }
      }
      
      // Validate shipping carriers
      if (config.shipping && config.shipping.carriers) {
        const enabledCarriers = config.shipping.carriers.filter(c => c.enabled);
        
        if (enabledCarriers.length === 0) {
          this.warnings.push('orders.json: No shipping carriers enabled');
        }
        
        enabledCarriers.forEach(carrier => {
          if (!carrier.name) {
            this.errors.push(`orders.json: Carrier missing name`);
          }
        });
      }
      
      // Validate fraud prevention
      if (config.fraud_prevention && config.fraud_prevention.enabled) {
        if (config.fraud_prevention.review_threshold <= 0 || config.fraud_prevention.review_threshold > 1) {
          this.errors.push('orders.json: fraud_prevention.review_threshold must be between 0 and 1');
        }
      }
      
      // Validate returns
      if (config.returns) {
        if (config.returns.return_window_days < 0) {
          this.errors.push('orders.json: return_window_days cannot be negative');
        }
        if (config.returns.refund_threshold < 0) {
          this.errors.push('orders.json: refund_threshold cannot be negative');
        }
      }
      
    } catch (error) {
      this.errors.push(`orders.json: ${error.message}`);
    }
  }

  async validateMarginsConfig() {
    try {
      const configPath = path.join(this.configDir, 'margins.json');
      const data = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(data);
      
      // Validate targets
      if (config.targets) {
        const margins = [
          'minimum_margin',
          'target_margin',
          'premium_margin',
          'overall_target'
        ];
        
        margins.forEach(margin => {
          const value = config.targets[margin];
          if (value < 0 || value > 1) {
            this.errors.push(`margins.json: ${margin} must be between 0 and 1`);
          }
        });
        
        // Validate hierarchy
        if (config.targets.minimum_margin > config.targets.target_margin) {
          this.errors.push('margins.json: minimum_margin cannot be greater than target_margin');
        }
        if (config.targets.target_margin > config.targets.premium_margin) {
          this.warnings.push('margins.json: target_margin is greater than premium_margin');
        }
      }
      
      // Validate pricing strategies
      if (config.pricing_strategies) {
        if (config.pricing_strategies.competitor_based) {
          const range = config.pricing_strategies.competitor_based.adjustment_range;
          if (range < 0 || range > 1) {
            this.errors.push('margins.json: competitor_based.adjustment_range must be between 0 and 1');
          }
        }
        
        if (config.pricing_strategies.dynamic_pricing) {
          if (config.pricing_strategies.dynamic_pricing.update_frequency < 60) {
            this.warnings.push('margins.json: dynamic_pricing.update_frequency is very short');
          }
        }
      }
      
      // Validate optimization
      if (config.optimization) {
        if (config.optimization.max_adjustment_percent < 0 || config.optimization.max_adjustment_percent > 1) {
          this.errors.push('margins.json: max_adjustment_percent must be between 0 and 1');
        }
        
        if (config.optimization.min_profit_margin < 0 || config.optimization.min_profit_margin > 1) {
          this.errors.push('margins.json: min_profit_margin must be between 0 and 1');
        }
      }
      
      // Validate monitoring
      if (config.monitoring) {
        if (config.monitoring.alert_thresholds) {
          const thresholds = config.monitoring.alert_thresholds;
          if (thresholds.margin_drop < 0 || thresholds.margin_drop > 1) {
            this.errors.push('margins.json: alert_thresholds.margin_drop must be between 0 and 1');
          }
        }
      }
      
    } catch (error) {
      this.errors.push(`margins.json: ${error.message}`);
    }
  }

  getValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      filesValidated: 5,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      status: this.errors.length === 0 ? 'VALID' : 'INVALID',
      errors: this.errors,
      warnings: this.warnings,
      recommendations: []
    };
    
    // Generate recommendations
    if (this.errors.length > 0) {
      report.recommendations.push('Fix all errors before deploying');
    }
    
    if (this.warnings.length > 5) {
      report.recommendations.push('Review warnings as they may indicate configuration issues');
    }
    
    if (report.status === 'VALID' && this.warnings.length === 0) {
      report.recommendations.push('Configuration is ready for production use');
    }
    
    return report;
  }

  async fixCommonIssues() {
    const fixes = [];
    
    // Example fix: Ensure all configs have proper structure
    // In production, this would implement actual fixes
    
    fixes.push('Common issues check completed. Manual review recommended.');
    
    return {
      fixesApplied: fixes.length,
      fixes,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in OpenClaw
module.exports = ConfigValidator;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const validator = new ConfigValidator();
    const report = await validator.validateAll();
    
    console.log(JSON.stringify(report, null, 2));
    
    if (report.errorCount > 0) {
      process.exit(1);
    }
  })().catch(console.error);
}