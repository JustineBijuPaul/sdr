#!/bin/bash

# Ubuntu Production Deployment Script for South Delhi Real Estate
# This script sets up the complete production environment

echo "🚀 Starting Ubuntu Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="south-delhi-realty"
APP_USER="deploy"
APP_DIR="/var/www/$APP_NAME"
SERVICE_NAME="south-delhi-realty"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_note() {
    echo -e "${BLUE}[NOTE]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script needs to be run as root or with sudo."
        print_status "Please run: sudo $0"
        exit 1
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    print_status "System packages updated ✓"
}

# Install Node.js and npm
install_nodejs() {
    print_status "Installing Node.js and npm..."
    
    if ! command -v node &> /dev/null; then
        # Install Node.js 20.x
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        
        print_status "Node.js installed: $(node --version) ✓"
        print_status "npm installed: $(npm --version) ✓"
    else
        print_status "Node.js already installed: $(node --version) ✓"
    fi
    
    # Install global packages
    npm install -g pm2 tsx
    print_status "Global npm packages installed ✓"
}

# Install MySQL
install_mysql() {
    print_status "Installing MySQL Server..."
    
    if ! command -v mysql &> /dev/null; then
        apt install -y mysql-server mysql-client
        
        # Start and enable MySQL
        systemctl start mysql
        systemctl enable mysql
        
        print_status "MySQL installed and enabled ✓"
        print_note "Please run 'mysql_secure_installation' to secure your MySQL installation"
    else
        print_status "MySQL already installed ✓"
    fi
}

# Install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
        
        # Start and enable Nginx
        systemctl start nginx
        systemctl enable nginx
        
        print_status "Nginx installed and enabled ✓"
    else
        print_status "Nginx already installed ✓"
    fi
}

# Install other dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    apt install -y \
        git \
        curl \
        wget \
        unzip \
        htop \
        fail2ban \
        ufw \
        certbot \
        python3-certbot-nginx \
        build-essential
    
    print_status "System dependencies installed ✓"
}

# Create application user
create_app_user() {
    print_status "Creating application user..."
    
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash $APP_USER
        usermod -aG www-data $APP_USER
        
        print_status "User '$APP_USER' created ✓"
    else
        print_status "User '$APP_USER' already exists ✓"
    fi
}

# Setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    # Create directory if it doesn't exist
    mkdir -p $APP_DIR
    
    # Set ownership
    chown -R $APP_USER:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    
    print_status "Application directory setup complete ✓"
}

# Setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 'Nginx Full'
    
    # Allow MySQL (only from localhost)
    ufw allow from 127.0.0.1 to any port 3306
    
    # Enable firewall
    ufw --force enable
    
    print_status "Firewall configured ✓"
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    read -p "Enter your domain name (e.g., example.com): " domain_name
    
    if [ -z "$domain_name" ]; then
        domain_name="localhost"
        print_warning "No domain provided, using localhost"
    fi
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $domain_name www.$domain_name;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:7822;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /assets {
        alias $APP_DIR/dist/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:5000/health;
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
    
    # Limit file upload size
    client_max_body_size 100M;
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    print_status "Nginx configured for domain: $domain_name ✓"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL with Let's Encrypt..."
    
    if [ "$domain_name" != "localhost" ]; then
        read -p "Do you want to setup SSL with Let's Encrypt? (y/N): " setup_ssl_choice
        
        if [[ $setup_ssl_choice =~ ^[Yy]$ ]]; then
            read -p "Enter your email for Let's Encrypt: " email
            
            if [ -n "$email" ]; then
                certbot --nginx -d $domain_name -d www.$domain_name --email $email --agree-tos --non-interactive
                
                if [ $? -eq 0 ]; then
                    print_status "SSL certificate installed ✓"
                    
                    # Setup auto-renewal
                    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
                    print_status "SSL auto-renewal configured ✓"
                else
                    print_warning "SSL setup failed. You can run it manually later."
                fi
            fi
        fi
    else
        print_note "Skipping SSL setup for localhost"
    fi
}

# Clone or update application
deploy_application() {
    print_status "Deploying application..."
    
    read -p "Enter your Git repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        print_warning "No repository URL provided. You'll need to manually copy your application files to $APP_DIR"
        return
    fi
    
    # Switch to app user
    sudo -u $APP_USER bash << EOF
        cd $APP_DIR
        
        if [ -d ".git" ]; then
            print_status "Updating existing repository..."
            git pull origin main
        else
            print_status "Cloning repository..."
            git clone $repo_url .
        fi
        
        # Install dependencies
        npm install --production
        
        # Build application
        npm run build
EOF
    
    print_status "Application deployed ✓"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment configuration..."
    
    sudo -u $APP_USER bash << EOF
        cd $APP_DIR
        
        # Run the Ubuntu MySQL setup if needed
        if [ -f "scripts/init-ubuntu-mysql.sh" ]; then
            print_status "Running database setup..."
            sudo bash scripts/init-ubuntu-mysql.sh --no-service
        fi
EOF
    
    print_status "Environment setup complete ✓"
}

# Setup PM2
setup_pm2() {
    print_status "Setting up PM2 process manager..."
    
    sudo -u $APP_USER bash << EOF
        cd $APP_DIR
        
        # Start application with PM2
        pm2 start ecosystem.config.cjs --env production
        
        # Save PM2 configuration
        pm2 save
        
        # Setup PM2 startup
        pm2 startup
EOF
    
    # Enable PM2 startup
    env PATH=\$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
    
    print_status "PM2 configured ✓"
}

# Setup log rotation
setup_logs() {
    print_status "Setting up log rotation..."
    
    # Create logs directory
    mkdir -p $APP_DIR/logs
    chown $APP_USER:www-data $APP_DIR/logs
    
    # Setup logrotate
    cat > /etc/logrotate.d/$APP_NAME << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $APP_USER www-data
    postrotate
        systemctl reload $SERVICE_NAME || true
    endscript
}
EOF
    
    print_status "Log rotation configured ✓"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up basic monitoring..."
    
    # Install htop if not present
    apt install -y htop iotop
    
    # Create a simple monitoring script
    cat > /usr/local/bin/monitor-$APP_NAME << EOF
#!/bin/bash
echo "=== South Delhi Real Estate Monitoring ==="
echo "Date: \$(date)"
echo
echo "=== System Resources ==="
free -h
echo
df -h
echo
echo "=== Application Status ==="
systemctl status $SERVICE_NAME --no-pager
echo
echo "=== PM2 Status ==="
sudo -u $APP_USER pm2 status
echo
echo "=== Recent Logs ==="
tail -n 20 $APP_DIR/logs/pm2-error.log
EOF
    
    chmod +x /usr/local/bin/monitor-$APP_NAME
    
    print_status "Monitoring tools installed ✓"
    print_note "Run 'monitor-$APP_NAME' to check application status"
}

# Final security hardening
security_hardening() {
    print_status "Applying security hardening..."
    
    # Configure fail2ban for SSH
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 10m
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF
    
    systemctl restart fail2ban
    
    # Secure shared memory
    echo 'tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0' >> /etc/fstab
    
    # Disable unused network protocols
    echo 'install dccp /bin/true' >> /etc/modprobe.d/blacklist-rare-network.conf
    echo 'install sctp /bin/true' >> /etc/modprobe.d/blacklist-rare-network.conf
    echo 'install rds /bin/true' >> /etc/modprobe.d/blacklist-rare-network.conf
    echo 'install tipc /bin/true' >> /etc/modprobe.d/blacklist-rare-network.conf
    
    print_status "Security hardening applied ✓"
}

# Show deployment summary
show_summary() {
    print_status "Deployment Summary:"
    echo "  Application: $APP_NAME"
    echo "  Directory: $APP_DIR"
    echo "  User: $APP_USER"
    echo "  Domain: $domain_name"
    echo "  HTTP Port: 80"
    echo "  HTTPS Port: 443"
    echo "  App Port: 5000"
    echo ""
    print_status "Service Commands:"
    echo "  Start: sudo systemctl start $SERVICE_NAME"
    echo "  Stop: sudo systemctl stop $SERVICE_NAME"
    echo "  Restart: sudo systemctl restart $SERVICE_NAME"
    echo "  Status: sudo systemctl status $SERVICE_NAME"
    echo ""
    print_status "PM2 Commands (as $APP_USER):"
    echo "  Status: pm2 status"
    echo "  Logs: pm2 logs"
    echo "  Restart: pm2 restart all"
    echo "  Monitor: pm2 monit"
    echo ""
    print_status "Monitoring:"
    echo "  System: monitor-$APP_NAME"
    echo "  Logs: tail -f $APP_DIR/logs/pm2-combined.log"
    echo "  Nginx: tail -f /var/log/nginx/access.log"
    echo ""
    print_status "Default Admin Access:"
    echo "  URL: http://$domain_name/admin"
    echo "  Username: superadmin"
    echo "  Password: superadmin123"
    print_warning "Please change the default password immediately!"
}

# Main execution
main() {
    echo "=================================================="
    echo "    South Delhi Real Estate - Ubuntu Deployment"
    echo "=================================================="
    echo
    
    check_root
    update_system
    install_nodejs
    install_mysql
    install_nginx
    install_dependencies
    create_app_user
    setup_app_directory
    setup_firewall
    configure_nginx
    setup_ssl
    deploy_application
    setup_environment
    setup_pm2
    setup_logs
    setup_monitoring
    security_hardening
    
    echo
    echo "=================================================="
    print_status "🎉 Ubuntu deployment completed successfully!"
    echo "=================================================="
    echo
    show_summary
    echo
    print_note "Next steps:"
    print_note "1. Update .env file with your configurations"
    print_note "2. Setup your Cloudinary and email credentials"
    print_note "3. Configure your domain DNS to point to this server"
    print_note "4. Test the application: http://$domain_name"
    print_note "5. Monitor logs and performance"
    echo
    print_warning "Important: Change default admin password!"
    print_warning "Important: Keep your system updated!"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Ubuntu Production Deployment Script"
        echo "Usage: sudo $0 [options]"
        echo ""
        echo "This script will:"
        echo "  - Install Node.js, MySQL, Nginx"
        echo "  - Create application user and directory"
        echo "  - Configure firewall and security"
        echo "  - Setup reverse proxy with Nginx"
        echo "  - Deploy application with PM2"
        echo "  - Configure SSL with Let's Encrypt"
        echo "  - Setup monitoring and logging"
        echo ""
        exit 0
        ;;
esac

# Run main function
main 