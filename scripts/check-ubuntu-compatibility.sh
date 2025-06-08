#!/bin/bash

# Ubuntu Compatibility Check Script for South Delhi Real Estate
# This script checks if the Ubuntu system meets the requirements

echo "🔍 Checking Ubuntu system compatibility..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Function to print colored output
print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASS++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAIL++))
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARN++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check Ubuntu version
check_ubuntu_version() {
    print_info "Checking Ubuntu version..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "ubuntu" ]]; then
            VERSION_NUM=$(echo $VERSION_ID | cut -d. -f1)
            if [ "$VERSION_NUM" -ge 20 ]; then
                print_pass "Ubuntu $VERSION_ID detected (supported)"
            elif [ "$VERSION_NUM" -ge 18 ]; then
                print_warn "Ubuntu $VERSION_ID detected (older version, may work but 20.04+ recommended)"
            else
                print_fail "Ubuntu $VERSION_ID detected (too old, 20.04+ required)"
            fi
        else
            print_fail "Not running Ubuntu (detected: $ID $VERSION_ID)"
        fi
    else
        print_fail "Cannot determine OS version"
    fi
}

# Check system resources
check_system_resources() {
    print_info "Checking system resources..."
    
    # Check RAM
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$RAM_GB" -ge 2 ]; then
        print_pass "RAM: ${RAM_GB}GB (sufficient)"
    elif [ "$RAM_GB" -ge 1 ]; then
        print_warn "RAM: ${RAM_GB}GB (minimum, 2GB+ recommended)"
    else
        print_fail "RAM: ${RAM_GB}GB (insufficient, 2GB minimum required)"
    fi
    
    # Check disk space
    DISK_GB=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$DISK_GB" -ge 20 ]; then
        print_pass "Disk space: ${DISK_GB}GB available (sufficient)"
    elif [ "$DISK_GB" -ge 10 ]; then
        print_warn "Disk space: ${DISK_GB}GB available (low, 20GB+ recommended)"
    else
        print_fail "Disk space: ${DISK_GB}GB available (insufficient, 20GB minimum required)"
    fi
    
    # Check CPU cores
    CPU_CORES=$(nproc)
    if [ "$CPU_CORES" -ge 2 ]; then
        print_pass "CPU cores: $CPU_CORES (good for production)"
    else
        print_warn "CPU cores: $CPU_CORES (single core, may impact performance)"
    fi
}

# Check privileges
check_privileges() {
    print_info "Checking user privileges..."
    
    if [ "$EUID" -eq 0 ]; then
        print_pass "Running as root (can install packages)"
    elif groups $USER | grep -q '\bsudo\b'; then
        print_pass "User has sudo privileges"
    else
        print_fail "User lacks sudo privileges (required for installation)"
    fi
}

# Check internet connectivity
check_internet() {
    print_info "Checking internet connectivity..."
    
    if ping -c 1 8.8.8.8 &> /dev/null; then
        print_pass "Internet connectivity available"
    else
        print_fail "No internet connectivity (required for package installation)"
    fi
    
    # Check specific repositories
    if curl -s http://deb.nodesource.com &> /dev/null; then
        print_pass "NodeSource repository accessible"
    else
        print_warn "NodeSource repository not accessible (may affect Node.js installation)"
    fi
}

# Check if ports are available
check_ports() {
    print_info "Checking port availability..."
    
    PORTS=("80" "443" "3306" "5000" "7822")
    
    for port in "${PORTS[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_warn "Port $port is already in use"
        else
            print_pass "Port $port is available"
        fi
    done
}

# Check existing software
check_existing_software() {
    print_info "Checking for existing software..."
    
    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_pass "Node.js $NODE_VERSION installed (compatible)"
        else
            print_warn "Node.js $NODE_VERSION installed (old version, will be updated)"
        fi
    else
        print_info "Node.js not installed (will be installed)"
    fi
    
    # MySQL
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version | awk '{print $3}' | cut -d',' -f1)
        print_pass "MySQL $MYSQL_VERSION installed"
    else
        print_info "MySQL not installed (will be installed)"
    fi
    
    # Nginx
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1 | awk '{print $3}' | cut -d'/' -f2)
        print_pass "Nginx $NGINX_VERSION installed"
    else
        print_info "Nginx not installed (will be installed)"
    fi
    
    # PM2
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        print_pass "PM2 $PM2_VERSION installed"
    else
        print_info "PM2 not installed (will be installed)"
    fi
}

# Check security tools
check_security() {
    print_info "Checking security configuration..."
    
    # UFW
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(ufw status | head -1 | awk '{print $2}')
        if [ "$UFW_STATUS" == "active" ]; then
            print_pass "UFW firewall is active"
        else
            print_warn "UFW firewall is inactive"
        fi
    else
        print_info "UFW not installed (will be installed)"
    fi
    
    # Fail2Ban
    if command -v fail2ban-client &> /dev/null; then
        print_pass "Fail2Ban is installed"
    else
        print_info "Fail2Ban not installed (will be installed)"
    fi
    
    # Check for automatic updates
    if [ -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
        print_pass "Automatic security updates configured"
    else
        print_warn "Automatic security updates not configured"
    fi
}

# Main compatibility check
main() {
    echo "=================================================="
    echo "   South Delhi Real Estate - Ubuntu Compatibility"
    echo "=================================================="
    echo
    
    check_ubuntu_version
    echo
    check_system_resources
    echo
    check_privileges
    echo
    check_internet
    echo
    check_ports
    echo
    check_existing_software
    echo
    check_security
    echo
    
    echo "=================================================="
    echo "               Compatibility Summary"
    echo "=================================================="
    echo -e "${GREEN}Passed:${NC} $PASS checks"
    echo -e "${YELLOW}Warnings:${NC} $WARN checks"
    echo -e "${RED}Failed:${NC} $FAIL checks"
    echo
    
    if [ $FAIL -eq 0 ]; then
        if [ $WARN -eq 0 ]; then
            echo -e "${GREEN}✅ System is fully compatible!${NC}"
            echo "You can proceed with deployment using:"
            echo "  sudo npm run deploy-ubuntu"
        else
            echo -e "${YELLOW}⚠️  System is compatible with warnings.${NC}"
            echo "Review the warnings above before proceeding."
            echo "You can still deploy using:"
            echo "  sudo npm run deploy-ubuntu"
        fi
    else
        echo -e "${RED}❌ System compatibility issues detected.${NC}"
        echo "Please fix the failed checks before deployment."
        echo
        echo "Common fixes:"
        echo "  - Upgrade Ubuntu: sudo apt update && sudo apt upgrade"
        echo "  - Add sudo privileges: usermod -aG sudo username"
        echo "  - Free up disk space: sudo apt autoremove && sudo apt autoclean"
        echo "  - Check internet connection and DNS settings"
    fi
    
    echo
    echo "For detailed deployment instructions, see:"
    echo "  README-UBUNTU.md"
    
    exit $FAIL
}

# Run the check
main 