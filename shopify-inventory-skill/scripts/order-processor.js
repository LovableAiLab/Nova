#!/usr/bin/env node

/**
 * Order Processing Automation
 * Automates order fulfillment, shipping, and notifications
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class OrderProcessor {
  constructor(configPath = './configs/orders.json') {
    this.configPath = configPath;
    this.carriers = {};
    this.orderQueue = [];
    this.processingHistory = [];
  }

  async initialize() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      this.automation = config.automation;
      this.shipping = config.shipping;
      this.notifications = config.notifications;
      this.returns = config.returns;
      this.fraudPrevention = config.fraud_prevention;
      this.workflow = config.workflow;
      
      // Initialize carriers
      this.shipping.carriers.forEach(carrier => {
        if (carrier.enabled) {
          this.carriers[carrier.name] = carrier;
        }
      });
      
      console.log(`OrderProcessor initialized with ${Object.keys(this.carriers).length} carriers`);
      return true;
    } catch (error) {
      console.error('Failed to initialize OrderProcessor:', error.message);
      return false;
    }
  }

  async processOrder(order, shopifyAPI) {
    console.log(`Processing order ${order.id} from ${order.email}`);
    
    const processingResult = {
      orderId: order.id,
      customerEmail: order.email,
      timestamp: new Date().toISOString(),
      steps: [],
      success: true,
      errors: []
    };

    try {
      // Step 1: Fraud check
      if (this.fraudPrevention.enabled) {
        const fraudResult = await this.checkFraud(order);
        processingResult.steps.push({
          step: 'fraud_check',
          result: fraudResult,
          timestamp: new Date().toISOString()
        });
        
        if (fraudResult.riskScore >= this.fraudPrevention.review_threshold) {
          processingResult.steps.push({
            step: 'order_hold',
            reason: 'High fraud risk',
            action: 'manual_review',
            timestamp: new Date().toISOString()
          });
          
          processingResult.success = false;
          processingResult.holdReason = 'fraud_check';
          return processingResult;
        }
      }

      // Step 2: Inventory check
      const inventoryResult = await this.checkInventory(order.line_items, shopifyAPI);
      processingResult.steps.push({
        step: 'inventory_check',
        result: inventoryResult,
        timestamp: new Date().toISOString()
      });
      
      if (!inventoryResult.allAvailable) {
        processingResult.steps.push({
          step: 'backorder_handling',
          action: 'notify_customer',
          items: inventoryResult.unavailableItems,
          timestamp: new Date().toISOString()
        });
        
        // Send backorder notification
        if (this.notifications.backorder_notification.enabled) {
          await this.sendNotification(order, 'backorder', {
            unavailableItems: inventoryResult.unavailableItems
          });
        }
      }

      // Step 3: Fulfillment
      if (this.automation.auto_fulfill && inventoryResult.allAvailable) {
        const fulfillmentResult = await this.fulfillOrder(order, shopifyAPI);
        processingResult.steps.push({
          step: 'fulfillment',
          result: fulfillmentResult,
          timestamp: new Date().toISOString()
        });
        
        if (fulfillmentResult.success) {
          processingResult.fulfillmentId = fulfillmentResult.fulfillmentId;
          
          // Step 4: Shipping
          if (this.automation.auto_ship) {
            const shippingResult = await this.processShipping(order, fulfillmentResult);
            processingResult.steps.push({
              step: 'shipping',
              result: shippingResult,
              timestamp: new Date().toISOString()
            });
            
            if (shippingResult.success) {
              processingResult.trackingNumber = shippingResult.trackingNumber;
              processingResult.carrier = shippingResult.carrier;
              
              // Step 5: Notifications
              if (this.automation.auto_notify) {
                await this.sendOrderNotifications(order, processingResult);
              }
            } else {
              processingResult.errors.push('Shipping failed');
              processingResult.success = false;
            }
          }
        } else {
          processingResult.errors.push('Fulfillment failed');
          processingResult.success = false;
        }
      }

      // Step 6: Archive if configured
      if (this.automation.auto_archive && processingResult.success) {
        processingResult.steps.push({
          step: 'archive',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error(`Error processing order ${order.id}:`, error.message);
      processingResult.errors.push(error.message);
      processingResult.success = false;
    }

    // Store in history
    this.processingHistory.push(processingResult);
    if (this.processingHistory.length > 1000) {
      this.processingHistory = this.processingHistory.slice(-1000);
    }

    return processingResult;
  }

  async checkFraud(order) {
    // Implement fraud detection logic
    const riskFactors = [];
    let riskScore = 0;

    // 1. AVS check
    if (order.billing_address && order.shipping_address) {
      const avsMatch = this.checkAVSMatch(order.billing_address, order.shipping_address);
      if (!avsMatch) {
        riskFactors.push('avs_mismatch');
        riskScore += 0.3;
      }
    }

    // 2. IP location check
    if (order.client_details && order.client_details.browser_ip) {
      const ipRisk = await this.checkIPRisk(order.client_details.browser_ip);
      riskScore += ipRisk;
      if (ipRisk > 0.2) {
        riskFactors.push('high_risk_ip');
      }
    }

    // 3. Order velocity check
    const velocityRisk = this.checkOrderVelocity(order.email);
    riskScore += velocityRisk;
    if (velocityRisk > 0.1) {
      riskFactors.push('high_velocity');
    }

    // 4. Amount check
    if (order.total_price > 1000) {
      riskScore += 0.2;
      riskFactors.push('high_value');
    }

    // 5. Email domain check
    const emailRisk = this.checkEmailDomain(order.email);
    riskScore += emailRisk;
    if (emailRisk > 0.1) {
      riskFactors.push('risky_email_domain');
    }

    return {
      riskScore: Math.min(riskScore, 1.0),
      riskFactors,
      recommendation: riskScore >= this.fraudPrevention.review_threshold ? 'review' : 'approve'
    };
  }

  checkAVSMatch(billing, shipping) {
    // Simplified AVS check
    return (
      billing.zip === shipping.zip &&
      billing.country_code === shipping.country_code
    );
  }

  async checkIPRisk(ip) {
    // In production, use IP intelligence service
    // For now, return mock risk score
    return Math.random() * 0.3;
  }

  checkOrderVelocity(email) {
    // Check order frequency for this email
    const recentOrders = this.processingHistory.filter(
      p => p.customerEmail === email &&
      new Date(p.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (recentOrders.length > 3) {
      return 0.3;
    } else if (recentOrders.length > 1) {
      return 0.1;
    }
    
    return 0;
  }

  checkEmailDomain(email) {
    const riskyDomains = ['tempmail.com', 'mailinator.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    
    if (riskyDomains.includes(domain)) {
      return 0.3;
    }
    
    return 0;
  }

  async checkInventory(lineItems, shopifyAPI) {
    const result = {
      allAvailable: true,
      availableItems: [],
      unavailableItems: [],
      details: []
    };

    for (const item of lineItems) {
      try {
        // In production, check actual inventory levels
        // For now, simulate with 95% availability
        const isAvailable = Math.random() > 0.05;
        
        if (isAvailable) {
          result.availableItems.push({
            id: item.id,
            sku: item.sku,
            quantity: item.quantity
          });
        } else {
          result.unavailableItems.push({
            id: item.id,
            sku: item.sku,
            quantity: item.quantity
          });
          result.allAvailable = false;
        }
        
        result.details.push({
          sku: item.sku,
          available: isAvailable,
          requested: item.quantity
        });
        
      } catch (error) {
        console.error(`Error checking inventory for item ${item.id}:`, error.message);
        result.unavailableItems.push({
          id: item.id,
          sku: item.sku,
          quantity: item.quantity,
          error: error.message
        });
        result.allAvailable = false;
      }
    }

    return result;
  }

  async fulfillOrder(order, shopifyAPI) {
    try {
      // Prepare fulfillment data
      const fulfillmentData = {
        location_id: order.location_id || 1,
        notify_customer: this.notifications.shipping_confirmation.enabled,
        tracking_info: {},
        line_items: order.line_items.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      // Call Shopify API to create fulfillment
      const fulfillment = await shopifyAPI.fulfillOrder('main-store', order.id, fulfillmentData);
      
      return {
        success: true,
        fulfillmentId: fulfillment.id,
        status: fulfillment.status,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error fulfilling order ${order.id}:`, error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async processShipping(order, fulfillmentResult) {
    try {
      // Select best carrier based on optimization rules
      const selectedCarrier = this.selectCarrier(order);
      
      if (!selectedCarrier) {
        throw new Error('No suitable carrier found');
      }

      // Generate shipping label
      const labelResult = await this.generateShippingLabel(order, selectedCarrier);
      
      if (!labelResult.success) {
        throw new Error(`Failed to generate label: ${labelResult.error}`);
      }

      // Update fulfillment with tracking
      if (this.shipping.tracking_updates) {
        await this.updateTracking(order.id, fulfillmentResult.fulfillmentId, labelResult.trackingNumber);
      }

      return {
        success: true,
        carrier: selectedCarrier.name,
        trackingNumber: labelResult.trackingNumber,
        labelUrl: labelResult.labelUrl,
        cost: labelResult.cost,
        service: labelResult.service,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error processing shipping for order ${order.id}:`, error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  selectCarrier(order) {
    // Carrier selection logic
    const availableCarriers = Object.values(this.carriers).filter(carrier => 
      carrier.enabled && this.isCarrierAvailable(carrier, order)
    );

    if (availableCarriers.length === 0) {
      return null;
    }

    // Apply optimization rules
    if (this.shipping.optimization.rate_shopping) {
      // Select cheapest carrier that meets delivery requirements
      return availableCarriers.reduce((cheapest, carrier) => {
        const carrierCost = this.calculateShippingCost(carrier, order);
        const cheapestCost = this.calculateShippingCost(cheapest, order);
        return carrierCost < cheapestCost ? carrier : cheapest;
      });
    } else {
      // Use default carrier
      return availableCarriers.find(c => c.name === 'usps') || availableCarriers[0];
    }
  }

  isCarrierAvailable(carrier, order) {
    // Check if carrier services destination
    const destination = order.shipping_address.country_code;
    
    // Simplified check - in production, use carrier API
    const supportedCountries = {
      usps: ['US', 'CA', 'GB', 'DE', 'FR'],
      fedex: ['US', 'CA', 'MX', 'GB', 'DE', 'FR', 'JP'],
      ups: ['US', 'CA', 'MX', 'GB', 'DE', 'FR', 'CN']
    };

    return supportedCountries[carrier.name]?.includes(destination) || false;
  }

  calculateShippingCost(carrier, order) {
    // Simplified cost calculation
    const baseCost = {
      usps: 5.99,
      fedex: 8.99,
      ups: 7.99
    }[carrier.name] || 10.00;

    // Add weight-based cost
    const totalWeight = order.line_items.reduce((sum, item) => 
      sum + (item.grams || 100) * item.quantity, 0
    ) / 1000; // Convert to kg

    const weightCost = totalWeight * 2.5;
    
    return baseCost + weightCost;
  }

  async generateShippingLabel(order, carrier) {
    // In production, integrate with carrier API
    // For now, return mock data
    return {
      success: true,
      trackingNumber: `TRK${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      labelUrl: `https://labels.example.com/${carrier.name}/${order.id}.pdf`,
      cost: this.calculateShippingCost(carrier, order),
      service: carrier.default_service,
      timestamp: new Date().toISOString()
    };
  }

  async updateTracking(orderId, fulfillmentId, trackingNumber) {
    // Update Shopify fulfillment with tracking
    console.log(`Updating tracking for order ${orderId}: ${trackingNumber}`);
    // Implementation would call Shopify API
    return { success: true };
  }

  async sendOrderNotifications(order, processingResult) {
    const notificationsSent = [];

    // Order confirmation
    if (this.notifications.order_confirmation.enabled) {
      await this.sendNotification(order, 'order_confirmation', {
        orderId: order.id,
        items: order.line_items
      });
      notificationsSent.push('order_confirmation');
    }

    // Shipping confirmation
    if (this.notifications.shipping_confirmation.enabled && processingResult.trackingNumber) {
      await this.sendNotification(order, 'shipping_confirmation', {
        orderId: order.id,
        trackingNumber: processingResult.trackingNumber,
        carrier: processingResult.carrier,
        estimatedDelivery: this.calculateEstimatedDelivery(processingResult.carrier)
      });
      notificationsSent.push('shipping_confirmation');
    }

    return notificationsSent;
  }

  async sendNotification(order, type, data) {
    // In production, integrate with email/SMS service
    // For now, log notification
    console.log(`Notification sent: ${type} to ${order.email}`, data);
    
    return {
      success: true,
      type,
      recipient: order.email,
      timestamp: new Date().toISOString()
    };
  }

  calculateEstimatedDelivery(carrier) {
    const deliveryDays = {
      usps: { Priority: 2, 'First Class': 3, 'Parcel Select': 5 },
      fedex: { Ground: 3, 'Express Saver': 1, '2Day': 2, Overnight: 1 },
      ups: { Ground: 3, '3 Day Select': 3, '2nd Day Air': 2, 'Next Day Air': 1 }
    }[carrier]?.Ground || 3;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    return deliveryDate.toISOString().split('T')[0];
  }

  async processReturns(returnRequest) {
    if (!this.returns.auto_approve) {
      return { status: 'requires_manual_approval' };
    }

    try {
      // Check return eligibility
      const eligibility = this.checkReturnEligibility(returnRequest);
      
      if (!eligibility.eligible) {
        return { status: 'rejected', reason: eligibility.reason };
      }

      // Generate return label
      const returnLabel = await this.generateReturnLabel(returnRequest);
      
      // Process refund if applicable
      let refundResult = null;
      if (returnRequest.refund_amount <= this.returns.refund_threshold) {
        refundResult = await this.processRefund(returnRequest);
      }

      return {
        status: 'approved',
        returnLabel,
        refund: refundResult,
        instructions: this.getReturnInstructions(),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error processing return:`, error.message);
      return { status: 'error', error: error.message };
    }
  }

  checkReturnEligibility(returnRequest) {
    const orderDate = new Date(returnRequest.order_date);
    const returnWindow = new Date(orderDate);
    returnWindow.setDate(returnWindow.getDate() + this.returns.return_window_days);
    
    if (new Date() > returnWindow) {
      return { eligible: false, reason: 'Return window expired' };
    }
    
    if (returnRequest.reason === 'changed_mind' && !this.returns.restock_items) {
      return { eligible: false, reason: 'Item not restockable' };
    }
    
    return { eligible: true };
  }

  async generateReturnLabel(returnRequest) {
    // Generate return shipping label
    return {
      labelUrl: `https://returns.example.com/label/${returnRequest.id}.pdf`,
      trackingNumber: `RET${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      cost: this.returns.return_shipping.prepaid ? 0 : 5.99,
      carrier: this.returns.return_shipping.carrier,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async processRefund(returnRequest) {
    // Process refund through payment gateway
    return {
      success: true,
      amount: returnRequest.refund_amount,
      method: returnRequest.payment_method,
      transactionId: `REF${Date.now()}`,
      estimatedDays: this.returns.refunds.processing_days,
      timestamp: new Date().toISOString()
    };
  }

  getReturnInstructions() {
    return {
      packaging: 'Please use original packaging if possible',
      label: 'Attach label to outside of package',
      dropoff: 'Drop at any carrier location',
      inspection: 'Items will be inspected upon receipt',
      timeframe: `Refunds processed within ${this.returns.refunds.processing_days} business days`
    };
  }

  getProcessingStats() {
    const last24h = this.processingHistory.filter(
      p => new Date(p.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const successful = last24h.filter(p => p.success);
    const failed = last24h.filter(p => !p.success);
    
    const avgProcessingTime = last24h.length > 0
      ? last24h.reduce((sum, p) => {
          const start = new Date(p.timestamp);
          const end = new Date(p.steps[p.steps.length - 1]?.timestamp || p.timestamp);
          return sum + (end - start);
        }, 0) / last24h.length
      : 0;

    return {
      period: '24h',
      totalOrders: last24h.length,
      successful: successful.length,
      failed: failed.length,
      successRate: last24h.length > 0 ? (successful.length / last24h.length) * 100 : 0,
      avgProcessingTimeMs: avgProcessingTime,
      fraudReviews: last24h.filter(p => p.holdReason === 'fraud_check').length,
      backorders: last24h.filter(p => p.steps.some(s => s.step === 'backorder_handling')).length,
      carriersUsed: [...new Set(last24h.map(p => p.carrier).filter(Boolean))],
      timestamp: new Date().toISOString()
    };
  }

  clearHistory() {
    this.processingHistory = [];
    console.log('Processing history cleared');
  }
}

// Export for use in OpenClaw
module.exports = OrderProcessor;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const processor = new OrderProcessor();
    const initialized = await processor.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize OrderProcessor');
      process.exit(1);
    }
    
    const command = process.argv[2];
    
    switch (command) {
      case 'stats':
        const stats = processor.getProcessingStats();
        console.log(JSON.stringify(stats, null, 2));
        break;
      case 'test-order':
        // Test with mock order
        const mockOrder = {
          id: `TEST${Date.now()}`,
          email: 'test@example.com',
          total_price: 99.99,
          line_items: [
            { id: 1, sku: 'SKU001', quantity: 2 },
            { id: 2, sku: 'SKU002', quantity: 1 }
          ],
          shipping_address: {
            country_code: 'US',
            zip: '10001'
          },
          billing_address: {
            country_code: 'US',
            zip: '10001'
          },
          client_details: {
            browser_ip: '192.168.1.1'
          }
        };
        
        // Mock ShopifyAPI
        const mockShopifyAPI = {
          fulfillOrder: async () => ({ id: 'FULFILL123', status: 'success' })
        };
        
        const result = await processor.processOrder(mockOrder, mockShopifyAPI);
        console.log(JSON.stringify(result, null, 2));
        break;
      case 'clear-history':
        processor.clearHistory();
        console.log('History cleared');
        break;
      default:
        console.log('Available commands:');
        console.log('  stats - Get processing statistics');
        console.log('  test-order - Process test order');
        console.log('  clear-history - Clear processing history');
    }
  })().catch(console.error);
}
