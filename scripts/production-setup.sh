#!/bin/bash

# South Delhi Real Estate - Production Setup Script
# This script sets up the production environment on a Linux server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="south-delhi-real-estate"
APP_USER="app"
APP_DIR="/var/www/${APP_NAME}"
LOG_DIR="/var/log/${APP_NAME}"
BACKUP_DIR="/opt/backups/${APP_NAME}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    apt update
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Install other dependencies
    apt install -y \
        nginx \
        mysql-server \
        redis-server \
        git \
        curl \
        wget \
        unzip \
        supervisor \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban
    
    # Install PM2 globally
    npm install -g pm2
    
    print_success "Dependencies installed successfully"
}

# Function to create application user
create_app_user() {
    print_status "Creating application user..."
    
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash "$APP_USER"
        usermod -aG sudo "$APP_USER"
        print_success "User $APP_USER created"
    else
        print_warning "User $APP_USER already exists"
    fi
}

# Function to setup directories
setup_directories() {
    print_status "Setting up directories..."
    
    # Create application directory
    mkdir -p "$APP_DIR"
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    chown -R "$APP_USER:$APP_USER" "$LOG_DIR"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    chown -R "$APP_USER:$APP_USER" "$BACKUP_DIR"
    
    # Create SSL directory
    mkdir -p /etc/nginx/ssl
    
    print_success "Directories created successfully"
}

# Function to configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow MySQL (only from localhost)
    ufw allow from 127.0.0.1 to any port 3306
    
    print_success "Firewall configured successfully"
}

# Function to secure MySQL
secure_mysql() {
    print_status "Securing MySQL installation..."
    
    # Start MySQL service
    systemctl start mysql
    systemctl enable mysql
    
    # Generate random root password
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)
    
    # Secure MySQL installation
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';"
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "DELETE FROM mysql.user WHERE User='';"
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "DROP DATABASE IF EXISTS test;"
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "FLUSH PRIVILEGES;"
    
    # Save root password to secure file
    echo "MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}" > /root/.mysql_credentials
    chmod 600 /root/.mysql_credentials
    
    print_success "MySQL secured successfully"
    print_warning "MySQL root password saved to /root/.mysql_credentials"
}

# Function to configure Redis
configure_redis() {
    print_status "Configuring Redis..."
    
    # Start Redis service
    systemctl start redis-server
    systemctl enable redis-server
    
    # Basic Redis security
    sed -i 's/^# requirepass.*/requirepass your_redis_password_here/' /etc/redis/redis.conf
    sed -i 's/^bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
    
    systemctl restart redis-server
    
    print_success "Redis configured successfully"
}

# Function to setup fail2ban
setup_fail2ban() {
    print_status "Setting up Fail2ban..."
    
    # Create nginx jail configuration
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    print_success "Fail2ban configured successfully"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Create application site configuration
    cat > "/etc/nginx/sites-available/${APP_NAME}" << EOF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

# Upstream backend
upstream app_backend {
    server 127.0.0.1:5000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name _;
    return 301 https://\$host\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Application proxy
    location / {
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://app_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Auth rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://app_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Enable site
    ln -sf "/etc/nginx/sites-available/${APP_NAME}" "/etc/nginx/sites-enabled/"
    
    # Test configuration
    nginx -t
    
    systemctl enable nginx
    systemctl restart nginx
    
    print_success "Nginx configured successfully"
}

# Function to setup SSL certificate
setup_ssl() {
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
    read -p "Enter your email for SSL certificate: " EMAIL
    
    if [[ -z "$DOMAIN_NAME" || -z "$EMAIL" ]]; then
        print_warning "Skipping SSL setup - domain name or email not provided"
        return
    fi
    
    print_status "Setting up SSL certificate for $DOMAIN_NAME..."
    
    # Get SSL certificate
    certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --email "$EMAIL" --agree-tos --non-interactive
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    print_success "SSL certificate configured successfully"
}

# Function to create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > "/opt/backup-${APP_NAME}.sh" << EOF
#!/bin/bash

# Backup script for ${APP_NAME}
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR}"

# Create backup directory
mkdir -p "\$BACKUP_DIR"

# Database backup
if [[ -f /root/.mysql_credentials ]]; then
    source /root/.mysql_credentials
    mysqldump -u root -p"\$MYSQL_ROOT_PASSWORD" southdelhirealestate > "\$BACKUP_DIR/db_\$DATE.sql"
fi

# Application files backup
tar -czf "\$BACKUP_DIR/app_\$DATE.tar.gz" -C "${APP_DIR}" .

# Keep only last 7 days of backups
find "\$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "\$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF
    
    chmod +x "/opt/backup-${APP_NAME}.sh"
    
    # Schedule daily backups
    echo "0 2 * * * /opt/backup-${APP_NAME}.sh" | crontab -
    
    print_success "Backup script created and scheduled"
}

# Function to create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    cat > "/opt/monitor-${APP_NAME}.sh" << EOF
#!/bin/bash

# Monitoring script for ${APP_NAME}
LOG_FILE="${LOG_DIR}/monitor.log"

# Check if application is running
if ! pgrep -f "node.*server/index.ts" > /dev/null; then
    echo "\$(date): Application not running, attempting restart" >> "\$LOG_FILE"
    su - ${APP_USER} -c "cd ${APP_DIR} && pm2 restart ${APP_NAME}"
fi

# Check disk space
DISK_USAGE=\$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [[ \$DISK_USAGE -gt 80 ]]; then
    echo "\$(date): High disk usage: \$DISK_USAGE%" >> "\$LOG_FILE"
fi

# Check memory usage
MEM_USAGE=\$(free | grep Mem | awk '{printf "%.0f", \$3/\$2 * 100.0}')
if [[ \$MEM_USAGE -gt 80 ]]; then
    echo "\$(date): High memory usage: \$MEM_USAGE%" >> "\$LOG_FILE"
fi
EOF
    
    chmod +x "/opt/monitor-${APP_NAME}.sh"
    
    # Schedule monitoring every 5 minutes
    echo "*/5 * * * * /opt/monitor-${APP_NAME}.sh" | crontab -
    
    print_success "Monitoring script created and scheduled"
}

# Function to display summary
display_summary() {
    print_success "Production setup completed successfully!"
    echo
    echo -e "${BLUE}=== Setup Summary ===${NC}"
    echo "Application Directory: $APP_DIR"
    echo "Log Directory: $LOG_DIR"
    echo "Backup Directory: $BACKUP_DIR"
    echo "Application User: $APP_USER"
    echo
    echo -e "${YELLOW}=== Next Steps ===${NC}"
    echo "1. Clone your application code to $APP_DIR"
    echo "2. Copy .env.production to .env and update configuration"
    echo "3. Install application dependencies: npm ci --production"
    echo "4. Build the application: npm run build"
    echo "5. Setup database: npm run db:migrate"
    echo "6. Start the application: pm2 start ecosystem.config.cjs"
    echo
    echo -e "${YELLOW}=== Important Files ===${NC}"
    echo "MySQL root credentials: /root/.mysql_credentials"
    echo "Nginx configuration: /etc/nginx/sites-available/$APP_NAME"
    echo "Backup script: /opt/backup-${APP_NAME}.sh"
    echo "Monitor script: /opt/monitor-${APP_NAME}.sh"
    echo
    echo -e "${RED}=== Security Reminders ===${NC}"
    echo "- Change default passwords"
    echo "- Update firewall rules as needed"
    echo "- Review and update SSL configuration"
    echo "- Test backup and restore procedures"
    echo "- Monitor application logs regularly"
}

# Main execution
main() {
    print_status "Starting production setup for $APP_NAME..."
    
    check_root
    install_dependencies
    create_app_user
    setup_directories
    configure_firewall
    secure_mysql
    configure_redis
    setup_fail2ban
    configure_nginx
    setup_ssl
    create_backup_script
    create_monitoring_script
    display_summary
}

# Execute main function
main "$@" 