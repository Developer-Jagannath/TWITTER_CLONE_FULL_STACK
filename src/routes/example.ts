import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  ValidationError, 
  NotFoundError, 
  BadRequestError,
  AuthenticationError 
} from '../errors/AppError';
import { validateRequest } from '../utils/errorUtils';

const router = Router();

// Example route with validation error
router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  // Validate required fields
  validateRequest(req, ['name', 'email']);
  
  // Simulate validation error
  if (req.body.email && !req.body.email.includes('@')) {
    throw new ValidationError('Invalid email format', {
      field: 'email',
      value: req.body.email,
      constraint: 'must be valid email'
    });
  }
  
  res.json({
    success: true,
    message: 'Validation passed',
    data: req.body
  });
}));

// Example route with not found error
router.get('/user/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id;
  
  // Simulate user not found
  if (userId === '999') {
    throw new NotFoundError('User', { id: userId });
  }
  
  res.json({
    success: true,
    data: {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
}));

// Example route with authentication error
router.get('/protected', asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  
  if (!token) {
    throw new AuthenticationError('No authorization token provided');
  }
  
  if (token !== 'Bearer valid-token') {
    throw new AuthenticationError('Invalid token', { token: 'invalid' });
  }
  
  res.json({
    success: true,
    message: 'Access granted to protected resource'
  });
}));

// Example route with bad request error
router.post('/data', asyncHandler(async (req: Request, res: Response) => {
  const { limit } = req.body;
  
  if (limit && (limit < 1 || limit > 100)) {
    throw new BadRequestError('Limit must be between 1 and 100', {
      field: 'limit',
      value: limit,
      constraint: '1 <= limit <= 100'
    });
  }
  
  res.json({
    success: true,
    message: 'Data processed successfully',
    limit: limit || 10
  });
}));

// Example route that throws a generic error
router.get('/error', asyncHandler(async (req: Request, res: Response) => {
  // This will be caught by the global error handler
  throw new Error('This is a generic error');
}));

export { router as exampleRouter }; 