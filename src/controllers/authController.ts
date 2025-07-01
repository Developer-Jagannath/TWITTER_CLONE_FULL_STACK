import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  verifyOTPSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema 
} from '../validations/authValidation';
import { ValidationError } from '../errors/AppError';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  // Helper function to handle validation errors
  private static handleValidationError(error: any): never {
    if (error && error.details && error.details.length > 0) {
      const detail = error.details[0];
      const details: any = {};
      
      if (detail.path && detail.path.length > 0) {
        details.field = detail.path[0] as string;
      }
      if (detail.context?.value !== undefined) {
        details.value = detail.context.value;
      }
      if (detail.type) {
        details.constraint = detail.type;
      }
      
      throw new ValidationError(detail.message, details);
    }
    throw new ValidationError('Validation failed');
  }

  // Register new user
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    const result = await AuthService.register(value);
    res.status(201).json(result);
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    const result = await AuthService.login(value);
    res.status(200).json(result);
  });

  // Forgot password
  static forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    const result = await AuthService.forgotPassword(value);
    res.status(200).json(result);
  });

  // Verify OTP
  static verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    // This endpoint just verifies OTP without resetting password
    // You might want to implement this differently based on your flow
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  });

  // Reset password
  static resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    const result = await AuthService.resetPassword(value);
    res.status(200).json(result);
  });

  // Refresh token
  static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    const result = await AuthService.refreshToken(value);
    res.status(200).json(result);
  });

  // Logout
  static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const { error, value } = logoutSchema.validate(req.body);
    if (error) {
      this.handleValidationError(error);
    }

    const result = await AuthService.logout(value);
    res.status(200).json(result);
  });

  // Get current user
  static getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // User should be attached by auth middleware
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const result = await AuthService.getCurrentUser(userId);
    res.status(200).json(result);
  });

  // Logout all devices
  static logoutAllDevices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    // This would revoke all refresh tokens for the user
    // Implementation depends on your requirements
    res.status(200).json({
      success: true,
      message: 'Logged out from all devices'
    });
  });

  // Check token validity
  static checkToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new ValidationError('Token required');
    }

    // Verify token
    const user = await AuthService.verifyTokenAndGetUser(token);
    res.status(200).json({
      success: true,
      data: { user }
    });
  });
} 