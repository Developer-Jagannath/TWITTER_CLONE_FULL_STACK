import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { JWTService } from './jwtService';
import { OTPService } from './otpService';
import { EmailService } from './emailService';
import { 
  RegisterRequest, 
  LoginRequest, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  LogoutRequest,
  AuthResponse,
  TokenResponse,
  UserResponse,
  MessageResponse,
  UserWithoutPassword
} from '../types/auth';
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError, 
  ConflictError,
  BadRequestError 
} from '../errors/AppError';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  // Register new user
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new ConflictError('Email already registered');
        }
        if (existingUser.username === userData.username) {
          throw new ConflictError('Username already taken');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      // Create user
      const userDataToCreate: any = {
        email: userData.email,
        username: userData.username,
        password: hashedPassword
      };

      if (userData.firstName) {
        userDataToCreate.firstName = userData.firstName;
      }
      if (userData.lastName) {
        userDataToCreate.lastName = userData.lastName;
      }

      const user = await prisma.user.create({
        data: userDataToCreate
      });

      // Generate tokens
      const { accessToken, refreshToken, tokenId } = JWTService.generateTokenPair(
        user.id,
        user.email,
        user.username
      );

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          id: tokenId,
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(user.email, user.username);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw error as registration should still succeed
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new BadRequestError('Registration failed');
    }
  }

  // Login user
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: loginData.email }
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const { accessToken, refreshToken, tokenId } = JWTService.generateTokenPair(
        user.id,
        user.email,
        user.username
      );

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          id: tokenId,
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Return user data without password
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new BadRequestError('Login failed');
    }
  }

  // Forgot password
  static async forgotPassword(forgotData: ForgotPasswordRequest): Promise<MessageResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: forgotData.email }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, a password reset OTP has been sent'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Generate OTP
      const otp = OTPService.generateOTP();

      // Store OTP in Redis
      await OTPService.storeOTP(forgotData.email, otp, user.id);

      // Send OTP email
      await EmailService.sendOTPEmail(forgotData.email, otp, user.username);

      return {
        success: true,
        message: 'If an account with this email exists, a password reset OTP has been sent'
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new BadRequestError('Failed to process password reset request');
    }
  }

  // Reset password
  static async resetPassword(resetData: ResetPasswordRequest): Promise<MessageResponse> {
    try {
      // Verify OTP
      const otpResult = await OTPService.verifyOTP(resetData.email, resetData.otp);
      
      if (!otpResult.isValid || !otpResult.userId) {
        throw new AuthenticationError('Invalid or expired OTP');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: otpResult.userId }
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(resetData.newPassword, this.SALT_ROUNDS);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Revoke all refresh tokens for security
      await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true }
      });

      // Send password changed notification
      try {
        await EmailService.sendPasswordChangedEmail(user.email, user.username);
      } catch (error) {
        console.error('Failed to send password changed email:', error);
      }

      return {
        success: true,
        message: 'Password has been successfully reset'
      };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError('Failed to reset password');
    }
  }

  // Refresh access token
  static async refreshToken(refreshData: RefreshTokenRequest): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshData.refreshToken);

      // Check if token exists in database and is not revoked
      const refreshTokenRecord = await prisma.refreshToken.findFirst({
        where: {
          id: payload.tokenId,
          token: refreshData.refreshToken,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!refreshTokenRecord) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new token pair
      const { accessToken, refreshToken, tokenId } = JWTService.generateTokenPair(
        refreshTokenRecord.user.id,
        refreshTokenRecord.user.email,
        refreshTokenRecord.user.username
      );

      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { id: payload.tokenId },
        data: { isRevoked: true }
      });

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          id: tokenId,
          token: refreshToken,
          userId: refreshTokenRecord.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      return {
        success: true,
        data: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new BadRequestError('Failed to refresh token');
    }
  }

  // Logout
  static async logout(logoutData: LogoutRequest): Promise<MessageResponse> {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(logoutData.refreshToken);

      // Revoke refresh token
      await prisma.refreshToken.updateMany({
        where: {
          id: payload.tokenId,
          userId: payload.userId,
          isRevoked: false
        },
        data: { isRevoked: true }
      });

      return {
        success: true,
        message: 'Successfully logged out'
      };
    } catch (error) {
      // Even if token is invalid, return success for security
      return {
        success: true,
        message: 'Successfully logged out'
      };
    }
  }

  // Get current user
  static async getCurrentUser(userId: string): Promise<UserResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthenticationError) {
        throw error;
      }
      throw new BadRequestError('Failed to get user information');
    }
  }

  // Verify access token and get user
  static async verifyTokenAndGetUser(token: string): Promise<UserWithoutPassword> {
    try {
      const payload = JWTService.verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid token');
    }
  }
} 