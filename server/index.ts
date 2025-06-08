// Load environment variables from .env file
import 'dotenv/config';

// Production-ready imports
import compression from 'compression';
import cors from 'cors';
import express from "express";
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { registerRoutes } from "./routes";
import sitemapRoutes from './sitemap';
import { storage } from './storage';
import { createLogger } from './utils/logger';
import { log, serveStatic, setupVite } from "./vite";

// Initialize logger
const logger = createLogger();

// Set a flag to identify we're using in-memory storage
(global as any).USE_IN_MEMORY_STORAGE = true;

// Create Express instance
const app = express();

// Trust proxy for production deployments (nginx, cloudflare, etc.)
app.set('trust proxy', 1);

// Basic middleware setup
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Security middleware
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "data:", "blob:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: [
        "'self'", 
        "https://api.cloudinary.com", 
        "https://res.cloudinary.com", 
        "https://overpass-api.de",
        // Allow WebSocket connections in development
        ...(isDevelopment ? [
          "ws://localhost:*",
          "ws://127.0.0.1:*", 
          "wss://localhost:*",
          "wss://127.0.0.1:*"
        ] : [])
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: isDevelopment ? null : []
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware for production
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting removed - no maximum login attempts

// HTTP request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// CORS configuration with proper origins
const nodeEnv = (process.env.NODE_ENV || 'development').trim();

// In production, use the allowed origins from env, otherwise be more permissive for development
const allowedOrigins = nodeEnv === 'production' 
  ? (process.env.ALLOWED_ORIGINS || 'http://localhost:7822,http://127.0.0.1:7822,http://localhost:5000,http://127.0.0.1:5000,https://southdelhirealty.com').split(',').filter(Boolean).map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:7822',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:7822',
      'https://southdelhirealty.com'
    ];

console.log(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin requests, mobile apps, curl requests)
    // This is safe when the server is serving both frontend and API
    if (!origin) {
      return callback(null, true);
    }
    
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}. Allowed origins: ${JSON.stringify(allowedOrigins)}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Session configuration with production-ready settings
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-secret-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    logger.error('SESSION_SECRET must be set in production!');
    process.exit(1);
  } else {
    logger.warn('Using default SESSION_SECRET in development');
  }
}

// Configure session middleware
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  name: 'southdelhi.session',
  proxy: true, // Trust the reverse proxy
  cookie: {
    secure: false, // Set to false for development
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax' as const // Required for Google OAuth
  }
};

// Adjust cookie settings based on environment
if (process.env.NODE_ENV === 'production' && process.env.SSL_ENABLED === 'true') {
  sessionConfig.cookie.secure = true;
  sessionConfig.cookie.sameSite = 'lax' as const; // Keep as 'lax' for OAuth
}

app.use(session(sessionConfig));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  const taxService = (global as any).taxService;
  const taxServiceStatus = process.env.NODE_ENV === 'production' 
    ? (taxService && !taxService.killed ? 'running' : 'stopped')
    : 'not_applicable_in_dev';

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      taxEmailService: {
        status: taxServiceStatus,
        port: process.env.TAX_EMAIL_SERVICE_PORT || '7824'
      }
    }
  });
});

// Readiness check (for Kubernetes/Docker)
app.get('/ready', async (req: any, res: any) => {
  try {
    // Check database connection using our storage layer
    await storage.getDashboardStats(); // Simple health check
    res.status(200).json({ status: 'Ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'Not Ready', error: 'Database connection failed' });
  }
});

// Metrics endpoint (basic)
app.get('/metrics', (req: any, res: any) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  };
  res.json(metrics);
});

// Request logging middleware for API routes
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Log errors to winston
      if (res.statusCode >= 400) {
        logger.error(`${req.method} ${path} ${res.statusCode} - ${req.ip} - ${duration}ms`);
      }
    }
  });

  next();
});

// SEO routes (sitemap and robots.txt) - before API routes
app.use('/', sitemapRoutes);

(async () => {
  try {
    const server = await registerRoutes(app);

    // Setup Vite in development or static files in production (after API routes)
    const env = (process.env.NODE_ENV || 'development').trim();
    console.log(`Environment check: "${env}"`);
    if (env === "development") {
      console.log("Using Vite development server");
      await setupVite(app, server);
    } else {
      console.log("Using static file serving");
      serveStatic(app);
    }

    // 404 handler for API routes
    app.use('/api/*', (req: any, res: any) => {
      res.status(404).json({ message: 'API endpoint not found' });
    });

    // Global error handler (must be last)
    app.use((err: any, req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Improved error logging
      logger.error('Unhandled error:', {
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name,
          ...err
        },
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers,
          ip: req.ip
        }
      });

      // Don't expose internal errors in production
      const responseMessage = process.env.NODE_ENV === 'production' && status === 500 
        ? 'Internal Server Error' 
        : message;

      res.status(status).json({ 
        message: responseMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      });
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      // Close tax service if running
      const taxService = (global as any).taxService;
      if (taxService && !taxService.killed) {
        logger.info('Stopping Tax Email Service...');
        taxService.kill('SIGTERM');
      }
      
      server.close(() => {
        logger.info('HTTP server closed.');
        logger.info('Application shutdown complete.');
        process.exit(0);
      });

      // Force close server after 30s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        // Force kill tax service if still running
        if (taxService && !taxService.killed) {
          taxService.kill('SIGKILL');
        }
        process.exit(1);
      }, 30000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Initialize superadmin user in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const { initializeSuperAdmin } = await import('./init-superadmin');
        await initializeSuperAdmin();
      } catch (error) {
        logger.warn('Superadmin initialization failed:', error instanceof Error ? error.message : String(error));
        // Don't exit, just log the warning
      }

      // Initialize Tax Email Service in production
      try {
        const { spawn } = await import('child_process');
        const path = await import('path');
        
        const taxServicePath = path.join(process.cwd(), 'services', 'tax-email-service.js');
        
        const taxService = spawn('node', [taxServicePath], {
          stdio: ['inherit', 'pipe', 'pipe'],
          cwd: process.cwd(),
          detached: false
        });

        // Log tax service stdout
        taxService.stdout?.on('data', (data) => {
          const message = data.toString().trim();
          if (message) {
            logger.info(`[Tax Service] ${message}`);
          }
        });

        // Log tax service stderr
        taxService.stderr?.on('data', (data) => {
          const message = data.toString().trim();
          if (message) {
            logger.error(`[Tax Service Error] ${message}`);
          }
        });

        taxService.on('error', (error) => {
          logger.error('Failed to start Tax Email Service:', error);
        });

        taxService.on('close', (code) => {
          if (code !== 0) {
            logger.warn(`Tax Email Service exited with code ${code}`);
          } else {
            logger.info('Tax Email Service stopped gracefully');
          }
        });

        // Store reference for cleanup
        (global as any).taxService = taxService;

        logger.info('🚀 Tax Email Service started automatically in production mode');
        logger.info(`📧 Tax Service running on port ${process.env.TAX_EMAIL_SERVICE_PORT || '7824'}`);
        
      } catch (error) {
        logger.warn('Tax Email Service initialization failed:', error instanceof Error ? error.message : String(error));
        // Don't exit, just log the warning
      }
    }

    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 South Delhi Real Estate server starting...`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Server running on port ${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      if (process.env.NODE_ENV === 'production') {
        logger.info(`👤 Default superadmin credentials: superadmin / superadmin123`);
      }
      log(`serving on port ${port}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
})();
