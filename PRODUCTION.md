# South Delhi Real Estate - Production Deployment Guide

## 🚀 Production Readiness Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ database
- [ ] Cloudinary account for media storage
- [ ] SSL certificates (Let's Encrypt recommended)
- [ ] Domain name configured
- [ ] Server with at least 2GB RAM

## 📋 Environment Configuration

Create a `.env` file with the following production values:

```bash
# PRODUCTION ENVIRONMENT CONFIGURATION
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Security - CHANGE THESE VALUES!
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=southdelhirealestate
DB_USER=your_db_user
DB_PASSWORD=your_secure_db_password

# Cloudinary Configuration (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client Configuration
CLIENT_URL=https://yourdomain.com
```

## 🔧 Installation & Build

```bash
# 1. Install dependencies
npm install

# 2. Build the application
npm run build

# 3. Start with PM2 (recommended)
npm run pm2:start

# OR start directly
npm run start:prod
```

## 🐳 Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build -t south-delhi-real-estate .
docker run -p 5000:5000 --env-file .env south-delhi-real-estate
```

## 🔐 Security Features Implemented

### ✅ Security Headers
- Helmet.js for security headers
- Content Security Policy (CSP)
- XSS protection
- CSRF protection via session

### ✅ Rate Limiting
- Global rate limit: 100 requests/15 minutes
- Auth rate limit: 5 attempts/15 minutes
- Configurable limits per environment

### ✅ Data Protection
- Input validation with Zod
- SQL injection prevention with Drizzle ORM
- File upload restrictions
- Session security

## 📊 Monitoring & Logging

### Health Checks
- `/health` - Application health status
- `/ready` - Database connectivity check
- `/metrics` - Basic application metrics

### Logging
- Structured JSON logging with Winston
- Separate log files for errors, access, and combined logs
- Log rotation (5MB max, 10 files retained)
- Console logging in development

### PM2 Monitoring
```bash
# View logs
npm run pm2:logs

# Monitor processes
pm2 monit

# Restart application
npm run pm2:restart
```

## 🗄️ Database Setup

```sql
-- Create production database
CREATE DATABASE southdelhirealestate;

-- Create dedicated user (recommended)
CREATE USER 'sdre_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON southdelhirealestate.* TO 'sdre_user'@'localhost';
FLUSH PRIVILEGES;

-- Run migrations
npm run init-db
```

## 🌐 Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📈 Performance Optimizations

### ✅ Implemented
- Gzip compression for responses
- Static file caching headers
- Database connection pooling
- Response time optimization
- Memory usage monitoring

### 🔧 Recommended Additional
- CDN setup (Cloudflare/AWS CloudFront)
- Database indexing optimization
- Image optimization and WebP conversion
- Database query optimization
- Redis session storage (optional)

## 🚨 Monitoring & Alerts

### Application Monitoring
```bash
# Check application status
curl -f http://localhost:5000/health

# Monitor PM2 processes
pm2 status
pm2 monit
```

### Log Monitoring
```bash
# Watch error logs
tail -f logs/error.log

# Watch access logs
tail -f logs/access.log

# PM2 logs
pm2 logs south-delhi-real-estate
```

## 🔄 Backup Strategy

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p southdelhirealestate > backup_$DATE.sql
gzip backup_$DATE.sql

# Keep only last 30 days of backups
find . -name "backup_*.sql.gz" -mtime +30 -delete
```

### Application Backup
- Code: Git repository
- Media files: Cloudinary (automatic)
- Configuration: Include .env in secure backup
- Logs: Automated log rotation

## 🔧 Maintenance Commands

```bash
# Update dependencies
npm update

# Rebuild application
npm run build

# Restart services
npm run pm2:restart

# View application status
npm run pm2:status

# Health check
npm run health-check
```

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Kill existing processes with `pm2 delete all`
2. **Database connection failed**: Check DB credentials and connectivity
3. **Cloudinary upload fails**: Verify API credentials
4. **SSL certificate issues**: Check certificate paths and permissions

### Debug Mode
```bash
LOG_LEVEL=debug npm run start:prod
```

## 📊 Performance Benchmarks

Target metrics for production:
- Response time: < 200ms (average)
- Uptime: > 99.5%
- Memory usage: < 512MB per instance
- CPU usage: < 70% under normal load

## 🔐 Security Checklist

- [ ] Changed default session secret
- [ ] Database user with limited privileges
- [ ] SSL certificates installed and configured
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] Regular security updates applied
- [ ] Environment variables secured
- [ ] Backup encryption enabled
- [ ] CORS origins properly configured
- [ ] Rate limiting configured
- [ ] Security headers enabled

## 📞 Support

For production issues:
1. Check health endpoints
2. Review application logs
3. Monitor database performance
4. Verify external service connectivity (Cloudinary)
5. Contact system administrator if infrastructure issues persist 