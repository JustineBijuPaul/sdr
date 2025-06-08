#!/usr/bin/env node

// Production starter script for PM2
// This script directly loads the TypeScript server with tsx

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Starting South Delhi Real Estate server in production mode...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT}`);

// Register tsx and import the server
try {
  // Import tsx to handle TypeScript files
  await import('tsx/esm');
  
  // Import the main server file
  await import('./server/index.ts');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
} 