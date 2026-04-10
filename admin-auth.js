// Admin Authentication System
// For production, this would connect to a backend API
// For demo purposes, we'll use localStorage with hashed passwords

class AdminAuth {
    constructor() {
        this.currentAdmin = null;
        this.init();
    }

    init() {
        // Initialize default admin if none exists
        if (!localStorage.getItem('novaAdmins')) {
            const defaultAdmin = {
                id: 'admin-001',
                username: 'admin',
                email: 'admin@nova3mm.com',
                password: this.hashPassword('admin123'), // Default password
                name: 'System Administrator',
                role: 'superadmin',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            localStorage.setItem('novaAdmins', JSON.stringify([defaultAdmin]));
        }

        // Check if admin is already logged in
        const session = localStorage.getItem('novaAdminSession');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.expires > Date.now()) {
                    this.currentAdmin = sessionData.admin;
                } else {
                    localStorage.removeItem('novaAdminSession');
                }
            } catch (e) {
                localStorage.removeItem('novaAdminSession');
            }
        }
    }

    hashPassword(password) {
        // Simple hash for demo - in production use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    async login(username, password) {
        const admins = JSON.parse(localStorage.getItem('novaAdmins') || '[]');
        const hashedPassword = this.hashPassword(password);
        
        const admin = admins.find(a => 
            (a.username === username || a.email === username) && 
            a.password === hashedPassword
        );

        if (admin) {
            // Update last login
            admin.lastLogin = new Date().toISOString();
            localStorage.setItem('novaAdmins', JSON.stringify(admins));

            // Create session
            const sessionData = {
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                },
                expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                token: 'demo-token-' + Date.now()
            };
            
            localStorage.setItem('novaAdminSession', JSON.stringify(sessionData));
            this.currentAdmin = sessionData.admin;
            
            return { success: true, admin: sessionData.admin };
        }

        return { success: false, error: 'Invalid credentials' };
    }

    logout() {
        localStorage.removeItem('novaAdminSession');
        this.currentAdmin = null;
        return { success: true };
    }

    isAuthenticated() {
        return this.currentAdmin !== null;
    }

    getCurrentAdmin() {
        return this.currentAdmin;
    }

    hasPermission(requiredRole) {
        if (!this.currentAdmin) return false;
        
        const roleHierarchy = {
            'superadmin': 3,
            'admin': 2,
            'moderator': 1,
            'viewer': 0
        };
        
        return roleHierarchy[this.currentAdmin.role] >= roleHierarchy[requiredRole];
    }

    // Admin management methods
    async createAdmin(adminData) {
        if (!this.hasPermission('superadmin')) {
            return { success: false, error: 'Permission denied' };
        }

        const admins = JSON.parse(localStorage.getItem('novaAdmins') || '[]');
        
        // Check if username or email already exists
        if (admins.some(a => a.username === adminData.username)) {
            return { success: false, error: 'Username already exists' };
        }
        if (admins.some(a => a.email === adminData.email)) {
            return { success: false, error: 'Email already exists' };
        }

        const newAdmin = {
            id: 'admin-' + Date.now(),
            ...adminData,
            password: this.hashPassword(adminData.password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        admins.push(newAdmin);
        localStorage.setItem('novaAdmins', JSON.stringify(admins));
        
        return { 
            success: true, 
            admin: {
                id: newAdmin.id,
                username: newAdmin.username,
                email: newAdmin.email,
                name: newAdmin.name,
                role: newAdmin.role
            }
        };
    }

    async updateAdmin(adminId, updates) {
        if (!this.hasPermission('superadmin')) {
            return { success: false, error: 'Permission denied' };
        }

        const admins = JSON.parse(localStorage.getItem('novaAdmins') || '[]');
        const index = admins.findIndex(a => a.id === adminId);
        
        if (index === -1) {
            return { success: false, error: 'Admin not found' };
        }

        // Don't allow changing own role to lower permission
        if (admins[index].id === this.currentAdmin.id && updates.role) {
            const roleHierarchy = { 'superadmin': 3, 'admin': 2, 'moderator': 1, 'viewer': 0 };
            if (roleHierarchy[updates.role] < roleHierarchy[admins[index].role]) {
                return { success: false, error: 'Cannot downgrade your own role' };
            }
        }

        // Update fields
        if (updates.password) {
            admins[index].password = this.hashPassword(updates.password);
        }
        if (updates.name) admins[index].name = updates.name;
        if (updates.role) admins[index].role = updates.role;
        if (updates.email) admins[index].email = updates.email;

        localStorage.setItem('novaAdmins', JSON.stringify(admins));
        
        return { 
            success: true, 
            admin: {
                id: admins[index].id,
                username: admins[index].username,
                email: admins[index].email,
                name: admins[index].name,
                role: admins[index].role
            }
        };
    }

    async deleteAdmin(adminId) {
        if (!this.hasPermission('superadmin')) {
            return { success: false, error: 'Permission denied' };
        }

        // Don't allow deleting yourself
        if (adminId === this.currentAdmin.id) {
            return { success: false, error: 'Cannot delete your own account' };
        }

        const admins = JSON.parse(localStorage.getItem('novaAdmins') || '[]');
        const filteredAdmins = admins.filter(a => a.id !== adminId);
        
        if (filteredAdmins.length === admins.length) {
            return { success: false, error: 'Admin not found' };
        }

        localStorage.setItem('novaAdmins', JSON.stringify(filteredAdmins));
        return { success: true };
    }

    getAllAdmins() {
        if (!this.hasPermission('admin')) {
            return [];
        }

        const admins = JSON.parse(localStorage.getItem('novaAdmins') || '[]');
        return admins.map(admin => ({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            createdAt: admin.createdAt,
            lastLogin: admin.lastLogin
        }));
    }
}

// Create global auth instance
window.AdminAuth = new AdminAuth();