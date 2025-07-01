import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticationError } from '../errors/AppError';
import { AuthenticatedRequest, UserWithoutPassword } from '../types/auth';

// Extract token from authorization header
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify token and get user
    const user = await AuthService.verifyTokenAndGetUser(token);
    
    // Attach user and token to request
    (req as any).user = user;
    (req as any).token = token;
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      // Verify token and get user
      const user = await AuthService.verifyTokenAndGetUser(token);
      
      // Attach user and token to request
      (req as any).user = user;
      (req as any).token = token;
    }
    
    next();
  } catch (error) {
    // Don't throw error, just continue without user
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    // For now, we'll use a simple role check
    // You can extend this based on your role system
    const userRole = (user as any).role || 'user';
    
    if (!roles.includes(userRole)) {
      next(new AuthenticationError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Admin authorization middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  requireRole(['admin'])(req, res, next);
};

// User authorization middleware (user can only access their own data)
export const requireOwnership = (paramName: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    const requestedUserId = (req as any).params[paramName];
    
    if (user.id !== requestedUserId) {
      next(new AuthenticationError('Access denied'));
      return;
    }

    next();
  };
};

// Rate limiting middleware (basic implementation)
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      // Increment count
      userRequests.count++;
      
      if (userRequests.count > maxRequests) {
        next(new AuthenticationError('Rate limit exceeded'));
        return;
      }
    }
    
    next();
  };
};

// Token refresh middleware
export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.headers['x-refresh-token'] as string;
    
    if (!refreshToken) {
      next();
      return;
    }

    // Verify refresh token and get new access token
    const result = await AuthService.refreshToken({ refreshToken });
    
    // Set new tokens in response headers
    res.setHeader('X-New-Access-Token', result.data.accessToken);
    res.setHeader('X-New-Refresh-Token', result.data.refreshToken);
    
    next();
  } catch (error) {
    // Don't throw error, just continue without new tokens
    next();
  }
};

// Logout middleware (revoke all tokens for user)
export const logoutAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    // Revoke all refresh tokens for the user
    // This would be implemented in the AuthService
    // For now, we'll just continue
    next();
  } catch (error) {
    next(new AuthenticationError('Logout failed'));
  }
}; 