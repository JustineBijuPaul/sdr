#!/bin/bash

# XAMPP MySQL Database Initialization Script for South Delhi Real Estate
# This script will create the database and import the schema

echo "🚀 Starting XAMPP MySQL Database Initialization..."

# XAMPP MySQL configuration
MYSQL_PATH="/opt/lampp/bin/mysql"
MYSQLADMIN_PATH="/opt/lampp/bin/mysqladmin"
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="southdelhirealestate"
DB_PORT="3306"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if XAMPP is running
check_xampp() {
    print_status "Checking if XAMPP MySQL is running..."
    
    if ! pgrep -f "mysqld" > /dev/null; then
        print_error "XAMPP MySQL is not running!"
        print_status "Please start XAMPP first:"
        print_status "  sudo /opt/lampp/lampp start"
        print_status "Or start only MySQL:"
        print_status "  sudo /opt/lampp/lampp startmysql"
        exit 1
    fi
    
    print_status "XAMPP MySQL is running ✓"
}

# Test MySQL connection
test_connection() {
    print_status "Testing MySQL connection..."
    
    if ! $MYSQL_PATH -h $DB_HOST -P $DB_PORT -u $DB_USER -e "SELECT 1;" > /dev/null 2>&1; then
        print_error "Cannot connect to MySQL!"
        print_status "Please check if XAMPP MySQL is running and accessible."
        exit 1
    fi
    
    print_status "MySQL connection successful ✓"
}

# Create database
create_database() {
    print_status "Creating database '$DB_NAME'..."
    
    $MYSQL_PATH -h $DB_HOST -P $DB_PORT -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_status "Database '$DB_NAME' created successfully ✓"
    else
        print_error "Failed to create database!"
        exit 1
    fi
}

# Import database schema
import_schema() {
    print_status "Importing database schema from mysql_backup.sql..."
    
    if [ ! -f "mysql_backup.sql" ]; then
        print_error "mysql_backup.sql file not found!"
        print_status "Please ensure mysql_backup.sql exists in the project directory."
        exit 1
    fi
    
    $MYSQL_PATH -h $DB_HOST -P $DB_PORT -u $DB_USER < mysql_backup.sql
    
    if [ $? -eq 0 ]; then
        print_status "Database schema imported successfully ✓"
    else
        print_error "Failed to import database schema!"
        exit 1
    fi
}

# Verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check if database exists
    DB_EXISTS=$($MYSQL_PATH -h $DB_HOST -P $DB_PORT -u $DB_USER -e "SHOW DATABASES LIKE '$DB_NAME';" | grep $DB_NAME)
    
    if [ -z "$DB_EXISTS" ]; then
        print_error "Database '$DB_NAME' was not created!"
        exit 1
    fi
    
    # Check tables
    TABLES=$($MYSQL_PATH -h $DB_HOST -P $DB_PORT -u $DB_USER -D $DB_NAME -e "SHOW TABLES;" | tail -n +2)
    
    if [ -z "$TABLES" ]; then
        print_error "No tables found in database!"
        exit 1
    fi
    
    print_status "Database verification successful ✓"
    print_status "Tables created:"
    echo "$TABLES" | while read table; do
        echo "  - $table"
    done
}

# Create environment file
create_env_file() {
    print_status "Creating/updating .env file..."
    
    # Backup existing .env if it exists
    if [ -f ".env" ]; then
        cp .env .env.backup
        print_warning "Existing .env file backed up as .env.backup"
    fi
    
    # Create new .env file
    cat > .env << EOF
# Database Configuration for XAMPP MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=southdelhirealestate
DB_PORT=3306

# Alternative DATABASE_URL format (choose one)
# DATABASE_URL=mysql://root@localhost:3306/southdelhirealestate

# Cloudinary Configuration (add your credentials)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Session Secret
SESSION_SECRET=your_super_secret_session_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
EOF
    
    print_status ".env file created successfully ✓"
    print_warning "Please update Cloudinary credentials in .env file"
}

# Show connection details
show_connection_info() {
    print_status "Database connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo "  phpMyAdmin: http://localhost/phpmyadmin"
}

# Main execution
main() {
    echo "==============================================="
    echo "  South Delhi Real Estate - Database Setup"
    echo "==============================================="
    echo
    
    check_xampp
    test_connection
    create_database
    import_schema
    verify_setup
    create_env_file
    
    echo
    echo "==============================================="
    print_status "🎉 Database initialization completed successfully!"
    echo "==============================================="
    echo
    show_connection_info
    echo
    print_status "Next steps:"
    echo "  1. Install Node.js dependencies: npm install"
    echo "  2. Update Cloudinary credentials in .env file"
    echo "  3. Start the development server: npm run dev"
    echo "  4. Access phpMyAdmin: http://localhost/phpmyadmin"
    echo
}

# Run main function
main 