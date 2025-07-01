import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { exampleRouter } from './routes/example';
import { authRouter } from './routes/auth';
import userRouter from './routes/user';
// import tweetRouter from './routes/tweet';

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

// Example routes with error handling
app.use('/api/example', exampleRouter);

// Authentication routes
app.use('/api/auth', authRouter);

// User routes (follow/unfollow, profiles)
app.use('/api/user', userRouter);

// Tweet routes - TEMPORARILY DISABLED
// app.use('/api/tweet', tweetRouter);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export { app }; 