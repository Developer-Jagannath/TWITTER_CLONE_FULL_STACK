import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, BadRequestError } from '../errors/AppError';
import { ErrorDetails } from '../types/errors';

// Type-safe error throwing utilities
export const throwValidationError = (message: string, details?: ErrorDetails): never => {
  throw new ValidationError(message, details);
};

export const throwNotFoundError = (resource: string, details?: ErrorDetails): never => {
  throw new NotFoundError(resource, details);
};

export const throwBadRequestError = (message: string, details?: ErrorDetails): never => {
  throw new BadRequestError(message, details);
};

// Type-safe error checking utilities
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

// Safe error handling wrapper
export const safeExecute = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }
    throw new AppError(errorMessage, 'INTERNAL_SERVER_ERROR' as any);
  }
};

// Request validation utility
export const validateRequest = (
  req: Request,
  requiredFields: string[]
): void => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!req.body[field] && req.body[field] !== 0) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throwValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { fields: missingFields }
    );
  }
};

// Type-safe error response helper
export const createErrorResponse = (
  message: string,
  code: string,
  statusCode: number,
  details?: ErrorDetails
) => ({
  success: false as const,
  error: {
    message,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  }
});

// Error logging utility with type safety
export const logError = (
  error: Error | AppError,
  context?: Record<string, any>
): void => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    ...(isAppError(error) && {
      type: error.type,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details
    }),
    ...context
  };
  
  console.error('Error logged:', errorInfo);
};

// Async route wrapper with better typing
export const asyncRoute = <T extends Request, U extends Response>(
  handler: (req: T, res: U, next: NextFunction) => Promise<void>
) => {
  return async (req: T, res: U, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}; 