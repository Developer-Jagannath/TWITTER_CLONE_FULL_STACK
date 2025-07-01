import { User, RefreshToken } from '@prisma/client';

// JWT Payload types
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  tokenId: string;
  userId: string;
  iat?: number;
  exp?: number;
}

// Request types
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Response types
export interface AuthResponse {
  success: true;
  data: {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserResponse {
  success: true;
  data: {
    user: Omit<User, 'password'>;
  };
}

export interface MessageResponse {
  success: true;
  message: string;
}

// User types
export type UserWithoutPassword = Omit<User, 'password'>;

export interface UserWithTokens extends UserWithoutPassword {
  refreshTokens: RefreshToken[];
}

// Validation schemas
export interface ValidationSchema {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// OTP types
export interface OTPData {
  email: string;
  otp: string;
  userId: string;
  expiresAt: Date;
}

// Email types
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Password validation
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// Authentication middleware types
export interface AuthenticatedRequest extends Request {
  user?: UserWithoutPassword;
  token?: string;
  params: any;
} 