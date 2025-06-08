#!/bin/bash

# Development Docker Script for South Delhi Real Estate
# This script provides easy commands for Docker development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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

# Check if Docker and Docker Compose are installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Copy environment file if it doesn't exist
setup_env() {
    if [ ! -f ".env.docker.local" ]; then
        print_status "Creating .env.docker.local from template..."
        cp .env.docker .env.docker.local
        print_warning "Please edit .env.docker.local with your configuration before starting"
        return 1
    fi
    return 0
}

# Build Docker images
build() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    print_success "Docker images built successfully"
}

# Start development environment
dev() {
    print_status "Starting development environment..."
    
    if ! setup_env; then
        print_error "Please configure .env.docker.local first"
        exit 1
    fi
    
    docker-compose -f docker-compose.yml -f docker-compose.override.yml --env-file .env.docker.local up --build
}

# Start production environment
prod() {
    print_status "Starting production environment..."
    
    if ! setup_env; then
        print_error "Please configure .env.docker.local first"
        exit 1
    fi
    
    docker-compose --env-file .env.docker.local up -d
    print_success "Production environment started"
    print_status "Application available at: http://localhost:7822"
}

# Start with nginx proxy
prod_nginx() {
    print_status "Starting production environment with Nginx..."
    
    if ! setup_env; then
        print_error "Please configure .env.docker.local first"
        exit 1
    fi
    
    docker-compose --env-file .env.docker.local --profile production up -d
    print_success "Production environment with Nginx started"
    print_status "Application available at: http://localhost:80"
}

# Stop all services
stop() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Clean up everything
clean() {
    print_warning "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Show logs
logs() {
    docker-compose logs -f
}

# Show status
status() {
    print_status "Docker container status:"
    docker-compose ps
    
    print_status "\nDocker images:"
    docker images | grep sdr
    
    print_status "\nDocker volumes:"
    docker volume ls | grep sdr
}

# Database operations
db_shell() {
    print_status "Connecting to database shell..."
    docker-compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD:-rootpassword123} ${DB_NAME:-southdelhirealestate}
}

# Application shell
app_shell() {
    print_status "Connecting to application shell..."
    docker-compose exec app bash
}

# Backup database
backup_db() {
    print_status "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker-compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD:-rootpassword123} ${DB_NAME:-southdelhirealestate} > "backup_${timestamp}.sql"
    print_success "Database backup created: backup_${timestamp}.sql"
}

# Show help
show_help() {
    echo "South Delhi Real Estate - Docker Development Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment with hot reload"
    echo "  prod         Start production environment"
    echo "  prod-nginx   Start production environment with Nginx proxy"
    echo "  build        Build Docker images"
    echo "  stop         Stop all services"
    echo "  clean        Remove all containers, images, and volumes"
    echo "  logs         Show logs from all services"
    echo "  status       Show status of containers, images, and volumes"
    echo "  db-shell     Connect to database shell"
    echo "  app-shell    Connect to application shell"
    echo "  backup-db    Create database backup"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev        # Start development environment"
    echo "  $0 prod       # Start production environment"
    echo "  $0 logs       # View real-time logs"
    echo "  $0 clean      # Clean up everything"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "dev")
            dev
            ;;
        "prod")
            prod
            ;;
        "prod-nginx")
            prod_nginx
            ;;
        "build")
            build
            ;;
        "stop")
            stop
            ;;
        "clean")
            clean
            ;;
        "logs")
            logs
            ;;
        "status")
            status
            ;;
        "db-shell")
            db_shell
            ;;
        "app-shell")
            app_shell
            ;;
        "backup-db")
            backup_db
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@" 