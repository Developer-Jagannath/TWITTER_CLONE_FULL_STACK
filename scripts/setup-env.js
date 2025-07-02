#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envTemplate = `# Server Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/twitter_clone"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for OTP and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# OTP Configuration
OTP_EXPIRES_IN=10m
OTP_LENGTH=6

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp

# API Configuration
API_PREFIX=/api
API_VERSION=v1
`;

const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('📝 Please update your .env file with the required values.');
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the following required values:');
  console.log('   - DATABASE_URL: Your PostgreSQL connection string');
  console.log('   - JWT_SECRET: A secure random string for JWT tokens');
  console.log('   - JWT_REFRESH_SECRET: Another secure random string for refresh tokens');
  console.log('   - EMAIL_USER & EMAIL_PASS: Your email credentials (optional)');
}

console.log('\n🔧 Next steps:');
console.log('1. Update the .env file with your actual values');
console.log('2. Run: npm run dev');
console.log('3. Test the API endpoints'); 