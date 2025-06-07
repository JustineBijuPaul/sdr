#!/usr/bin/env node

/**
 * South Delhi Real Estate - Production Readiness Verification Script
 * This script verifies that the application is ready for production deployment
 */

import fs from 'fs';
import path from 'path';

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const color = colors[level] || colors.reset;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(exists ? 'green' : 'red', `${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkDirectoryExists(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  log(exists ? 'green' : 'red', `${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
  return exists;
}

function checkPackageJson() {
  const packagePath = 'package.json';
  if (!checkFileExists(packagePath, 'Package.json')) return false;
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check required scripts
    const requiredScripts = [
      'build', 'build:client', 'build:server', 'start', 'start:prod',
      'pm2:start', 'health-check', 'security:audit'
    ];
    
    let scriptsOk = true;
    requiredScripts.forEach(script => {
      const exists = packageJson.scripts && packageJson.scripts[script];
      log(exists ? 'green' : 'red', `${exists ? '✅' : '❌'} Script "${script}" defined`);
      if (!exists) scriptsOk = false;
    });
    
    // Check Node.js version requirement
    const nodeVersion = packageJson.engines?.node;
    log(nodeVersion ? 'green' : 'yellow', 
        `${nodeVersion ? '✅' : '⚠️'} Node.js version requirement: ${nodeVersion || 'not specified'}`);
    
    return scriptsOk;
  } catch (error) {
    log('red', `❌ Error reading package.json: ${error.message}`);
    return false;
  }
}

function checkEnvironmentFiles() {
  let allGood = true;
  
  // Check production environment template
  const prodEnvExists = checkFileExists('.env.production', 'Production environment template');
  allGood = allGood && prodEnvExists;
  
  // Check if .env exists and warn if it's using defaults
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    
    // Check for placeholder values that need to be updated
    const placeholders = [
      'your-production-db-host',
      'CHANGE_THIS_TO_A_STRONG_RANDOM_STRING',
      'yourdomain.com',
      'your-production-google-client-id'
    ];
    
    const hasPlaceholders = placeholders.some(placeholder => 
      envContent.includes(placeholder)
    );
    
    if (hasPlaceholders) {
      log('yellow', '⚠️ Environment file contains placeholder values - update before production');
    } else {
      log('green', '✅ Environment file appears to be configured');
    }
  } else {
    log('yellow', '⚠️ No .env file found - copy .env.production to .env and configure');
  }
  
  return allGood;
}

function checkDockerFiles() {
  let allGood = true;
  
  allGood = allGood && checkFileExists('Dockerfile', 'Docker production build file');
  allGood = allGood && checkFileExists('docker-compose.production.yml', 'Docker Compose production config');
  allGood = allGood && checkFileExists('nginx/nginx.conf', 'Nginx configuration');
  allGood = allGood && checkFileExists('monitoring/prometheus.yml', 'Prometheus monitoring config');
  
  return allGood;
}

function checkScripts() {
  let allGood = true;
  
  allGood = allGood && checkFileExists('scripts/production-setup.sh', 'Server setup script');
  allGood = allGood && checkFileExists('ecosystem.config.cjs', 'PM2 ecosystem configuration');
  
  return allGood;
}

function checkDocumentation() {
  let allGood = true;
  
  allGood = allGood && checkFileExists('DEPLOYMENT.md', 'Deployment guide');
  allGood = allGood && checkFileExists('SECURITY.md', 'Security guide');
  allGood = allGood && checkFileExists('PRODUCTION-ANALYSIS.md', 'Production analysis');
  allGood = allGood && checkFileExists('README.md', 'README documentation');
  
  return allGood;
}

function checkBuildFiles() {
  let allGood = true;
  
  // Check if build directory exists (after running npm run build)
  const distExists = checkDirectoryExists('dist', 'Build output directory');
  
  if (distExists) {
    checkDirectoryExists('dist/public', 'Client build output');
    checkFileExists('dist/public/index.html', 'Client HTML file');
    
    // Check for server build files
    const serverFiles = fs.readdirSync('dist').filter(file => 
      file.endsWith('.js') || fs.statSync(path.join('dist', file)).isDirectory()
    );
    
    if (serverFiles.length > 0) {
      log('green', '✅ Server build files present');
    } else {
      log('yellow', '⚠️ Server build files not found - run npm run build');
    }
  } else {
    log('yellow', '⚠️ Build output not found - run npm run build first');
  }
  
  return allGood;
}

function checkDependencies() {
  const nodeModulesExists = checkDirectoryExists('node_modules', 'Node modules');
  
  if (nodeModulesExists) {
    // Check for key production dependencies
    const keyDeps = [
      'express', 'drizzle-orm', 'mysql2', 'passport', 'helmet', 
      'compression', 'winston', 'pm2', 'cloudinary'
    ];
    
    let allFound = true;
    keyDeps.forEach(dep => {
      const exists = fs.existsSync(path.join('node_modules', dep));
      log(exists ? 'green' : 'red', `${exists ? '✅' : '❌'} Dependency: ${dep}`);
      if (!exists) allFound = false;
    });
    
    return allFound;
  }
  
  return false;
}

function checkDirectoryStructure() {
  let allGood = true;
  
  // Check required directories
  const requiredDirs = [
    'client', 'server', 'shared', 'logs', 'nginx', 'monitoring', 'scripts'
  ];
  
  requiredDirs.forEach(dir => {
    allGood = allGood && checkDirectoryExists(dir, `Required directory: ${dir}`);
  });
  
  return allGood;
}

function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log(colors.bold + colors.blue + '📊 PRODUCTION READINESS REPORT' + colors.reset);
  console.log('='.repeat(60));
  
  const categories = Object.keys(results);
  const totalChecks = categories.length;
  const passedChecks = categories.filter(cat => results[cat]).length;
  const score = Math.round((passedChecks / totalChecks) * 100);
  
  console.log(`\n${colors.bold}Overall Score: ${score}/100${colors.reset}`);
  
  categories.forEach(category => {
    const status = results[category] ? '✅ PASS' : '❌ FAIL';
    const color = results[category] ? colors.green : colors.red;
    console.log(`${color}${status}${colors.reset} ${category}`);
  });
  
  console.log('\n' + '='.repeat(60));
  
  if (score >= 90) {
    log('green', '🎉 EXCELLENT! Application is production-ready');
  } else if (score >= 75) {
    log('yellow', '⚠️ GOOD: Minor issues to address before production');
  } else {
    log('red', '❌ CRITICAL: Major issues must be resolved before production');
  }
  
  console.log('\n' + colors.blue + 'Next Steps:' + colors.reset);
  console.log('1. Address any failed checks above');
  console.log('2. Update .env with production values');
  console.log('3. Run: npm run build');
  console.log('4. Choose deployment method from DEPLOYMENT.md');
  console.log('5. Follow security checklist in SECURITY.md');
  
  return score;
}

async function main() {
  console.log(colors.bold + colors.blue + '🔍 South Delhi Real Estate - Production Readiness Check' + colors.reset);
  console.log('Starting verification...\n');
  
  const results = {
    'Package Configuration': checkPackageJson(),
    'Environment Files': checkEnvironmentFiles(),
    'Docker Configuration': checkDockerFiles(),
    'Scripts & Automation': checkScripts(),
    'Documentation': checkDocumentation(),
    'Dependencies': checkDependencies(),
    'Directory Structure': checkDirectoryStructure(),
    'Build Output': checkBuildFiles()
  };
  
  const score = generateReport(results);
  
  // Exit with appropriate code
  process.exit(score >= 75 ? 0 : 1);
}

// Run the verification
main().catch(error => {
  log('red', `❌ Verification failed: ${error.message}`);
  process.exit(1);
}); 