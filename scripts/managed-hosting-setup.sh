#!/bin/bash
# Managed OpenClaw Hosting Setup Script
# $49/month tier - Automated security hardening and cost optimization

set -e

echo "=== NOVA Managed OpenClaw Hosting Setup ==="
echo "Tier: $49/month"
echo "Includes: Security hardening, automated backups, 24/7 monitoring"
echo ""

# Configuration
HOSTING_DIR="/opt/nova-managed-hosting"
USER="nova-client"
DOMAIN="$1"
EMAIL="${2:-admin@${DOMAIN}}"

# Validate inputs
if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain> [email]"
    exit 1
fi

echo "Setting up managed hosting for: $DOMAIN"
echo "Admin email: $EMAIL"
echo ""

# 1. Create hosting directory structure
echo "1. Creating hosting directory structure..."
mkdir -p $HOSTING_DIR/{openclaw,backups,logs,ssl,config}
mkdir -p $HOSTING_DIR/openclaw/{skills,workspace,plugins}

# 2. Create system user
echo "2. Creating system user..."
if ! id "$USER" &>/dev/null; then
    useradd -m -s /bin/bash "$USER"
    echo "User $USER created"
else
    echo "User $USER already exists"
fi

# 3. Install OpenClaw
echo "3. Installing OpenClaw..."
cd $HOSTING_DIR
if ! command -v openclaw &> /dev/null; then
    npm install -g openclaw@latest
    echo "OpenClaw installed"
else
    echo "OpenClaw already installed"
fi

# 4. Security Hardening
echo "4. Applying security hardening..."

# 4.1 Firewall configuration
echo "  4.1 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# 4.2 SSH hardening
echo "  4.2 Hardening SSH..."
sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#ClientAliveInterval 0/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/^#ClientAliveCountMax 3/ClientAliveCountMax 2/' /etc/ssh/sshd_config
systemctl restart sshd

# 4.3 Fail2ban installation
echo "  4.3 Installing Fail2ban..."
apt-get update
apt-get install -y fail2ban

cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
EOF

systemctl enable fail2ban
systemctl start fail2ban

# 4.4 Automatic security updates
echo "  4.4 Configuring automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 5. SSL Certificate (Let's Encrypt)
echo "5. Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

# Create minimal nginx config for certbot
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $HOSTING_DIR/openclaw;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
systemctl reload nginx

# Obtain SSL certificate
certbot certonly --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# 6. Nginx Configuration
echo "6. Configuring Nginx for OpenClaw..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
# NOVA Managed OpenClaw Hosting - $DOMAIN
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;
    
    # OpenClaw proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location /static/ {
        root $HOSTING_DIR/openclaw;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

systemctl reload nginx

# 7. OpenClaw Configuration
echo "7. Configuring OpenClaw..."
cat > $HOSTING_DIR/openclaw/config.json << EOF
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "security": {
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    },
    "cors": {
      "origin": "https://$DOMAIN",
      "credentials": true
    }
  },
  "skills": {
    "directory": "$HOSTING_DIR/openclaw/skills",
    "autoUpdate": true
  },
  "database": {
    "path": "$HOSTING_DIR/openclaw/data/openclaw.db"
  },
  "logging": {
    "level": "info",
    "directory": "$HOSTING_DIR/logs"
  }
}
EOF

# 8. Systemd Service for OpenClaw
echo "8. Creating OpenClaw systemd service..."
cat > /etc/systemd/system/openclaw-managed.service << EOF
[Unit]
Description=NOVA Managed OpenClaw Hosting
After=network.target
Requires=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$HOSTING_DIR/openclaw
Environment=NODE_ENV=production
Environment=OPENCLAW_CONFIG=$HOSTING_DIR/openclaw/config.json
ExecStart=/usr/bin/openclaw start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=openclaw-managed

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$HOSTING_DIR/openclaw
ReadOnlyPaths=/etc/ssl

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable openclaw-managed
systemctl start openclaw-managed

# 9. Automated Backups
echo "9. Setting up automated backups..."
cat > /usr/local/bin/nova-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/nova-managed-hosting/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/openclaw_backup_$DATE.tar.gz"

# Create backup
tar -czf $BACKUP_FILE \
    -C /opt/nova-managed-hosting/openclaw \
    --exclude=node_modules \
    --exclude=*.log \
    .

# Keep only last 7 daily backups
find $BACKUP_DIR -name "openclaw_backup_*.tar.gz" -mtime +7 -delete

# Log backup
echo "$(date): Backup created: $BACKUP_FILE" >> $BACKUP_DIR/backup.log
EOF

chmod +x /usr/local/bin/nova-backup

# Schedule daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/nova-backup") | crontab -

# 10. Monitoring Setup
echo "10. Setting up monitoring..."
apt-get install -y htop nmon

# Create monitoring script
cat > /usr/local/bin/nova-monitor << 'EOF'
#!/bin/bash
LOG_DIR="/opt/nova-managed-hosting/logs"
DATE=$(date +%Y%m%d)

# System metrics
echo "=== System Metrics $(date) ===" >> $LOG_DIR/system_$DATE.log
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%" >> $LOG_DIR/system_$DATE.log
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')" >> $LOG_DIR/system_$DATE.log
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')" >> $LOG_DIR/system_$DATE.log

# OpenClaw service status
if systemctl is-active --quiet openclaw-managed; then
    echo "OpenClaw: RUNNING" >> $LOG_DIR/system_$DATE.log
else
    echo "OpenClaw: STOPPED" >> $LOG_DIR/system_$DATE.log
    # Auto-restart if stopped
    systemctl restart openclaw-managed
    echo "Auto-restarted OpenClaw service" >> $LOG_DIR/system_$DATE.log
fi

# Keep logs for 30 days
find $LOG_DIR -name "system_*.log" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/nova-monitor

# Schedule monitoring every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/nova-monitor") | crontab -

# 11. Cost Optimization
echo "11. Applying cost optimizations..."

# 11.1 Enable swap for memory optimization
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 11.2 Optimize kernel parameters
cat >> /etc/sysctl.conf << EOF
# NOVA Cost Optimization
vm.swappiness=10
vm.vfs_cache_pressure=50
net.core.somaxconn=1024
net.ipv4.tcp_max_syn_backlog=2048
EOF

sysctl -p

# 11.3 Clean up unused packages
apt-get autoremove -y
apt-get clean

# 12. Final Setup
echo "12. Finalizing setup..."

# Set permissions
chown -R $USER:$USER $HOSTING_DIR
chmod -R 750 $HOSTING_DIR

# Create setup completion file
cat > $HOSTING_DIR/setup-complete.md << EOF
# NOVA Managed OpenClaw Hosting Setup Complete

## Domain: $DOMAIN
## Admin Email: $EMAIL
## Setup Date: $(date)

## Services Configured:
1. ✅ OpenClaw installation
2. ✅ SSL Certificate (Let's Encrypt)
3. ✅ Nginx reverse proxy
4. ✅ Firewall configuration
5. ✅ SSH hardening
6. ✅ Fail2ban intrusion prevention
7. ✅ Automatic security updates
8. ✅ Systemd service for OpenClaw
9. ✅ Automated daily backups
10. ✅ 5-minute monitoring
11. ✅ Cost optimizations (swap, kernel tuning)

## Access Information:
- OpenClaw URL: https://$DOMAIN
- SSH Access: ssh $USER@$(hostname -I | awk '{print $1}')
- Backup Directory: $HOSTING_DIR/backups/
- Logs Directory: $HOSTING_DIR/logs/

## Monthly Maintenance Included ($49):
- Security updates
- Backup management
- 24/7 monitoring
- Performance optimization
- Basic support

## Support:
- Telegram: @NOVA_Support
- Email: support@nova.openclaw.ai
- Documentation: https://docs.nova.openclaw.ai

---
*Managed by NOVA - Sovereign Agent Entity*
EOF

echo ""
echo "=== SETUP COMPLETE ==="
echo "OpenClaw is now running at: https://$DOMAIN"
echo ""
echo "Monthly fee: $49"
echo "Includes: Security hardening, backups, monitoring, updates"
echo ""
echo "Setup documentation saved to: $HOSTING_DIR/setup-complete.md"
echo ""
echo "Next steps:"
echo "1. Configure DNS for $DOMAIN to point to $(hostname -I | awk '{print $1}')"
echo "2. Access OpenClaw dashboard at https://$DOMAIN"
echo "3. Install premium skills from ClawHub"
echo ""
echo "For support: @NOVA_Support"