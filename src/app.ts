import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { exampleRouter } from './routes/example';
import { authRouter } from './routes/auth';
import userRouter from './routes/user';
import tweetRouter from './routes/tweet';
import imageUploadRouter from './routes/imageUpload';
import path from 'path';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin || '*',
  credentials: true
}));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('🌐 Incoming request:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    params: req.params,
    query: req.query
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0'
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the TypeScript Node.js API',
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// Debug endpoint to check registered routes
app.get('/api/debug/routes', (req: Request, res: Response) => {
  const routes: any[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      routes.push({
        type: 'router',
        regexp: middleware.regexp.toString()
      });
    }
  });
  res.json({ routes });
});

// Test endpoint to see if basic routing works
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Basic routing is working!' });
});

// Example routes with error handling
app.use('/api/example', exampleRouter);

// Authentication routes
app.use('/api/auth', authRouter);

// User routes (follow/unfollow, profiles)
app.use('/api/user', userRouter);

// Tweet routes
app.use('/api/tweet', tweetRouter);

// Note: Images are now served from AWS S3, not local storage

// Image upload routes
app.use('/api/uploads', imageUploadRouter);
console.log('✅ Image upload routes registered at /api/uploads');

// Test route to verify uploads path
app.get('/api/uploads/test-simple', (req, res) => {
  res.json({ message: 'Simple uploads route is working!' });
});

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export { app }; 