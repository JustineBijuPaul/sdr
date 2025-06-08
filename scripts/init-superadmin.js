import crypto from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Password hashing function (matches server/auth.ts)
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Use PBKDF2 for hashing
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      // Format: iterations:salt:hash
      resolve(`10000:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

// Get database configuration
function getDbConfig() {
  // Try to use DATABASE_URL first (production)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) // Remove leading slash
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'southdelhirealestate'
  };
}

async function initializeSuperAdmin() {
  let connection;
  
  try {
    log('🚀 Initializing superadmin user...', 'blue');
    
    const dbConfig = getDbConfig();
    log(`📊 Connecting to database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`, 'yellow');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    
    // Check if any superadmin users exist
    const [existingSuperAdmins] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['superadmin']
    );
    
    const superAdminCount = existingSuperAdmins[0].count;
    
    if (superAdminCount > 0) {
      log(`✅ Found ${superAdminCount} existing superadmin user(s). Skipping initialization.`, 'green');
      return;
    }
    
    log('📝 No superadmin users found. Creating default superadmin...', 'yellow');
    
    // Check if username 'superadmin' already exists
    const [existingUsers] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      ['superadmin']
    );
    
    if (existingUsers[0].count > 0) {
      log('⚠️ Username "superadmin" already exists but with different role. Skipping creation.', 'yellow');
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword('superadmin123');
    
    // Create the superadmin user
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      ['superadmin', 'superadmin@southdelhirealty.com', hashedPassword, 'superadmin']
    );
    
    log('✅ Default superadmin user created successfully!', 'green');
    log('📋 Credentials:', 'blue');
    log('   Username: superadmin', 'reset');
    log('   Password: superadmin123', 'reset');
    log('   Email: superadmin@southdelhirealty.com', 'reset');
    log('   Role: superadmin', 'reset');
    log('⚠️  Please change the password after first login!', 'yellow');
    
  } catch (error) {
    log(`❌ Error initializing superadmin: ${error.message}`, 'red');
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
if (import.meta.url.endsWith(process.argv[1]) || import.meta.url.endsWith('init-superadmin.js')) {
  initializeSuperAdmin()
    .then(() => {
      log('🎉 Superadmin initialization completed!', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`💥 Superadmin initialization failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

export { initializeSuperAdmin };

