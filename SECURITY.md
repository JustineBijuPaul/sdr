# Security Guide - South Delhi Real Estate

## Security Overview

This document outlines the security measures implemented in the South Delhi Real Estate application and provides guidelines for maintaining security in production.

## Security Features Implemented

### 1. Authentication & Authorization
- **Passport.js** with multiple strategies (Local, Google OAuth)
- **Session-based authentication** with secure session management
- **Password hashing** using bcrypt with salt rounds
- **JWT tokens** for API authentication
- **Rate limiting** on authentication endpoints

### 2. Input Validation & Sanitization
- **Zod schemas** for input validation
- **Express validator** for additional validation
- **SQL injection prevention** via Drizzle ORM parameterized queries
- **XSS protection** through output encoding

### 3. Network Security
- **HTTPS enforcement** in production
- **CORS configuration** with strict origin policies
- **Helmet.js** for security headers
- **Rate limiting** on API endpoints
- **Nginx reverse proxy** with security configurations

### 4. Data Protection
- **Environment variable encryption** for sensitive data
- **Session secret encryption**
- **Database connection encryption**
- **File upload validation** and size limits
- **Cloudinary secure image handling**

### 5. Application Security
- **Content Security Policy (CSP)**
- **HSTS headers** for HTTPS enforcement
- **X-Frame-Options** to prevent clickjacking
- **X-Content-Type-Options** to prevent MIME sniffing
- **Secure cookie configurations**

## Security Configuration

### Environment Variables Security

**Critical:** Never commit sensitive environment variables to version control.

```bash
# Generate secure session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Database credentials
DB_PASSWORD=$(openssl rand -base64 16)

# API keys (example format)
CLOUDINARY_API_SECRET=your-secure-api-secret
```

### HTTPS Configuration

```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private-key.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
}
```

### Database Security

```sql
-- Create dedicated application user
CREATE USER 'app_user'@'%' IDENTIFIED BY 'secure_random_password';

-- Grant minimum required permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON southdelhirealestate.* TO 'app_user'@'%';

-- Enable SSL for database connections
REQUIRE SSL;
```

## Security Best Practices

### 1. Authentication Security

#### Password Policy
- Minimum 8 characters
- Must include uppercase, lowercase, numbers
- bcrypt with salt rounds ≥ 12
- Account lockout after failed attempts

#### Session Management
```javascript
session({
  secret: process.env.SESSION_SECRET, // 32+ byte random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'   // CSRF protection
  }
})
```

### 2. API Security

#### Rate Limiting Configuration
```javascript
// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // requests per window
  message: 'Too many requests'
});

// Strict auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // attempts per window
  skipSuccessfulRequests: true
});
```

#### Input Validation
```javascript
// Example Zod schema
const propertySchema = z.object({
  title: z.string().min(1).max(200),
  price: z.number().positive(),
  description: z.string().max(5000),
  location: z.string().min(1).max(100)
});
```

### 3. File Upload Security

#### Cloudinary Configuration
```javascript
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  upload_preset: 'secure_preset'
};

// File validation
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};
```

### 4. Database Security

#### Connection Security
```javascript
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};
```

#### Query Security
```javascript
// Using Drizzle ORM (prevents SQL injection)
const properties = await db
  .select()
  .from(propertiesTable)
  .where(eq(propertiesTable.id, propertyId));
```

## Security Monitoring

### 1. Logging Security Events

```javascript
// Security event logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn'
    })
  ]
});

// Log failed login attempts
securityLogger.warn('Failed login attempt', {
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString()
});
```

### 2. Health Monitoring

```javascript
// Security health checks
app.get('/security-status', (req, res) => {
  const securityStatus = {
    httpsEnabled: req.secure,
    sessionSecure: req.sessionOptions?.cookie?.secure,
    corsConfigured: true,
    rateLimitActive: true,
    timestamp: new Date().toISOString()
  };
  res.json(securityStatus);
});
```

## Vulnerability Management

### 1. Dependency Security

```bash
# Regular security audits
npm audit --audit-level=moderate

# Automated security fixes
npm audit fix

# Check for known vulnerabilities
npm install -g retire
retire --js --path .
```

### 2. Security Headers

```javascript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Incident Response

### 1. Security Incident Detection

Monitor these indicators:
- Unusual login patterns
- High error rates
- Suspicious API requests
- Database access anomalies
- File system changes

### 2. Response Procedures

1. **Immediate Response**
   - Isolate affected systems
   - Preserve logs and evidence
   - Notify security team

2. **Investigation**
   - Analyze logs and patterns
   - Identify attack vectors
   - Assess damage scope

3. **Recovery**
   - Patch vulnerabilities
   - Update compromised credentials
   - Restore from clean backups

4. **Post-Incident**
   - Document lessons learned
   - Update security measures
   - Conduct security review

## Compliance & Standards

### 1. Data Protection
- **GDPR compliance** for EU users
- **Data encryption** at rest and in transit
- **Right to be forgotten** implementation
- **Data retention policies**

### 2. Security Standards
- **OWASP Top 10** mitigation
- **Node.js security best practices**
- **Express.js security guidelines**
- **Database security standards**

## Security Checklist

### Pre-Deployment Security Audit

- [ ] All default passwords changed
- [ ] Environment variables secured
- [ ] SSL certificates installed and valid
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] File upload restrictions active
- [ ] Database access restricted
- [ ] Logging configured
- [ ] Backup strategy implemented
- [ ] Incident response plan ready

### Regular Security Maintenance

#### Weekly
- [ ] Review security logs
- [ ] Check for failed login attempts
- [ ] Verify SSL certificate status
- [ ] Monitor error rates

#### Monthly
- [ ] Run npm audit
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Security training updates

#### Quarterly
- [ ] Penetration testing
- [ ] Security policy review
- [ ] Access control audit
- [ ] Incident response drill
- [ ] Third-party security assessment

## Emergency Contacts

### Security Incident Response
- **Primary Contact**: [Your Security Team]
- **Secondary Contact**: [Backup Security Contact]
- **Hosting Provider**: [Support Contact]
- **Domain Registrar**: [Support Contact]

### Critical Security Commands

```bash
# Emergency application shutdown
pm2 stop all

# Emergency database shutdown
sudo systemctl stop mysql

# Emergency web server shutdown
sudo systemctl stop nginx

# Check active connections
netstat -tulpn | grep LISTEN

# Review recent logins
last -n 20

# Check for suspicious processes
ps aux | grep -E "(nc|netcat|nmap)"
```

## Resources

- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Handbook](https://nodejs.org/en/docs/guides/security/)
- [npm Security Guidelines](https://docs.npmjs.com/security)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential for maintaining a secure application. 