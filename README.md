# South Delhi Real Estate 🏠

A modern, production-ready real estate management system built with React, Node.js, Express, and MySQL.

## ✨ Features

### 🏢 Property Management
- ✅ Create, edit, and delete property listings
- ✅ Multiple property types (apartments, houses, commercial)
- ✅ Rich media upload with Cloudinary integration
- ✅ Advanced filtering and search capabilities
- ✅ SEO-friendly URLs with slugs

### 👥 User Management
- ✅ Role-based access control (SuperAdmin, Admin, Staff)
- ✅ Secure authentication with Passport.js
- ✅ Session management with express-session

### 📊 Admin Dashboard
- ✅ Real-time analytics and statistics
- ✅ Property management interface
- ✅ Inquiry management system
- ✅ Staff management tools

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
cp .env.example .env
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
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Leaflet** - Interactive maps

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database ORM
- **MySQL** - Relational database
- **Passport.js** - Authentication middleware
- **Winston** - Logging library

### Production Features
- **PM2** - Process management
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **Helmet.js** - Security headers
- **Rate limiting** - DDoS protection
- **Compression** - Response optimization

## 📋 Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Security
SESSION_SECRET=your-secure-session-secret
ALLOWED_ORIGINS=https://yourdomain.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=southdelhirealestate
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client
CLIENT_URL=https://yourdomain.com
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build image
docker build -t south-delhi-real-estate .

# Run container
docker run -p 5000:5000 --env-file .env south-delhi-real-estate
```

## 📊 API Endpoints

### Public Endpoints
```
GET  /api/properties          # Get properties with filtering
GET  /api/properties/:slug    # Get property by slug
GET  /api/featured-properties # Get featured properties
POST /api/inquiries           # Submit inquiry
GET  /api/property-types      # Get property type options
```

### Protected Endpoints (Admin)
```
GET    /api/admin/dashboard   # Admin dashboard stats
GET    /api/admin/properties  # Manage properties
POST   /api/admin/properties  # Create property
PUT    /api/admin/properties/:id # Update property
DELETE /api/admin/properties/:id # Delete property
POST   /api/admin/media/upload   # Upload media
```

### Monitoring Endpoints
```
GET /health                   # Application health check
GET /ready                    # Database readiness check
GET /metrics                  # Basic metrics
```

## 🔧 Development Commands

```bash
# Development
npm run dev                   # Start development server
npm run dev:client           # Start Vite dev server only
npm run dev:server           # Start Express server only

# Building
npm run build                # Build for production
npm run build:client         # Build client only
npm run build:server         # Build server only

# Production
npm run start                # Start production server
npm run start:prod           # Start with NODE_ENV=production

# Process Management
npm run pm2:start            # Start with PM2
npm run pm2:stop             # Stop PM2 processes
npm run pm2:restart          # Restart PM2 processes
npm run pm2:logs             # View PM2 logs

# Utilities
npm run init-db              # Initialize database
npm run health-check         # Check application health
```

## 📈 Performance Monitoring

### Health Checks
- Application health: `GET /health`
- Database connectivity: `GET /ready`
- Basic metrics: `GET /metrics`

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View detailed logs
pm2 logs south-delhi-real-estate

# Check process status
pm2 status
```

### Log Files (Production)
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`
- Combined logs: `logs/combined.log`
- PM2 logs: `logs/pm2-*.log`

## 🔐 Security Features

### Authentication & Authorization
- ✅ Secure session management
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ CSRF protection

### Security Headers
- ✅ Helmet.js security headers
- ✅ Content Security Policy (CSP)
- ✅ XSS protection
- ✅ Clickjacking protection

### Rate Limiting
- ✅ Global rate limiting (100 req/15min)
- ✅ Auth rate limiting (5 attempts/15min)
- ✅ Configurable limits per environment

### Data Protection
- ✅ Input validation with Zod
- ✅ SQL injection prevention
- ✅ File upload restrictions
- ✅ CORS configuration

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and roles
- `properties` - Property listings
- `property_media` - Property images and videos
- `nearby_facilities` - Location-based amenities
- `inquiries` - Customer inquiries

### Key Features
- Foreign key constraints
- Cascade deletions
- Indexed columns for performance
- Automated timestamps

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill all PM2 processes
pm2 delete all

# Or kill specific process
lsof -ti:5000 | xargs kill
```

**Database Connection Failed**
```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

**Cloudinary Upload Issues**
- Verify API credentials in `.env`
- Check network connectivity
- Ensure file size limits

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run start:prod

# View detailed PM2 logs
pm2 logs south-delhi-real-estate --lines 100
```

## 📞 Support & Contributing

### Getting Help
1. Check the [Production Guide](./PRODUCTION.md)
2. Review application logs
3. Test health endpoints
4. Check database connectivity

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust server framework
- Drizzle team for the excellent ORM
- Cloudinary for media management
- All open-source contributors

---

**Built with ❤️ for South Delhi Real Estate**

For detailed production deployment instructions, see [PRODUCTION.md](./PRODUCTION.md) 