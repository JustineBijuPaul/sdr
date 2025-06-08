module.exports = {
  apps: [
    {
      name: 'south-delhi-real-estate',
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 7822
      },
      env_file: './.env',
      env_production: {
        NODE_ENV: 'production',
        PORT: 7822
      },
      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: process.env.PM2_MEMORY_LIMIT || '1G',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist', 'client'],
      
      // Advanced features
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 8000,
      
      // Health check
      health_check_grace_period: 3000
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/south-delhi-real-estate.git',
      path: '/var/www/south-delhi-real-estate',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'https://github.com/your-username/south-delhi-real-estate.git',
      path: '/var/www/south-delhi-real-estate-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
}; 