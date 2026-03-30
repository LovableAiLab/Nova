#!/usr/bin/env node

/**
 * Profit Margin Calculator and Optimizer
 * Calculates and optimizes profit margins across products
 */

const fs = require('fs').promises;
const path = require('path');

class MarginCalculator {
  constructor(configPath = './configs/margins.json') {
    this.configPath = configPath;
    this.marginHistory = new Map();
    this.priceRecommendations = new Map();
    this.costData = new Map();
  }

  async initialize() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      this.targets = config.targets;
      this.costComponents = config.cost_components;
      this.pricingStrategies = config.pricing_strategies;
      this.optimization = config.optimization;
      this.monitoring = config.monitoring;
      this.analysis = config.analysis;
      this.forecasting = config.forecasting;
      this.rules = config.rules;
      
      console.log('MarginCalculator initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize MarginCalculator:', error.message);
      return false;
    }
  }

  calculateMargin(product) {
    const {
      sellingPrice,
      productCost,
      shippingCost = 0,
      packagingCost = 0,
      paymentFees = 0,
      platformFees = 0,
      marketingCost = 0,
      overhead = 0,
      returnsAllowance = 0
    } = product;

    // Calculate total cost
    let totalCost = productCost;
    
    if (this.costComponents.shipping_cost) totalCost += shippingCost;
    if (this.costComponents.packaging_cost) totalCost += packagingCost;
    if (this.costComponents.payment_fees) totalCost += paymentFees;
    if (this.costComponents.platform_fees) totalCost += platformFees;
    if (this.costComponents.marketing_cost) totalCost += marketingCost;
    if (this.costComponents.overhead_allocation) totalCost += overhead;
    if (this.costComponents.returns_allowance) totalCost += returnsAllowance;

    // Calculate margins
    const grossProfit = sellingPrice - totalCost;
    const grossMargin = sellingPrice > 0 ? grossProfit / sellingPrice : 0;
    const markup = totalCost > 0 ? grossProfit / totalCost : 0;

    // Calculate contribution margin
    const variableCosts = productCost + shippingCost + packagingCost + paymentFees;
    const contributionMargin = sellingPrice - variableCosts;
    const contributionMarginRatio = sellingPrice > 0 ? contributionMargin / sellingPrice : 0;

    return {
      sellingPrice,
      totalCost,
      grossProfit,
      grossMargin,
      markup,
      contributionMargin,
      contributionMarginRatio,
      components: {
        productCost,
        shippingCost,
        packagingCost,
        paymentFees,
        platformFees,
        marketingCost,
        overhead,
        returnsAllowance
      },
      timestamp: new Date().toISOString()
    };
  }

  analyzeProductMargin(product, competitorPrices = []) {
    const margin = this.calculateMargin(product);
    const analysis = {
      productId: product.id,
      sku: product.sku,
      category: product.category,
      margin,
      evaluation: {},
      recommendations: [],
      alerts: []
    };

    // Evaluate against targets
    const categoryTarget = this.targets.category_targets[product.category] || this.targets.target_margin;
    
    analysis.evaluation.targetComparison = {
      currentMargin: margin.grossMargin,
      minimumTarget: this.targets.minimum_margin,
      categoryTarget,
      premiumTarget: this.targets.premium_margin,
      overallTarget: this.targets.overall_target,
      meetsMinimum: margin.grossMargin >= this.targets.minimum_margin,
      meetsCategory: margin.grossMargin >= categoryTarget,
      meetsPremium: margin.grossMargin >= this.targets.premium_margin
    };

    // Check for alerts
    if (margin.grossMargin < this.targets.minimum_margin) {
      analysis.alerts.push({
        type: 'low_margin',
        severity: 'high',
        current: margin.grossMargin,
        target: this.targets.minimum_margin,
        difference: margin.grossMargin - this.targets.minimum_margin
      });
    }

    // Analyze competitor prices if available
    if (competitorPrices.length > 0) {
      const competitorAnalysis = this.analyzeCompetition(margin.sellingPrice, competitorPrices);
      analysis.competitorAnalysis = competitorAnalysis;
      
      // Add competitor-based recommendations
      if (competitorAnalysis.recommendedPrice !== null) {
        analysis.recommendations.push({
          type: 'price_adjustment',
          currentPrice: margin.sellingPrice,
          recommendedPrice: competitorAnalysis.recommendedPrice,
          expectedMarginChange: this.calculateExpectedMarginChange(
            product,
            competitorAnalysis.recommendedPrice
          ),
          reason: competitorAnalysis.recommendationReason,
          confidence: competitorAnalysis.confidence
        });
      }
    }

    // Generate optimization recommendations
    const optimizationRecs = this.generateOptimizationRecommendations(product, margin);
    analysis.recommendations.push(...optimizationRecs);

    // Store in history
    this.storeMarginHistory(product.id, analysis);

    return analysis;
  }

  analyzeCompetition(currentPrice, competitorPrices) {
    if (competitorPrices.length === 0) {
      return {
        competitorCount: 0,
        averagePrice: null,
        lowestPrice: null,
        highestPrice: null,
        recommendedPrice: null,
        confidence: 0
      };
    }

    const validPrices = competitorPrices.filter(p => p > 0);
    const averagePrice = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
    const lowestPrice = Math.min(...validPrices);
    const highestPrice = Math.max(...validPrices);
    
    let recommendedPrice = null;
    let recommendationReason = '';
    let confidence = 0.5;

    const strategy = this.pricingStrategies.competitor_based.position;
    
    switch (strategy) {
      case 'market_leader':
        recommendedPrice = lowestPrice * 0.95; // 5% below lowest
        recommendationReason = 'Market leader pricing - beat lowest competitor';
        confidence = 0.7;
        break;
      case 'competitive':
        recommendedPrice = averagePrice;
        recommendationReason = 'Competitive pricing - match market average';
        confidence = 0.6;
        break;
      case 'premium':
        recommendedPrice = highestPrice * 1.05; // 5% above highest
        recommendationReason = 'Premium pricing - position above competitors';
        confidence = 0.8;
        break;
      default:
        recommendedPrice = currentPrice;
        recommendationReason = 'Maintain current pricing';
        confidence = 0.5;
    }

    // Apply adjustment range constraint
    const maxAdjustment = currentPrice * this.pricingStrategies.competitor_based.adjustment_range;
    if (Math.abs(recommendedPrice - currentPrice) > maxAdjustment) {
      recommendedPrice = currentPrice + Math.sign(recommendedPrice - currentPrice) * maxAdjustment;
      recommendationReason += ' (capped by adjustment range)';
      confidence *= 0.9;
    }

    // Apply rounding rules
    if (this.optimization.rounding_rules.enabled) {
      recommendedPrice = this.applyRounding(recommendedPrice);
    }

    return {
      competitorCount: validPrices.length,
      averagePrice,
      lowestPrice,
      highestPrice,
      priceRange: highestPrice - lowestPrice,
      currentPosition: this.calculatePricePosition(currentPrice, validPrices),
      recommendedPrice,
      recommendationReason,
      confidence,
      strategy
    };
  }

  calculatePricePosition(price, competitorPrices) {
    const sorted = [...competitorPrices].sort((a, b) => a - b);
    const position = sorted.findIndex(p => p >= price);
    
    if (position === -1) return 'above_all';
    if (position === 0) return 'lowest';
    if (position === sorted.length - 1) return 'highest';
    
    const percentile = (position / sorted.length) * 100;
    
    if (percentile < 25) return 'low';
    if (percentile < 50) return 'below_average';
    if (percentile < 75) return 'above_average';
    return 'high';
  }

  applyRounding(price) {
    const endings = this.optimization.rounding_rules.endings;
    const base = Math.floor(price);
    const decimal = price - base;
    
    let roundedPrice = price;
    
    if (this.optimization.rounding_rules.psychological_pricing) {
      // Find closest psychological price ending
      let bestEnding = endings[0];
      let minDiff = Infinity;
      
      endings.forEach(ending => {
        const candidate = base + ending;
        const diff = Math.abs(candidate - price);
        if (diff < minDiff) {
          minDiff = diff;
          bestEnding = ending;
        }
      });
      
      roundedPrice = base + bestEnding;
    }
    
    // Ensure minimum price change
    if (Math.abs(roundedPrice - price) < this.optimization.min_price_change) {
      roundedPrice = price;
    }
    
    return parseFloat(roundedPrice.toFixed(2));
  }

  calculateExpectedMarginChange(product, newPrice) {
    const currentMargin = this.calculateMargin(product);
    const newProduct = { ...product, sellingPrice: newPrice };
    const newMargin = this.calculateMargin(newProduct);
    
    return {
      currentMargin: currentMargin.grossMargin,
      newMargin: newMargin.grossMargin,
      marginChange: newMargin.grossMargin - currentMargin.grossMargin,
      absoluteChange: newMargin.grossProfit - currentMargin.grossProfit,
      percentChange: ((newMargin.grossMargin - currentMargin.grossMargin) / currentMargin.grossMargin) * 100 || 0
    };
  }

  generateOptimizationRecommendations(product, margin) {
    const recommendations = [];
    
    // Cost reduction recommendations
    if (margin.grossMargin < this.targets.minimum_margin) {
      const largestCostComponent = Object.entries(margin.components)
        .filter(([key, value]) => key !== 'sellingPrice' && value > 0)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (largestCostComponent) {
        const [component, cost] = largestCostComponent;
        const reductionTarget = cost * 0.1; // Suggest 10% reduction
        
        recommendations.push({
          type: 'cost_reduction',
          component,
          currentCost: cost,
          suggestedReduction: reductionTarget,
          expectedMarginImpact: this.calculateCostReductionImpact(product, component, reductionTarget),
          priority: 'high'
        });
      }
    }
    
    // Bundle pricing recommendation
    if (this.optimization.bundle_pricing.enabled && product.bundleEligible) {
      recommendations.push({
        type: 'bundle_pricing',
        currentPrice: margin.sellingPrice,
        suggestedDiscount: this.optimization.bundle_pricing.discount_percent,
        bundlePrice: margin.sellingPrice * (1 - this.optimization.bundle_pricing.discount_percent),
        minItems: this.optimization.bundle_pricing.min_items,
        expectedVolumeIncrease: 0.15, // Estimated 15% volume increase
        priority: 'medium'
      });
    }
    
    // Volume discount recommendation
    if (this.optimization.volume_discounts.enabled && product.volumeTier) {
      const applicableTier = this.optimization.volume_discounts.tiers
        .find(tier => product.volumeTier >= tier.quantity);
      
      if (applicableTier) {
        recommendations.push({
          type: 'volume_discount',
          tier: applicableTier.quantity,
          discount: applicableTier.discount,
          discountedPrice: margin.sellingPrice * (1 - applicableTier.discount),
          expectedMarginImpact: -applicableTier.discount, // Negative impact on margin
          expectedVolumeImpact: 0.25, // Estimated 25% volume increase
          priority: 'low'
        });
      }
    }
    
    return recommendations;
  }

  calculateCostReductionImpact(product, component, reduction) {
    const newProduct = { ...product };
    newProduct[component] = product[component] - reduction;
    
    const currentMargin = this.calculateMargin(product);
    const newMargin = this.calculateMargin(newProduct);
    
    return {
      marginImprovement: newMargin.grossMargin - currentMargin.grossMargin,
      profitImprovement: newMargin.grossProfit - currentMargin.grossProfit,
      roi: (newMargin.grossProfit - currentMargin.grossProfit) / reduction || 0
    };
  }

  storeMarginHistory(productId, analysis) {
    const history = this.marginHistory.get(productId) || [];
    history.push({
      timestamp: analysis.margin.timestamp,
      margin: analysis.margin.grossMargin,
      price: analysis.margin.sellingPrice,
      cost: analysis.margin.totalCost,
      analysis: analysis.evaluation
    });
    
    // Keep last 100 entries
    if (history.length > 100) {
      history.shift();
    }
    
    this.marginHistory.set(productId, history);
  }

  async forecastMargins(product, forecastPeriod = 30) {
    if (!this.forecasting.enabled) {
      return null;
    }

    try {
      const currentMargin = this.calculateMargin(product);
      const demandForecast = await this.forecastDemand(product.sku, forecastPeriod);
      const costForecast = await this.forecastCosts(product, forecastPeriod);
      
      const scenarios = this.generateMarginScenarios(product, demandForecast, costForecast);
      
      return {
        productId: product.id,
        sku: product.sku,
        currentMargin: currentMargin.grossMargin,
        forecastPeriod,
        demandForecast,
        costForecast,
        scenarios,
        recommendations: this.generateForecastRecommendations(scenarios),
        confidence: this.forecasting.confidence_level,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`Error forecasting margins for ${product.id}:`, error.message);
      return { error: error.message };
    }
  }

  async forecastDemand(sku, days) {
    // In production, integrate with demand forecasting system
    // For now, return mock forecast
    const baseDemand = 10; // Base daily demand
    const trend = 1.02; // 2% daily growth
    const seasonality = 1.1; // 10% seasonal adjustment
    
    const forecast = [];
    for (let i = 1; i <= days; i++) {
      forecast.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        demand: Math.round(baseDemand * Math.pow(trend, i) * seasonality * (0.9 + Math.random() * 0.2)),
        confidence: 0.7 + Math.random() * 0.2
      });
    }
    
    return forecast;
  }

  async forecastCosts(product, days) {
    // Forecast cost changes
    const inflationRate = 0.0003; // 0.03% daily inflation
    const volatility = 0.0005; // 0.05% daily volatility
    
    const forecasts = {};
    Object.entries(product).forEach(([key, value]) => {
      if (typeof value === 'number' && key.includes('Cost')) {
        const forecast = [];
        for (let i = 1; i <= days; i++) {
          const dailyChange = inflationRate + (Math.random() - 0.5) * volatility;
          forecast.push({
            day: i,
            cost: value * Math.pow(1 + dailyChange, i),
            change: dailyChange
          });
        }
        forecasts[key] = forecast;
      }
    });
    
    return forecasts;
  }

  generateMarginScenarios(product, demandForecast, costForecast) {
    const scenarios = [
      { name: 'baseline', priceChange: 0, demandMultiplier: 1, costMultiplier: 1 },
      { name: 'optimistic', priceChange: 0.05, demandMultiplier: 1.1, costMultiplier: 0.98 },
      { name: 'pessimistic', priceChange: -0.03, demandMultiplier: 0.9, costMultiplier: 1.05 },
      { name: 'aggressive', priceChange: -0.10, demandMultiplier: 1.3, costMultiplier: 1.0 }
    ];
    
    return scenarios.map(scenario => {
      const scenarioProduct = { ...product };
      scenarioProduct.sellingPrice *= (1 + scenario.priceChange);
      
      // Adjust costs
      Object.keys(costForecast).forEach(key => {
        if (scenarioProduct[key]) {
          scenarioProduct[key] *= scenario.costMultiplier;
        }
      });
      
      const margin = this.calculateMargin(scenarioProduct);
      const totalRevenue = demandForecast.reduce((sum, day) => 
        sum + (day.demand * scenario.demandMultiplier * scenarioProduct.sellingPrice), 0);
      const totalCost = demandForecast.reduce((sum, day) => 
        sum + (day.demand * scenario.demandMultiplier * margin.totalCost), 0);
      const totalProfit = totalRevenue - totalCost;
      
      return {
        ...scenario,
        margin: margin.grossMargin,
        totalRevenue,
        totalCost,
        totalProfit,
        roi: totalProfit / totalCost,
        breakEvenDay: this.calculateBreakEvenDay(scenarioProduct, demandForecast, scenario)
      };
    });
  }

  calculateBreakEvenDay(product, demandForecast, scenario) {
    const fixedCosts = 1000; // Example fixed costs
    const margin = this.calculateMargin(product);
    const contribution = margin.contributionMargin * scenario.demandMultiplier;
    
    let cumulativeProfit = 0;
    for (let i = 0; i < demandForecast.length; i++) {
      const dailyProfit = demandForecast[i].demand * contribution;
      cumulativeProfit += dailyProfit;
      
      if (cumulativeProfit >= fixedCosts) {
        return i + 1; // Return day number (1-indexed)
      }
    }
    
    return null; // Never breaks even in forecast period
  }

  generateForecastRecommendations(scenarios) {
    const recommendations = [];
    
    // Find best scenario
    const bestScenario = scenarios.reduce((best, current) => 
      current.totalProfit > best.totalProfit ? current : best
    );
    
    if (bestScenario.name !== 'baseline') {
      recommendations.push({
        type: 'scenario_recommendation',
        scenario: bestScenario.name,
        expectedProfit: bestScenario.totalProfit,
        improvement: ((bestScenario.totalProfit - scenarios[0].totalProfit) / scenarios[0].totalProfit) * 100,
        action: this.getScenarioAction(bestScenario),
        confidence: 0.7
      });
    }
    
    // Check margin targets
    scenarios.forEach(scenario => {
      if (scenario.margin < this.targets.minimum_margin) {
        recommendations.push({
          type: 'margin_warning',
          scenario: scenario.name,
          margin: scenario.margin,
          target: this.targets.minimum_margin,
          action: 'increase_price_or_reduce_costs',
          urgency: 'high'
        });
      }
    });
    
    return recommendations;
  }

  getScenarioAction(scenario) {
    switch (scenario.name) {
      case 'optimistic':
        return 'Consider 5% price increase with marketing push';
      case 'pessimistic':
        return 'Reduce costs by 5% to maintain margins';
      case 'aggressive':
        return 'Aggressive pricing to gain market share';
      default:
        return 'Maintain current strategy';
    }
  }

  getMarginHistory(productId, days = 30) {
    const history = this.marginHistory.get(productId) || [];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return history.filter(entry => new Date(entry.timestamp) > cutoff);
  }

  getProductAnalysisSummary() {
    const summaries = [];
    
    this.marginHistory.forEach((history, productId) => {
      if (history.length > 0) {
        const latest = history[history.length - 1];
        const first = history[0];
        
        const marginChange = latest.margin - first.margin;
        const priceChange = ((latest.price - first.price) / first.price) * 100;
        const costChange = ((latest.cost - first.cost) / first.cost) * 100;
        
        summaries.push({
          productId,
          currentMargin: latest.margin,
          marginChange,
          priceChange,
          costChange,
          meetsMinimum: latest.margin >= this.targets.minimum_margin,
          meetsTarget: latest.margin >= this.targets.target_margin,
          dataPoints: history.length,
          lastUpdated: latest.timestamp
        });
      }
    });
    
    return {
      totalProducts: summaries.length,
      averageMargin: summaries.reduce((sum, s) => sum + s.currentMargin, 0) / summaries.length,
      productsBelowMinimum: summaries.filter(s => !s.meetsMinimum).length,
      productsAboveTarget: summaries.filter(s => s.meetsTarget).length,
      products: summaries.sort((a, b) => b.currentMargin - a.currentMargin),
      timestamp: new Date().toISOString()
    };
  }

  clearHistory() {
    this.marginHistory.clear();
    this.priceRecommendations.clear();
    console.log('Margin history cleared');
  }
}

// Export for use in OpenClaw
module.exports = MarginCalculator;

// CLI interface for direct execution
if (require.main === module) {
  (async () => {
    const calculator = new MarginCalculator();
    const initialized = await calculator.initialize();
    
    if (!initialized) {
      console.error('Failed to initialize MarginCalculator');
      process.exit(1);
    }
    
    const command = process.argv[2];
    
    switch (command) {
      case 'calculate':
        const product = {
          id: 'PROD001',
          sku: 'SKU001',
          category: 'electronics',
          sellingPrice: 199.99,
          productCost: 89.99,
          shippingCost: 9.99,
          packagingCost: 2.99,
          paymentFees: 5.99,
          platformFees: 19.99,
          marketingCost: 9.99,
          overhead: 4.99,
          returnsAllowance: 3.99
        };
        
        const competitorPrices = [189.99, 209.99, 195.99, 199.99, 205.99];
        
        const analysis = calculator.analyzeProductMargin(product, competitorPrices);
        console.log(JSON.stringify(analysis, null, 2));
        break;
      case 'forecast':
        const forecastProduct = {
          id: 'PROD001',
          sku: 'SKU001',
          sellingPrice: 199.99,
          productCost: 89.99,
          shippingCost: 9.99,
          bundleEligible: true,
          volumeTier: 50
        };
        
        const forecast = await calculator.forecastMargins(forecastProduct, 30);
        console.log(JSON.stringify(forecast, null, 2));
        break;
      case 'summary':
        const summary = calculator.getProductAnalysisSummary();
        console.log(JSON.stringify(summary, null, 2));
        break;
      case 'clear-history':
        calculator.clearHistory();
        console.log('History cleared');
        break;
      default:
        console.log('Available commands:');
        console.log('  calculate - Calculate margin for sample product');
        console.log('  forecast - Forecast margins for sample product');
        console.log('  summary - Get analysis summary');
        console.log('  clear-history - Clear margin history');
    }
  })().catch(console.error);
}