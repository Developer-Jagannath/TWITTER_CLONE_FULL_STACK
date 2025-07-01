import { ErrorType, HTTP_STATUS_CODES, ErrorDetails } from '../types/errors';

// Base application error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: ErrorDetails | undefined;

  constructor(
    message: string,
    type: ErrorType,
    statusCode?: number,
    details?: ErrorDetails,
    isOperational = true
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode || HTTP_STATUS_CODES[type];
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, ErrorType.VALIDATION_ERROR, undefined, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: ErrorDetails) {
    super(message, ErrorType.AUTHENTICATION_ERROR, undefined, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: ErrorDetails) {
    super(message, ErrorType.AUTHORIZATION_ERROR, undefined, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, details?: ErrorDetails) {
    super(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, undefined, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, ErrorType.CONFLICT_ERROR, undefined, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, ErrorType.BAD_REQUEST_ERROR, undefined, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: ErrorDetails) {
    super(message, ErrorType.RATE_LIMIT_ERROR, undefined, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, ErrorType.DATABASE_ERROR, undefined, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, details?: ErrorDetails) {
    super(`${service} service is unavailable`, ErrorType.EXTERNAL_SERVICE_ERROR, undefined, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: ErrorDetails) {
    super(message, ErrorType.INTERNAL_SERVER_ERROR, undefined, details);
  }
} 