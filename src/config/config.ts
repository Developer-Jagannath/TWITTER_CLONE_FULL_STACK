import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Server Configuration
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  
  // Database Configuration
  databaseUrl: string;
  
  // JWT Configuration
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  
  // Email Configuration
  emailHost: string;
  emailPort: number;
  emailUser: string;
  emailPass: string;
  emailFrom: string;
  
  // OTP Configuration
  otpExpiresIn: string;
  otpLength: number;
  
  // Security Configuration
  bcryptRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  
  // Logging Configuration
  logLevel: string;
  logFile: string;
  
  // File Upload Configuration
  maxFileSize: number;
  uploadPath: string;
  allowedImageTypes: string[];
  
  // API Configuration
  apiPrefix: string;
  apiVersion: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: Config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Database Configuration
  databaseUrl: process.env.DATABASE_URL!,
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Email Configuration
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || '',
  
  // OTP Configuration
  otpExpiresIn: process.env.OTP_EXPIRES_IN || '10m',
  otpLength: parseInt(process.env.OTP_LENGTH || '6', 10),
  
  // Security Configuration
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  
  // File Upload Configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  uploadPath: process.env.UPLOAD_PATH || 'uploads',
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  
  // API Configuration
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1'
}; 