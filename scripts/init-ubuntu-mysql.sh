#!/bin/bash

# Ubuntu MySQL Database Initialization Script for South Delhi Real Estate
# This script will create the database and import the schema on Ubuntu servers

echo "🚀 Starting Ubuntu MySQL Database Initialization..."

# Default MySQL configuration for Ubuntu
DB_HOST="localhost"
DB_USER="root"
DB_NAME="southdelhirealestate"
DB_PORT="3306"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root or with sudo
check_privileges() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script needs to be run with sudo privileges for MySQL setup."
        print_status "Please run: sudo $0"
        exit 1
    fi
}

# Install MySQL if not present
install_mysql() {
    print_status "Checking if MySQL is installed..."
    
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL not found. Installing MySQL Server..."
        
        # Update package list
        apt update
        
        # Install MySQL server
        apt install -y mysql-server mysql-client
        
        # Start and enable MySQL service
        systemctl start mysql
        systemctl enable mysql
        
        print_status "MySQL installed and started ✓"
        
        # Secure installation prompt
        print_note "Please run 'mysql_secure_installation' after this script to secure your MySQL installation."
    else
        print_status "MySQL is already installed ✓"
    fi
}

# Check if MySQL service is running
check_mysql_service() {
    print_status "Checking MySQL service status..."
    
    if ! systemctl is-active --quiet mysql; then
        print_warning "MySQL service is not running. Starting it..."
        systemctl start mysql
        
        if [ $? -eq 0 ]; then
            print_status "MySQL service started successfully ✓"
        else
            print_error "Failed to start MySQL service!"
            exit 1
        fi
    else
        print_status "MySQL service is running ✓"
    fi
}

# Test MySQL connection
test_connection() {
    print_status "Testing MySQL connection..."
    
    # Try to connect to MySQL
    if mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "SELECT 1;" &> /dev/null; then
        print_status "MySQL connection successful ✓"
    else
        print_error "Cannot connect to MySQL!"
        print_note "If this is a fresh MySQL installation, you may need to:"
        print_note "1. Run: sudo mysql_secure_installation"
        print_note "2. Set a root password"
        print_note "3. Or use: sudo mysql (for authentication_socket)"
        exit 1
    fi
}

# Create database
create_database() {
    print_status "Creating database '$DB_NAME'..."
    
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_status "Database '$DB_NAME' created successfully ✓"
    else
        print_error "Failed to create database!"
        print_note "You may need to run this with proper MySQL credentials"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if we have migrations
    if [ -d "migrations" ]; then
        print_status "Found migrations directory. Running Drizzle migrations..."
        
        # Switch back to the original user for npm commands
        ORIGINAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
        
        if [ -n "$ORIGINAL_USER" ]; then
            sudo -u $ORIGINAL_USER npm run db:migrate
        else
            npm run db:migrate
        fi
        
        if [ $? -eq 0 ]; then
            print_status "Database migrations completed successfully ✓"
        else
            print_warning "Database migrations failed. You may need to run 'npm run db:migrate' manually."
        fi
    else
        print_warning "No migrations directory found. Skipping migrations."
    fi
}

# Import database schema (fallback)
import_schema() {
    if [ -f "mysql_backup.sql" ]; then
        print_status "Importing database schema from mysql_backup.sql..."
        
        mysql -h $DB_HOST -P $DB_PORT -u $DB_USER $DB_NAME < mysql_backup.sql
        
        if [ $? -eq 0 ]; then
            print_status "Database schema imported successfully ✓"
        else
            print_error "Failed to import database schema!"
            exit 1
        fi
    else
        print_note "No mysql_backup.sql found. Relying on migrations."
    fi
}

# Create database user for application (optional)
create_app_user() {
    print_status "Creating application database user..."
    
    read -p "Do you want to create a dedicated database user for the application? (y/N): " create_user
    
    if [[ $create_user =~ ^[Yy]$ ]]; then
        read -p "Enter username for the application database user: " app_user
        read -s -p "Enter password for the application database user: " app_password
        echo
        
        mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "
            CREATE USER IF NOT EXISTS '$app_user'@'localhost' IDENTIFIED BY '$app_password';
            GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$app_user'@'localhost';
            FLUSH PRIVILEGES;
        " 2>/dev/null
        
        if [ $? -eq 0 ]; then
            print_status "Application user '$app_user' created successfully ✓"
            print_note "Update your .env file with these credentials:"
            print_note "DB_USER=$app_user"
            print_note "DB_PASSWORD=$app_password"
        else
            print_error "Failed to create application user!"
        fi
    fi
}

# Verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if database exists
    DB_EXISTS=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "SHOW DATABASES LIKE '$DB_NAME';" | grep $DB_NAME)
    
    if [ -z "$DB_EXISTS" ]; then
        print_error "Database '$DB_NAME' was not created!"
        exit 1
    fi
    
    # Check tables
    TABLES=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -D $DB_NAME -e "SHOW TABLES;" 2>/dev/null | tail -n +2)
    
    if [ -z "$TABLES" ]; then
        print_warning "No tables found in database. This is normal if using migrations."
    else
        print_status "Database verification successful ✓"
        print_status "Tables created:"
        echo "$TABLES" | while read table; do
            echo "  - $table"
        done
    fi
}

# Create environment file for Ubuntu
create_env_file() {
    print_status "Creating/updating .env file for Ubuntu..."
    
    # Get the original user's home directory
    ORIGINAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
    
    # Backup existing .env if it exists
    if [ -f ".env" ]; then
        cp .env .env.backup
        print_warning "Existing .env file backed up as .env.backup"
    fi
    
    # Create new .env file
    cat > .env << EOF
# Database Configuration for Ubuntu MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=southdelhirealestate
DB_PORT=3306

# Alternative DATABASE_URL format (choose one)
# DATABASE_URL=mysql://root@localhost:3306/southdelhirealestate

# Production Configuration
NODE_ENV=production
PORT=5000

# Session Secret (CHANGE THIS IN PRODUCTION!)
SESSION_SECRET=$(openssl rand -base64 32)

# SSL Configuration (for production)
SSL_ENABLED=false

# Log Configuration
LOG_LEVEL=info

# Cloudinary Configuration (add your credentials)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail SMTP example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=South Delhi Realty

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://your-domain.com/api/auth/google/callback

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# WebSocket Configuration
WS_PORT=7822
HMR_PORT=7823
EOF
    
    # Set proper ownership
    if [ -n "$ORIGINAL_USER" ]; then
        chown $ORIGINAL_USER:$ORIGINAL_USER .env
    fi
    
    print_status ".env file created successfully ✓"
    print_warning "Please update the following in .env file:"
    print_warning "  - Cloudinary credentials"
    print_warning "  - Email configuration"
    print_warning "  - Google OAuth credentials (if using)"
    print_warning "  - Domain/CORS settings for production"
}

# Install Node.js dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    
    ORIGINAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
    
    if [ -n "$ORIGINAL_USER" ]; then
        sudo -u $ORIGINAL_USER npm install --production
    else
        npm install --production
    fi
    
    if [ $? -eq 0 ]; then
        print_status "Node.js dependencies installed successfully ✓"
    else
        print_error "Failed to install Node.js dependencies!"
        exit 1
    fi
}

# Setup systemd service
setup_systemd_service() {
    print_status "Setting up systemd service..."
    
    read -p "Do you want to create a systemd service for auto-start? (y/N): " create_service
    
    if [[ $create_service =~ ^[Yy]$ ]]; then
        ORIGINAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
        CURRENT_DIR=$(pwd)
        
        cat > /etc/systemd/system/south-delhi-realty.service << EOF
[Unit]
Description=South Delhi Real Estate Application
Documentation=https://github.com/your-repo
After=network.target mysql.service

[Service]
Type=simple
User=$ORIGINAL_USER
WorkingDirectory=$CURRENT_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start:prod
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=south-delhi-realty

[Install]
WantedBy=multi-user.target
EOF
        
        # Reload systemd and enable service
        systemctl daemon-reload
        systemctl enable south-delhi-realty.service
        
        print_status "Systemd service created and enabled ✓"
        print_note "To start the service: sudo systemctl start south-delhi-realty"
        print_note "To check status: sudo systemctl status south-delhi-realty"
        print_note "To view logs: sudo journalctl -u south-delhi-realty -f"
    fi
}

# Show connection details
show_connection_info() {
    print_status "Database connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo ""
    print_status "Application URLs:"
    echo "  Application: http://localhost:5000"
    echo "  Admin Panel: http://localhost:5000/admin"
    echo ""
    print_status "Default superadmin credentials:"
    echo "  Username: superadmin"
    echo "  Password: superadmin123"
    print_warning "Please change the default password after first login!"
}

# Main execution
main() {
    echo "=================================================="
    echo "   South Delhi Real Estate - Ubuntu Server Setup"
    echo "=================================================="
    echo
    
    check_privileges
    install_mysql
    check_mysql_service
    test_connection
    create_database
    run_migrations
    import_schema
    create_app_user
    verify_setup
    create_env_file
    install_dependencies
    setup_systemd_service
    
    echo
    echo "=================================================="
    print_status "🎉 Ubuntu server setup completed successfully!"
    echo "=================================================="
    echo
    show_connection_info
    echo
    print_status "Next steps:"
    echo "  1. Update configuration in .env file"
    echo "  2. Build the application: npm run build"
    echo "  3. Start with PM2: npm run pm2:start"
    echo "  4. Or start with systemd: sudo systemctl start south-delhi-realty"
    echo "  5. Setup reverse proxy (nginx/apache) for production"
    echo "  6. Configure SSL certificates"
    echo
    print_note "For production deployment, consider using:"
    print_note "  - Nginx as reverse proxy"
    print_note "  - SSL/TLS certificates (Let's Encrypt)"
    print_note "  - Firewall configuration (ufw)"
    print_note "  - Regular backups"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Ubuntu MySQL Database Initialization Script"
        echo "Usage: sudo $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --no-service   Skip systemd service creation"
        echo "  --no-user      Skip application user creation"
        echo ""
        exit 0
        ;;
    --no-service)
        SKIP_SERVICE=true
        ;;
    --no-user)
        SKIP_USER=true
        ;;
esac

# Run main function
main 