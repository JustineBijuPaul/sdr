# South Delhi Real Estate 🏠

A modern, full-stack real estate management system with advanced media handling, watermarking, and comprehensive property management features.

## ✨ Latest Features & Updates

### 🎨 Enhanced Media Management
- ✅ **Universal Watermarking**: Automatic "SOUTH DELHI REALTY" branding on ALL images and videos
- ✅ **Modern Gallery Format**: Fixed-size media viewer with responsive thumbnail grid
- ✅ **Large Video Support**: Handles videos up to 100MB with async processing for watermarking
- ✅ **Real-time Cache Invalidation**: Instant updates across admin and public pages
- ✅ **Content Security Policy**: Proper CSP configuration for Cloudinary media
- ✅ **Background Processing**: Large video watermarking processes asynchronously

### 🏢 Property Management
- ✅ Create, edit, and delete property listings
- ✅ Multiple property types (apartments, houses, villas, commercial)
- ✅ Rich media upload with Cloudinary integration and watermarking
- ✅ Advanced filtering and search capabilities
- ✅ SEO-friendly URLs with slugs
- ✅ Interactive maps with nearby facilities
- ✅ Privacy-protected contact details

### 👥 User Management
- ✅ Role-based access control (SuperAdmin, Admin, Staff)
- ✅ Secure authentication with Passport.js and Google OAuth
- ✅ Session management with express-session
- ✅ Staff management tools

### 📊 Admin Dashboard
- ✅ Real-time analytics and statistics
- ✅ Property management interface
- ✅ Inquiry management system
- ✅ Media upload with watermarking status
- ✅ Instant cache updates

### 🔒 Security & Performance
- ✅ Rate limiting and DDoS protection
- ✅ Security headers with Helmet.js
- ✅ Input validation and sanitization
- ✅ Gzip compression
- ✅ Production-ready logging with Winston
- ✅ Health checks and monitoring endpoints

## 🚀 Quick Start

### Development Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd SouthDelhiRealEstate

# Install dependencies
npm install

# Setup environment variables
cp .env.backup .env
# Edit .env with your configuration

# Initialize database
npm run init-db

# Start development server
npm run dev
```

### Production Deployment
```bash
# Install dependencies
npm install --production

# Build the application
npm run build

# Start with PM2 (recommended)
npm run pm2:start

# Or start directly
npm run start:prod
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching, caching, and real-time updates
- **React Hook Form** - Form management with validation
- **Leaflet** - Interactive maps for property locations
- **Zod** - Runtime type validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database ORM
- **MySQL** - Relational database
- **Passport.js** - Authentication middleware
- **Winston** - Comprehensive logging
- **Cloudinary** - Media storage with transformation APIs

### Production Features
- **PM2** - Process management and monitoring
- **Helmet.js** - Security headers and CSP
- **Rate limiting** - DDoS protection
- **Compression** - Response optimization
- **CORS** - Cross-origin resource sharing
- **Express Session** - Secure session management

## 📋 Environment Configuration

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=7822
LOG_LEVEL=info

# Security
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
ALLOWED_ORIGINS=http://localhost:7822,https://yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=southdelhirealestate
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Cloudinary Configuration (Required for Media)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=South Delhi Realty

# Google OAuth (Optional but recommended for admin access)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application URLs
CLIENT_URL=http://localhost:7822
SERVER_URL=http://localhost:7822
```

## 👤 Default Admin Access

### Automatic Superadmin Creation

In production mode, a default superadmin user is automatically created:

- **Username**: `superadmin`
- **Password**: `superadmin123`
- **Email**: `superadmin@southdelhirealty.com`
- **Role**: `superadmin`

⚠️ **Security**: Change these credentials immediately after first login!

### Manual Initialization

You can also manually initialize the superadmin user:

```bash
# Using npm script
npm run init-superadmin

# Using Node.js directly
node scripts/init-superadmin.js
```

### Security Features

- **Password Hashing**: Uses PBKDF2 with SHA-512 (same as application auth)
- **Collision Detection**: Won't overwrite existing users
- **Role Validation**: Only creates users with superadmin role
- **Production Only**: Automatic initialization only runs in production

### First Login Steps

1. Navigate to `/auth` or `/admin`
2. Use the default credentials above
3. **Immediately** go to Staff Management and:
   - Change the superadmin password
   - Create additional admin/staff users
   - Consider disabling the default superadmin account

## 🎨 Media & Watermarking Features

### Universal Watermarking
- **All media files** (images AND videos) automatically receive "SOUTH DELHI REALTY" watermark
- **Dual watermark positioning**: Bottom-right with white text and shadow for visibility
- **Async processing**: Large videos (>20MB) process watermarks in background
- **Real-time status**: UI shows processing status for ongoing watermark operations

### Gallery Format
- **Fixed-size media viewer**: Consistent 400px height for main display
- **Responsive thumbnails**: 95px fixed height in clean grid layout
- **Mixed media support**: Images and videos seamlessly integrated
- **Lightbox functionality**: Full-screen viewing with navigation controls

### File Support & Limits
- **Images**: JPG, PNG, GIF, WebP (up to 100MB)
- **Videos**: MP4, MOV, AVI, MKV, WebM (up to 100MB)
- **Automatic optimization**: Cloudinary handles format conversion and compression

## 🐧 Ubuntu Server Deployment

### Quick Ubuntu Deployment

#### Option 1: Automated Full Deployment
```bash
# Download and run the complete deployment script
curl -sSL https://raw.githubusercontent.com/your-repo/main/scripts/deploy-ubuntu.sh | sudo bash
```

#### Option 2: Using NPM Scripts
```bash
# Full automated Ubuntu deployment
sudo npm run deploy-ubuntu

# Or database setup only
sudo npm run init-ubuntu

# Check Ubuntu compatibility
npm run check-ubuntu
```

### Manual Ubuntu Setup

#### System Requirements
- Ubuntu 20.04 LTS or 22.04 LTS
- Minimum 2GB RAM, 20GB storage
- Root or sudo access
- Internet connection

#### Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git build-essential

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2 tsx

# Install MySQL
sudo apt install -y mysql-server mysql-client

# Install Nginx
sudo apt install -y nginx

# Install additional tools
sudo apt install -y htop fail2ban ufw certbot python3-certbot-nginx
```

#### Database Setup
```bash
# Clone your repository
git clone https://github.com/your-repo/south-delhi-real-estate.git
cd south-delhi-real-estate

# Run Ubuntu MySQL setup
sudo npm run init-ubuntu
```

#### Application Setup
```bash
# Install dependencies
npm install --production

# Copy environment template
cp .env.ubuntu .env

# Edit environment file
nano .env
# Update database credentials, Cloudinary, email settings, etc.

# Build application
npm run build

# Start with PM2
npm run pm2:start
```

### Nginx Configuration

#### Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/south-delhi-realty
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:7822;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://127.0.0.1:7822;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    client_max_body_size 100M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/south-delhi-realty /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Ubuntu Environment Configuration

Copy `.env.ubuntu` to `.env` and configure:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=southdelhirealestate

# Security
SESSION_SECRET=your-secure-32-character-secret

# Domain Configuration
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Cloudinary (Required for media)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Generate Secure Session Secret:
```bash
openssl rand -base64 32
```

## 🐳 Docker Deployment

### Prerequisites

- **Docker Engine** (20.10 or later)
- **Docker Compose** (2.0 or later)
- **Git** (for cloning the repository)
- **4GB RAM** minimum (8GB recommended)
- **10GB free disk space**

### Quick Docker Start

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd SouthDelhiRealEstate
chmod +x scripts/docker-dev.sh
```

#### 2. Configure Environment
```bash
# Copy the Docker environment template
cp .env.docker .env.docker.local

# Edit with your configuration
nano .env.docker.local
```

**Required Configuration:**
```bash
# Update these with your actual values
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Generate a secure session secret
SESSION_SECRET=your-super-secure-random-string-here
```

#### 3. Start Environment
```bash
# Development environment with hot reload
./scripts/docker-dev.sh dev

# Basic production setup
./scripts/docker-dev.sh prod

# Production with Nginx proxy (recommended)
./scripts/docker-dev.sh prod-nginx
```

### Docker Architecture

#### Container Services

| Service | Purpose | Port | Health Check |
|---------|---------|------|--------------|
| **app** | Main application (Node.js + React) | 7822 | ✅ `/api/health` |
| **mysql** | Database (MySQL 8.0) | 3306 | ✅ mysqladmin ping |
| **redis** | Cache & sessions (Redis 7) | 6379 | ✅ redis-cli ping |
| **nginx** | Reverse proxy (production only) | 80, 443 | ✅ HTTP check |

#### Data Persistence

| Volume | Purpose | Location |
|--------|---------|----------|
| `mysql_data` | Database storage | `/var/lib/mysql` |
| `redis_data` | Cache storage | `/data` |
| `app_uploads` | File uploads | `/app/uploads` |
| `app_logs` | Application logs | `/app/logs` |

### Docker Development Workflow

#### Using the Helper Script

```bash
# Start development environment with hot reload
./scripts/docker-dev.sh dev

# View real-time logs
./scripts/docker-dev.sh logs

# Check container status
./scripts/docker-dev.sh status

# Access application shell
./scripts/docker-dev.sh app-shell

# Access database shell
./scripts/docker-dev.sh db-shell

# Create database backup
./scripts/docker-dev.sh backup-db

# Stop all services
./scripts/docker-dev.sh stop

# Clean up everything (⚠️ destructive)
./scripts/docker-dev.sh clean
```

#### Manual Docker Commands

```bash
# Build images
docker-compose build --no-cache

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Execute commands in running container
docker-compose exec app npm run build
docker-compose exec mysql mysql -u root -p

# Scale services (if needed)
docker-compose up -d --scale app=2

# Stop and remove everything
docker-compose down -v
```

## 🔧 Service Management

### PM2 Commands
```bash
# Application management
pm2 status                    # Check status
pm2 restart south-delhi-real-estate
pm2 stop south-delhi-real-estate
pm2 logs south-delhi-real-estate
pm2 monit                     # Real-time monitoring

# PM2 startup configuration
pm2 startup                   # Generate startup script
pm2 save                      # Save current process list
```

### Health Monitoring

#### Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health` | Basic health check | Service status |
| `/ready` | Readiness probe | Database connectivity |
| `/metrics` | Basic metrics | Memory, uptime, etc. |

## 📊 Performance & Security

### Monitoring Features
- **Real-time performance metrics** via PM2
- **Application health checks** for load balancers
- **Database connection monitoring**
- **Memory and CPU usage tracking**
- **Error logging and aggregation**

### Security Features
- **Rate limiting** to prevent DDoS attacks
- **Security headers** (HSTS, CSP, X-Frame-Options)
- **Input validation** and sanitization
- **SQL injection prevention** via Drizzle ORM
- **CSRF protection** with secure sessions
- **File upload restrictions** and validation

### Performance Optimizations
- **Gzip compression** for all responses
- **Static asset caching** with proper headers
- **Database query optimization** with indexes
- **Image optimization** via Cloudinary
- **Lazy loading** for large property lists
- **Connection pooling** for database

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database credentials
mysql -u root -p

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

#### PM2 Issues
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart south-delhi-real-estate

# Check logs
pm2 logs --lines 50
```

#### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx
```

#### Docker Issues
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs app

# Rebuild containers
docker-compose up --build
```

### Log Locations

- **Application Logs**: `/var/log/south-delhi-realty/`
- **Nginx Logs**: `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`
- **PM2 Logs**: `~/.pm2/logs/`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Property Endpoints
- `GET /api/properties` - List properties (with filtering)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (admin only)
- `PUT /api/properties/:id` - Update property (admin only)
- `DELETE /api/properties/:id` - Delete property (admin only)

### Media Endpoints
- `POST /api/upload` - Upload media files
- `GET /api/media/:id` - Get media details
- `DELETE /api/media/:id` - Delete media (admin only)

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@southdelhirealty.com or create an issue in the repository.

---

**Happy Real Estate Management! 🏡** 