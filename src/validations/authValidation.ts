import Joi from 'joi';
import { 
  RegisterRequest, 
  LoginRequest, 
  ForgotPasswordRequest, 
  VerifyOTPRequest, 
  ResetPasswordRequest,
  RefreshTokenRequest,
  LogoutRequest 
} from '../types/auth';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Username validation regex (alphanumeric, underscore, 3-20 chars)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Register validation schema
export const registerSchema = Joi.object<RegisterRequest>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(EMAIL_REGEX)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  username: Joi.string()
    .pattern(USERNAME_REGEX)
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.pattern.base': 'Username must be 3-20 characters, alphanumeric and underscore only',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 20 characters',
      'any.required': 'Username is required'
    }),
  password: Joi.string()
    .pattern(PASSWORD_REGEX)
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be at most 128 characters',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 1 character',
      'string.max': 'First name must be at most 50 characters'
    }),
  lastName: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 1 character',
      'string.max': 'Last name must be at most 50 characters'
    })
});

// Login validation schema
export const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(EMAIL_REGEX)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Password is required',
      'any.required': 'Password is required'
    })
});

// Forgot password validation schema
export const forgotPasswordSchema = Joi.object<ForgotPasswordRequest>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(EMAIL_REGEX)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Verify OTP validation schema
export const verifyOTPSchema = Joi.object<VerifyOTPRequest>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(EMAIL_REGEX)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only digits',
      'any.required': 'OTP is required'
    })
});

// Reset password validation schema
export const resetPasswordSchema = Joi.object<ResetPasswordRequest>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(EMAIL_REGEX)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only digits',
      'any.required': 'OTP is required'
    }),
  newPassword: Joi.string()
    .pattern(PASSWORD_REGEX)
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be at most 128 characters',
      'any.required': 'New password is required'
    })
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object<RefreshTokenRequest>({
  refreshToken: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
});

// Logout validation schema
export const logoutSchema = Joi.object<LogoutRequest>({
  refreshToken: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
});

// Password validation function
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 