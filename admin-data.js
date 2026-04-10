// Admin Data Management System
// Handles all data operations for the admin dashboard

class AdminData {
    constructor() {
        this.initData();
    }

    initData() {
        // Initialize sample data if none exists
        if (!localStorage.getItem('novaProducts')) {
            const sampleProducts = [
                {
                    id: 'prod-001',
                    name: 'Shopify Inventory Automation Skill',
                    type: 'skill',
                    price: 50.00,
                    status: 'active',
                    sales: 42,
                    revenue: 2100.00,
                    createdAt: '2026-03-15T10:30:00Z',
                    updatedAt: '2026-04-09T14:20:00Z'
                },
                {
                    id: 'prod-002',
                    name: 'AI Customer Support Assistant',
                    type: 'skill',
                    price: 75.00,
                    status: 'active',
                    sales: 28,
                    revenue: 2100.00,
                    createdAt: '2026-03-20T11:15:00Z',
                    updatedAt: '2026-04-08T09:45:00Z'
                },
                {
                    id: 'prod-003',
                    name: 'E-commerce Website Template',
                    type: 'website',
                    price: 25000.00,
                    status: 'active',
                    sales: 3,
                    revenue: 75000.00,
                    createdAt: '2026-04-01T09:00:00Z',
                    updatedAt: '2026-04-05T16:30:00Z'
                }
            ];
            localStorage.setItem('novaProducts', JSON.stringify(sampleProducts));
        }

        if (!localStorage.getItem('novaOrders')) {
            const sampleOrders = [
                {
                    id: 'ord-001',
                    customerEmail: 'customer1@example.com',
                    productId: 'prod-001',
                    productName: 'Shopify Inventory Automation Skill',
                    amount: 50.00,
                    status: 'completed',
                    paymentMethod: 'stripe',
                    stripeSessionId: 'cs_test_123',
                    createdAt: '2026-04-08T14:30:00Z',
                    completedAt: '2026-04-08T14:35:00Z'
                },
                {
                    id: 'ord-002',
                    customerEmail: 'customer2@example.com',
                    productId: 'prod-002',
                    productName: 'AI Customer Support Assistant',
                    amount: 75.00,
                    status: 'completed',
                    paymentMethod: 'stripe',
                    stripeSessionId: 'cs_test_456',
                    createdAt: '2026-04-07T11:20:00Z',
                    completedAt: '2026-04-07T11:25:00Z'
                },
                {
                    id: 'ord-003',
                    customerEmail: 'customer3@example.com',
                    productId: 'prod-001',
                    productName: 'Shopify Inventory Automation Skill',
                    amount: 50.00,
                    status: 'pending',
                    paymentMethod: 'stripe',
                    stripeSessionId: 'cs_test_789',
                    createdAt: '2026-04-10T09:15:00Z'
                }
            ];
            localStorage.setItem('novaOrders', JSON.stringify(sampleOrders));
        }

        if (!localStorage.getItem('novaCustomers')) {
            const sampleCustomers = [
                {
                    id: 'cust-001',
                    email: 'customer1@example.com',
                    name: 'John Smith',
                    orders: 2,
                    totalSpent: 125.00,
                    firstPurchase: '2026-04-07T11:20:00Z',
                    lastPurchase: '2026-04-08T14:30:00Z'
                },
                {
                    id: 'cust-002',
                    email: 'customer2@example.com',
                    name: 'Sarah Johnson',
                    orders: 1,
                    totalSpent: 75.00,
                    firstPurchase: '2026-04-07T11:20:00Z',
                    lastPurchase: '2026-04-07T11:20:00Z'
                },
                {
                    id: 'cust-003',
                    email: 'business@example.com',
                    name: 'Tech Solutions Inc.',
                    orders: 1,
                    totalSpent: 25000.00,
                    firstPurchase: '2026-04-05T16:30:00Z',
                    lastPurchase: '2026-04-05T16:30:00Z'
                }
            ];
            localStorage.setItem('novaCustomers', JSON.stringify(sampleCustomers));
        }

        // Initialize support requests if they don't exist (migrate from old storage)
        if (!localStorage.getItem('novaSupportRequests')) {
            const oldRequests = JSON.parse(localStorage.getItem('supportRequests') || '[]');
            if (oldRequests.length > 0) {
                localStorage.setItem('novaSupportRequests', JSON.stringify(oldRequests));
            } else {
                localStorage.setItem('novaSupportRequests', JSON.stringify([]));
            }
        }
    }

    // Dashboard Methods
    getDashboardStats() {
        const orders = JSON.parse(localStorage.getItem('novaOrders') || '[]');
        const products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        const customers = JSON.parse(localStorage.getItem('novaCustomers') || '[]');
        const supportRequests = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');

        const completedOrders = orders.filter(o => o.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
        const activeProducts = products.filter(p => p.status === 'active');

        return {
            totalRevenue,
            totalOrders: orders.length,
            completedOrders: completedOrders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            totalCustomers: customers.length,
            totalProducts: activeProducts.length,
            newSupportRequests: supportRequests.filter(r => r.status === 'new').length,
            totalSupportRequests: supportRequests.length
        };
    }

    getRevenueData(period = '30d') {
        // Generate sample revenue data for the chart
        const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
        const labels = [];
        const data = [];
        
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            if (days <= 30) {
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else {
                labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            }
            
            // Generate random but realistic revenue data
            const baseRevenue = 800;
            const randomFactor = 0.3 + Math.random() * 0.7;
            const trendFactor = 1 + (i * 0.02); // Slight upward trend
            data.push(Math.round(baseRevenue * randomFactor * trendFactor));
        }
        
        return {
            labels,
            datasets: [{
                label: 'Revenue',
                data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
    }

    getProductsData() {
        const products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        
        // Group by product type/name for the chart
        const productGroups = {};
        products.forEach(product => {
            const key = product.name.split(' ')[0]; // Use first word as group
            productGroups[key] = (productGroups[key] || 0) + product.sales;
        });
        
        const labels = Object.keys(productGroups);
        const data = Object.values(productGroups);
        const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#94a3b8'];
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        };
    }

    getRecentActivity(limit = 10) {
        const activities = [];
        const now = new Date();
        
        // Add support requests as activities
        const supportRequests = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');
        supportRequests.slice(-5).forEach(request => {
            activities.push({
                type: 'support',
                title: 'New Support Request',
                description: `${request.name} submitted a ${request.issueType} request`,
                timestamp: request.timestamp
            });
        });
        
        // Add orders as activities
        const orders = JSON.parse(localStorage.getItem('novaOrders') || '[]');
        orders.slice(-5).forEach(order => {
            activities.push({
                type: 'payment',
                title: order.status === 'completed' ? 'New Order' : 'Pending Order',
                description: `${order.customerEmail} purchased ${order.productName}`,
                timestamp: order.createdAt
            });
        });
        
        // Add sample activities if we don't have enough
        if (activities.length < limit) {
            const sampleActivities = [
                {
                    type: 'user',
                    title: 'New Customer Registration',
                    description: 'New customer registered on the marketplace',
                    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'product',
                    title: 'Product Update',
                    description: 'Shopify Inventory Skill was updated',
                    timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
                },
                {
                    type: 'payment',
                    title: 'Payment Processed',
                    description: 'Stripe payment of $50.00 completed',
                    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            
            activities.push(...sampleActivities);
        }
        
        // Sort by timestamp (newest first) and limit
        return activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Product Management Methods
    getProducts(filter = {}) {
        let products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        
        if (filter.status) {
            products = products.filter(p => p.status === filter.status);
        }
        if (filter.type) {
            products = products.filter(p => p.type === filter.type);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.id.toLowerCase().includes(searchLower)
            );
        }
        
        return products;
    }

    getProduct(id) {
        const products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        return products.find(p => p.id === id);
    }

    createProduct(productData) {
        const products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        
        const newProduct = {
            id: 'prod-' + Date.now(),
            ...productData,
            sales: 0,
            revenue: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        localStorage.setItem('novaProducts', JSON.stringify(products));
        
        return { success: true, product: newProduct };
    }

    updateProduct(id, updates) {
        const products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) {
            return { success: false, error: 'Product not found' };
        }
        
        products[index] = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('novaProducts', JSON.stringify(products));
        return { success: true, product: products[index] };
    }

    deleteProduct(id) {
        const products = JSON.parse(localStorage.getItem('novaProducts') || '[]');
        const filteredProducts = products.filter(p => p.id !== id);
        
        if (filteredProducts.length === products.length) {
            return { success: false, error: 'Product not found' };
        }
        
        localStorage.setItem('novaProducts', JSON.stringify(filteredProducts));
        return { success: true };
    }

    // Order Management Methods
    getOrders(filter = {}) {
        let orders = JSON.parse(localStorage.getItem('novaOrders') || '[]');
        
        if (filter.status) {
            orders = orders.filter(o => o.status === filter.status);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            orders = orders.filter(o => 
                o.customerEmail.toLowerCase().includes(searchLower) ||
                o.productName.toLowerCase().includes(searchLower) ||
                o.id.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort by date (newest first)
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getOrder(id) {
        const orders = JSON.parse(localStorage.getItem('novaOrders') || '[]');
        return orders.find(o => o.id === id);
    }

    updateOrderStatus(id, status) {
        const orders = JSON.parse(localStorage.getItem('novaOrders') || '[]');
        const index = orders.findIndex(o => o.id === id);
        
        if (index === -1) {
            return { success: false, error: 'Order not found' };
        }
        
        orders[index].status = status;
        orders[index].updatedAt = new Date().toISOString();
        
        if (status === 'completed' && !orders[index].completedAt) {
            orders[index].completedAt = new Date().toISOString();
        }
        
        localStorage.setItem('novaOrders', JSON.stringify(orders));
        return { success: true, order: orders[index] };
    }

    // Customer Management Methods
    getCustomers(filter = {}) {
        let customers = JSON.parse(localStorage.getItem('novaCustomers') || '[]');
        
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            customers = customers.filter(c => 
                c.email.toLowerCase().includes(searchLower) ||
                c.name.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort by total spent (highest first)
        return customers.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    getCustomer(id) {
        const customers = JSON.parse(localStorage.getItem('novaCustomers') || '[]');
        return customers.find(c => c.id === id);
    }

    // Support Request Methods
    getSupportRequests(filter = {}) {
        let requests = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');
        
        if (filter.status) {
            requests = requests.filter(r => r.status === filter.status);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            requests = requests.filter(r => 
                r.name.toLowerCase().includes(searchLower) ||
                r.email.toLowerCase().includes(searchLower) ||
                r.message.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort by date (newest first)
        return requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getSupportRequest(id) {
        const requests = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');
        return requests.find(r => r.id === id);
    }

    updateSupportRequestStatus(id, status) {
        const requests = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');
        const index = requests.findIndex(r => r.id === id);
        
        if (index === -1) {
            return { success: false, error: 'Request not found' };
        }
        
        requests[index].status = status;
        requests[index].updatedAt = new Date().toISOString();
        
        if (status === 'resolved' && !requests[index].resolvedAt) {
            requests[index].resolvedAt = new Date().toISOString();
        }
        
        localStorage.setItem('novaSupportRequests', JSON.stringify(requests));
        return { success: true, request: requests[index] };
    }

    deleteSupportRequest(id) {
        const requests = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');
        const filteredRequests = requests.filter(r => r.id !== id);
        
        if (filteredRequests.length === requests.length) {
            return { success: false, error: 'Request not found' };
        }
        
        localStorage.setItem('novaSupportRequests', JSON.stringify(filteredRequests));
        return { success: true };
    }

    // Analytics Methods
    getSalesReport(startDate, endDate) {
        const orders = JSON.parse(localStorage.getItem('novaOrders') || '[]');
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end && order.status === 'completed';
        });
        
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
        const orderCount = filteredOrders.length;
        const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
        
        // Group by product
        const productSales = {};
        filteredOrders.forEach(order => {
            productSales[order.productName] = (productSales[order.productName] || 0) + order.amount;
        });
        
        return {
            period: { start: startDate, end: endDate },
            totalRevenue,
            orderCount,
            averageOrderValue,
            productSales,
            orders: filteredOrders
        };
    }

    // Export Methods
    exportData(type) {
        let data;
        let filename;
        
        switch(type) {
            case 'orders':
                data = JSON.parse(localStorage.getItem('novaOrders') || '[]');
                filename = `nova-orders-${new Date().toISOString().split('T')[0]}.json`;
                break;
            case 'products':
                data = JSON.parse(localStorage.getItem('novaProducts') || '[]');
                filename = `nova-products-${new Date().toISOString().split('T')[0]}.json`;
                break;
            case 'customers':
                data = JSON.parse(localStorage.getItem('novaCustomers') || '[]');
                filename = `nova-customers-${new Date().toISOString().split('T')[0]}.json`;
                break;
            case 'support':
                data = JSON.parse(localStorage.getItem('novaSupportRequests') || '[]');
                filename = `nova-support-${new Date().toISOString().split('T')[0]}.json`;
                break;
            default:
                return { success: false, error: 'Invalid export type' };
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        return { success: true, url, filename, data };
    }

    // Import Methods
    importData(type, jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!Array.isArray(data)) {
                return { success: false, error: 'Invalid data format. Expected array.' };
            }
            
            switch(type) {
                case 'orders':
                    localStorage.setItem('novaOrders', JSON.stringify(data));
                    break;
                case 'products':
                    localStorage.setItem('novaProducts', JSON.stringify(data));
                    break;
                case 'customers':
                    localStorage.setItem('novaCustomers', JSON.stringify(data));
                    break;
                case 'support':
                    localStorage.setItem('novaSupportRequests', JSON.stringify(data));
                    break;
                default:
                    return { success: false, error: 'Invalid import type' };
            }
            
            return { success: true, count: data.length };
        } catch (error) {
            return { success: false, error: 'Invalid JSON data' };
        }
    }

    // Backup & Restore
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                products: JSON.parse(localStorage.getItem('novaProducts') || '[]'),
                orders: JSON.parse(localStorage.getItem('novaOrders') || '[]'),
                customers: JSON.parse(localStorage.getItem('novaCustomers') || '[]'),
                supportRequests: JSON.parse(localStorage.getItem('novaSupportRequests') || '[]'),
                admins: JSON.parse(localStorage.getItem('novaAdmins') || '[]')
            }
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = `nova-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        return { success: true, url, filename, backup };
    }

    restoreBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            
            if (!backup.timestamp || !backup.data) {
                return { success: false, error: 'Invalid backup format' };
            }
            
            // Store current data as restore point
            const restorePoint = {
                timestamp: new Date().toISOString(),
                data: {
                    products: JSON.parse(localStorage.getItem('novaProducts') || '[]'),
                    orders: JSON.parse(localStorage.getItem('novaOrders') || '[]'),
                    customers: JSON.parse(localStorage.getItem('novaCustomers') || '[]'),
                    supportRequests: JSON.parse(localStorage.getItem('novaSupportRequests') || '[]'),
                    admins: JSON.parse(localStorage.getItem('novaAdmins') || '[]')
                }
            };
            localStorage.setItem('novaRestorePoint', JSON.stringify(restorePoint));
            
            // Restore backup data
            localStorage.setItem('novaProducts', JSON.stringify(backup.data.products || []));
            localStorage.setItem('novaOrders', JSON.stringify(backup.data.orders || []));
            localStorage.setItem('novaCustomers', JSON.stringify(backup.data.customers || []));
            localStorage.setItem('novaSupportRequests', JSON.stringify(backup.data.supportRequests || []));
            localStorage.setItem('novaAdmins', JSON.stringify(backup.data.admins || []));
            
            return { 
                success: true, 
                message: `Backup from ${backup.timestamp} restored successfully`,
                restorePoint: restorePoint.timestamp
            };
        } catch (error) {
            return { success: false, error: 'Invalid backup data' };
        }
    }

    // Activity Logging
    logActivity(type, action, details) {
        const logs = JSON.parse(localStorage.getItem('novaActivityLogs') || '[]');
        const admin = window.AdminAuth?.getCurrentAdmin();
        
        const logEntry = {
            id: 'log-' + Date.now(),
            type,
            action,
            details,
            admin: admin ? { id: admin.id, name: admin.name } : null,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1' // In production, this would be the actual IP
        };
        
        logs.push(logEntry);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('novaActivityLogs', JSON.stringify(logs));
        return logEntry;
    }

    getActivityLogs(filter = {}) {
        let logs = JSON.parse(localStorage.getItem('novaActivityLogs') || '[]');
        
        if (filter.type) {
            logs = logs.filter(log => log.type === filter.type);
        }
        if (filter.adminId) {
            logs = logs.filter(log => log.admin?.id === filter.adminId);
        }
        if (filter.startDate) {
            const start = new Date(filter.startDate);
            logs = logs.filter(log => new Date(log.timestamp) >= start);
        }
        if (filter.endDate) {
            const end = new Date(filter.endDate);
            logs = logs.filter(log => new Date(log.timestamp) <= end);
        }
        
        // Sort by timestamp (newest first)
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

// Create global data instance
window.AdminData = new AdminData();