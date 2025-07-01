import { prisma } from '../config/database';
import { OTPData } from '../types/auth';
import { BadRequestError, AuthenticationError } from '../errors/AppError';

export class OTPService {
  private static readonly OTP_LENGTH = 6;
  private static readonly OTP_EXPIRY = 10 * 60; // 10 minutes in seconds
  private static readonly MAX_ATTEMPTS = 3;

  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in database
  static async storeOTP(email: string, otp: string, userId: string): Promise<void> {
    try {
      // Delete any existing OTPs for this email
      await prisma.passwordResetOTP.deleteMany({
        where: { email }
      });

      // Create new OTP record
      await prisma.passwordResetOTP.create({
        data: {
          email,
          otp,
          userId,
          expiresAt: new Date(Date.now() + this.OTP_EXPIRY * 1000)
        }
      });
    } catch (error) {
      throw new BadRequestError('Failed to store OTP');
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string): Promise<{ isValid: boolean; userId?: string }> {
    try {
      // Get the OTP record
      const otpRecord = await prisma.passwordResetOTP.findFirst({
        where: {
          email,
          otp,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!otpRecord) {
        throw new AuthenticationError('Invalid or expired OTP');
      }

      // Mark OTP as used
      await prisma.passwordResetOTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      });

      return {
        isValid: true,
        userId: otpRecord.userId
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new BadRequestError('Failed to verify OTP');
    }
  }

  // Check if OTP exists for email
  static async hasOTP(email: string): Promise<boolean> {
    try {
      const otpRecord = await prisma.passwordResetOTP.findFirst({
        where: {
          email,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });
      return !!otpRecord;
    } catch (error) {
      return false;
    }
  }

  // Get OTP data (for debugging/admin purposes)
  static async getOTPData(email: string): Promise<OTPData | null> {
    try {
      const otpRecord = await prisma.passwordResetOTP.findFirst({
        where: {
          email,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!otpRecord) {
        return null;
      }

      return {
        email: otpRecord.email,
        otp: otpRecord.otp,
        userId: otpRecord.userId,
        expiresAt: otpRecord.expiresAt
      };
    } catch (error) {
      return null;
    }
  }

  // Delete OTP (for cleanup)
  static async deleteOTP(email: string): Promise<void> {
    try {
      await prisma.passwordResetOTP.deleteMany({
        where: { email }
      });
    } catch (error) {
      console.error('Failed to delete OTP:', error);
    }
  }

  // Clean up expired OTPs
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      await prisma.passwordResetOTP.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isUsed: true }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to cleanup expired OTPs:', error);
    }
  }

  // Get remaining attempts for email (simplified - always return max attempts)
  static async getRemainingAttempts(email: string): Promise<number> {
    // Since we're using database, we'll implement a simple approach
    // You could add an attempts table if needed
    return this.MAX_ATTEMPTS;
  }
} 