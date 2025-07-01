import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorResponse, ErrorType } from '../types/errors';
import { config } from '../config';

// Error response formatter
export const formatErrorResponse = (
  error: AppError | Error,
  req: Request
): ErrorResponse => {
  const isAppError = error instanceof AppError;
  
  return {
    success: false,
    error: {
      message: isAppError ? error.message : 'Internal server error',
      code: isAppError ? error.type : ErrorType.INTERNAL_SERVER_ERROR,
      statusCode: isAppError ? error.statusCode : 500,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      ...(isAppError && error.details && { details: error.details }),
      ...(config.nodeEnv === 'development' && !isAppError && { 
        details: { stack: error.stack } 
      })
    }
  };
};

// Centralized error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Format error response
  const errorResponse = formatErrorResponse(error, req);
  
  // Send response
  res.status(errorResponse.error.statusCode).json(errorResponse);
};

// Async error wrapper for route handlers
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: ErrorType.NOT_FOUND_ERROR,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };
  
  res.status(404).json(errorResponse);
};

// Validation error handler
export const handleValidationError = (error: any): AppError => {
  const message = 'Validation failed';
  const details = {
    field: error.path,
    value: error.value,
    constraint: error.type
  };
  
  return new (require('../errors/AppError').ValidationError)(message, details);
};

// Database error handler
export const handleDatabaseError = (error: any): AppError => {
  if (error.code === '23505') { // Unique constraint violation
    return new (require('../errors/AppError').ConflictError)(
      'Resource already exists',
      { field: error.detail }
    );
  }
  
  if (error.code === '23503') { // Foreign key violation
    return new (require('../errors/AppError').BadRequestError)(
      'Referenced resource does not exist',
      { field: error.detail }
    );
  }
  
  return new (require('../errors/AppError').DatabaseError)(
    'Database operation failed',
    { code: error.code, detail: error.detail }
  );
}; 