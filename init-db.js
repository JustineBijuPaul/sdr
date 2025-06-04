import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// XAMPP MySQL configuration
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  multipleStatements: true
};

const DB_NAME = 'southdelhirealestate';

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

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function testConnection() {
  try {
    logInfo('Testing connection to XAMPP MySQL...');
    const connection = await mysql.createConnection(DB_CONFIG);
    await connection.ping();
    await connection.end();
    logSuccess('Connected to XAMPP MySQL successfully');
    return true;
  } catch (error) {
    logError('Failed to connect to XAMPP MySQL');
    logError('Please make sure XAMPP is running and MySQL service is started');
    logError(`Error: ${error.message}`);
    return false;
  }
}

async function createDatabase() {
  try {
    logInfo(`Creating database '${DB_NAME}'...`);
    const connection = await mysql.createConnection(DB_CONFIG);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    logSuccess(`Database '${DB_NAME}' created successfully`);
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Failed to create database: ${error.message}`);
    return false;
  }
}

async function importSchema() {
  try {
    logInfo('Importing database schema...');
    
    // Check if backup file exists
    const backupFile = path.join(process.cwd(), 'mysql_backup.sql');
    if (!fs.existsSync(backupFile)) {
      logError('mysql_backup.sql file not found!');
      logError('Please ensure mysql_backup.sql exists in the project root directory');
      return false;
    }
    
    // Read SQL file
    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    
    // Connect and execute SQL
    const connection = await mysql.createConnection({
      ...DB_CONFIG,
      database: DB_NAME
    });
    
    // Split SQL content by statements and execute
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (error) {
          // Log warning for non-critical errors (like table already exists)
          if (!error.message.includes('already exists')) {
            logWarning(`Warning executing statement: ${error.message}`);
          }
        }
      }
    }
    
    await connection.end();
    logSuccess('Database schema imported successfully');
    return true;
  } catch (error) {
    logError(`Failed to import schema: ${error.message}`);
    return false;
  }
}

async function verifySetup() {
  try {
    logInfo('Verifying database setup...');
    
    const connection = await mysql.createConnection({
      ...DB_CONFIG,
      database: DB_NAME
    });
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      logError('No tables found in database!');
      await connection.end();
      return false;
    }
    
    logSuccess('Database verification completed');
    logInfo('Tables created:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check if users table has data
    try {
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      const userCount = users[0].count;
      logInfo(`Users in database: ${userCount}`);
    } catch (error) {
      logWarning('Could not count users (table might be empty)');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    logError(`Failed to verify setup: ${error.message}`);
    return false;
  }
}

function createEnvFile() {
  try {
    logInfo('Creating/updating .env file...');
    
    // Backup existing .env if it exists
    if (fs.existsSync('.env')) {
      fs.copyFileSync('.env', '.env.backup');
      logWarning('Existing .env file backed up as .env.backup');
    }
    
    const envContent = `# Database Configuration for XAMPP MySQL
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
SESSION_SECRET=your_super_secret_session_key_here_${Math.random().toString(36).substring(2)}

# Server Configuration
PORT=5000
NODE_ENV=development
`;
    
    fs.writeFileSync('.env', envContent);
    logSuccess('.env file created successfully');
    logWarning('Please update Cloudinary credentials in .env file');
    return true;
  } catch (error) {
    logError(`Failed to create .env file: ${error.message}`);
    return false;
  }
}

function showConnectionInfo() {
  console.log('\n' + '='.repeat(50));
  logSuccess('🎉 Database initialization completed successfully!');
  console.log('='.repeat(50));
  
  logInfo('Database connection details:');
  console.log(`  Host: localhost`);
  console.log(`  Port: 3306`);
  console.log(`  User: root`);
  console.log(`  Database: ${DB_NAME}`);
  console.log(`  phpMyAdmin: http://localhost/phpmyadmin`);
  
  console.log('\n📋 Next steps:');
  console.log('  1. Install Node.js dependencies: npm install');
  console.log('  2. Update Cloudinary credentials in .env file');
  console.log('  3. Start the development server: npm run dev');
  console.log('  4. Access phpMyAdmin: http://localhost/phpmyadmin');
  console.log('');
}

async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('  South Delhi Real Estate - Database Setup');
  console.log('='.repeat(50) + '\n');
  
  try {
    // Step 1: Test connection
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }
    
    // Step 2: Create database
    const dbCreated = await createDatabase();
    if (!dbCreated) {
      process.exit(1);
    }
    
    // Step 3: Import schema
    const schemaImported = await importSchema();
    if (!schemaImported) {
      process.exit(1);
    }
    
    // Step 4: Verify setup
    const verified = await verifySetup();
    if (!verified) {
      process.exit(1);
    }
    
    // Step 5: Create .env file
    createEnvFile();
    
    // Step 6: Show completion info
    showConnectionInfo();
    
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logError(`Unhandled promise rejection: ${error.message}`);
  process.exit(1);
});

// Run the main function
main(); 