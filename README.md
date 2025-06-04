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
- ✅ Secure authentication with Passport.js
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

## 📋 Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Security
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

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

# Application URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

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
- **CSP-compliant**: Proper security headers for media delivery

## 📊 API Endpoints

### Public Endpoints
```
GET  /api/properties              # Get properties with filtering
GET  /api/properties/:slug        # Get property by slug
GET  /api/featured-properties     # Get featured properties
POST /api/inquiries               # Submit inquiry
GET  /api/property-types          # Get property type options
GET  /api/properties/:id/nearby-facilities  # Get nearby facilities
```

### Protected Endpoints (Admin)
```
GET    /api/admin/dashboard       # Admin dashboard stats
GET    /api/admin/properties      # Manage properties
POST   /api/admin/properties      # Create property
PUT    /api/admin/properties/:id  # Update property
DELETE /api/admin/properties/:id  # Delete property
POST   /api/admin/media/upload-watermarked  # Upload with watermark
DELETE /api/admin/media/:id       # Delete media item
GET    /api/admin/inquiries       # Manage inquiries
```

### Webhook Endpoints
```
POST /api/webhooks/cloudinary     # Cloudinary async processing notifications
```

### Monitoring Endpoints
```
GET /health                       # Application health check
GET /ready                        # Database readiness check
GET /metrics                      # Basic metrics
```

## 🔧 Development Commands

```bash
# Development
npm run dev                       # Start development server (client + server)
npm run dev:client               # Start Vite dev server only
npm run dev:server               # Start Express server only

# Building
npm run build                    # Build for production (client + server)
npm run build:client             # Build client only
npm run build:server             # Build server only

# Production
npm run start                    # Start production server
npm run start:prod               # Start with NODE_ENV=production

# Process Management
npm run pm2:start                # Start with PM2
npm run pm2:stop                 # Stop PM2 processes
npm run pm2:restart              # Restart PM2 processes
npm run pm2:reload               # Reload PM2 processes
npm run pm2:delete               # Delete PM2 processes
npm run pm2:logs                 # View PM2 logs
npm run pm2:status               # Check PM2 status

# Database
npm run init-db                  # Initialize database with sample data
npm run init-xampp               # Initialize with XAMPP MySQL

# Utilities
npm run health-check             # Check application health
npm run lint                     # Run ESLint
npm run test                     # Run tests (placeholder)
```

## 🗄️ Database Schema

### Core Tables
```sql
users                    # User accounts and roles
├── id (Primary Key)
├── username (Unique)
├── email (Unique)
├── password (Hashed)
├── role (superadmin/admin/staff)
└── timestamps

properties               # Property listings
├── id (Primary Key)
├── title
├── slug (SEO-friendly URL)
├── description
├── status (sale/rent)
├── category (residential/commercial)
├── propertyType
├── price
├── area & specifications
├── location data
└── timestamps

property_media           # Property images and videos
├── id (Primary Key)
├── propertyId (Foreign Key)
├── mediaType (image/video)
├── cloudinaryId
├── cloudinaryUrl
├── isFeatured
├── orderIndex
├── processingStatus
└── timestamps

nearby_facilities        # Location-based amenities
├── id (Primary Key)
├── propertyId (Foreign Key)
├── facilityName
├── distance
├── facilityType
└── timestamps

inquiries               # Customer inquiries
├── id (Primary Key)
├── propertyId (Foreign Key)
├── name, email, phone
├── message
├── status (new/contacted/resolved)
└── timestamps
```

### Key Features
- **Foreign key constraints** with cascade deletion
- **Indexed columns** for optimal query performance
- **Automated timestamps** for audit trails
- **Type safety** with Drizzle ORM schema validation

## 🔐 Security Features

### Authentication & Authorization
- ✅ **Secure session management** with express-session
- ✅ **Role-based access control** (SuperAdmin, Admin, Staff)
- ✅ **Password hashing** with bcrypt
- ✅ **Session-based authentication** with Passport.js

### Security Headers & Protection
- ✅ **Helmet.js security headers**
- ✅ **Content Security Policy (CSP)** for media and scripts
- ✅ **XSS protection** with input sanitization
- ✅ **Clickjacking protection** with frame guards
- ✅ **CORS configuration** for controlled access

### Rate Limiting & DDoS Protection
- ✅ **Global rate limiting** (100 requests/15 minutes)
- ✅ **Auth rate limiting** (5 attempts/15 minutes)  
- ✅ **Configurable limits** per environment
- ✅ **IP-based tracking** with memory store

### Data Protection
- ✅ **Input validation** with Zod schemas
- ✅ **SQL injection prevention** with parameterized queries
- ✅ **File upload restrictions** with type and size validation
- ✅ **Environment variable protection** with dotenv

## 📈 Performance & Monitoring

### Health Checks & Monitoring
```bash
# Application health
curl http://localhost:5000/health

# Database connectivity  
curl http://localhost:5000/ready

# Basic application metrics
curl http://localhost:5000/metrics

# PM2 process monitoring
pm2 monit

# Detailed logs
pm2 logs south-delhi-real-estate --lines 100
```

### Log Files (Production)
```
logs/
├── error.log            # Error-level logs
├── access.log           # HTTP access logs  
├── combined.log         # All logs combined
└── pm2-*.log           # PM2 process logs
```

### Performance Optimizations
- ✅ **React Query caching** with automatic invalidation
- ✅ **Gzip compression** for responses
- ✅ **Cloudinary CDN** for media delivery
- ✅ **Database indexing** for fast queries
- ✅ **Connection pooling** with mysql2
- ✅ **Asset bundling** with Vite

## 🚨 Troubleshooting

### Common Issues & Solutions

**Port Already in Use (EADDRINUSE)**
```bash
# Method 1: Kill specific port
lsof -ti:5000 | xargs kill

# Method 2: Kill all PM2 processes
pm2 delete all

# Method 3: Kill all node processes
pkill -f node
```

**Database Connection Failed**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Test database connection
mysql -u your_user -p -e "SELECT 1"

# Reset MySQL password if needed
sudo mysql -u root -p
ALTER USER 'your_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

**Cloudinary Upload Issues**
```bash
# Verify environment variables
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY

# Test API connectivity
curl "https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/image/upload" \
  -X POST \
  -F "upload_preset=unsigned_preset" \
  -F "file=@test_image.jpg"
```

**React Query Cache Issues**
```bash
# Clear browser cache and reload
# Check network tab for failed API calls
# Verify cache invalidation in removeMedia function
```

### Debug Mode
```bash
# Enable verbose logging
LOG_LEVEL=debug npm run start:prod

# Monitor specific component logs  
DEBUG=property-form npm run dev

# View real-time PM2 logs
pm2 logs south-delhi-real-estate --follow
```

## 🎯 Key Features Implemented

### ✅ Media Management Revolution
- **Universal watermarking** for brand consistency
- **Fixed-size gallery** for professional appearance  
- **Async video processing** for large files
- **Real-time cache updates** across all pages
- **CSP compliance** for security

### ✅ Advanced Property Features
- **Interactive maps** with nearby facilities auto-discovery
- **Privacy protection** with 2km location generalization
- **SEO optimization** with dynamic slugs
- **Mobile-responsive** design throughout

### ✅ Production-Ready Infrastructure
- **PM2 process management** with monitoring
- **Comprehensive logging** with Winston
- **Health check endpoints** for monitoring
- **Rate limiting** for abuse prevention
- **Security headers** for protection

## 📞 Support & Maintenance

### Getting Help
1. **Check application health**: `curl http://localhost:5000/health`
2. **Review error logs**: `pm2 logs south-delhi-real-estate --lines 50`
3. **Test database**: `mysql -u user -p -e "SELECT COUNT(*) FROM properties"`
4. **Verify Cloudinary**: Check dashboard at cloudinary.com

### Backup & Recovery
```bash
# Database backup
mysqldump -u user -p southdelhirealestate > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u user -p southdelhirealestate < backup_file.sql

# Environment backup
cp .env .env.backup.$(date +%Y%m%d)
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server  │    │     MySQL DB    │
│                 │    │                  │    │                 │
│ • Modern UI     │◄──►│ • REST API       │◄──►│ • Properties    │
│ • React Query   │    │ • Authentication │    │ • Users         │
│ • Type Safety   │    │ • Media Upload   │    │ • Media         │
│ • Responsive    │    │ • Watermarking   │    │ • Inquiries     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │   Cloudinary    │             │
         │              │                 │             │
         └──────────────►│ • Media Storage │◄────────────┘
                        │ • Watermarking  │
                        │ • CDN Delivery  │
                        └─────────────────┘
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React team** for the amazing framework and ecosystem
- **Express.js** for the robust and flexible server framework  
- **Drizzle team** for the excellent type-safe ORM
- **Cloudinary** for powerful media management and transformation
- **Radix UI** for accessible component primitives
- **All open-source contributors** who make projects like this possible

---

**Built with ❤️ for South Delhi Real Estate**

*A modern, secure, and scalable real estate management solution with cutting-edge media handling and user experience.* 