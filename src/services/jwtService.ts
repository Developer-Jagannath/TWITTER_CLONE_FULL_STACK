import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { JWTPayload, RefreshTokenPayload } from '../types/auth';
import { AuthenticationError, BadRequestError } from '../errors/AppError';

export class JWTService {
  // Generate access token
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, config.jwt.accessTokenSecret, {
        expiresIn: config.jwt.accessTokenExpiry as any,
        issuer: 'twitter-clone-api',
        audience: 'twitter-clone-users'
      });
    } catch (error) {
      throw new AuthenticationError('Failed to generate access token');
    }
  }

  // Generate refresh token
  static generateRefreshToken(userId: string): { token: string; tokenId: string } {
    try {
      const tokenId = uuidv4();
      const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
        tokenId,
        userId
      };

      const token = jwt.sign(payload, config.jwt.refreshTokenSecret, {
        expiresIn: config.jwt.refreshTokenExpiry as any,
        issuer: 'twitter-clone-api',
        audience: 'twitter-clone-users'
      });

      return { token, tokenId };
    } catch (error) {
      throw new AuthenticationError('Failed to generate refresh token');
    }
  }

  // Verify access token
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.accessTokenSecret, {
        issuer: 'twitter-clone-api',
        audience: 'twitter-clone-users'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshTokenSecret, {
        issuer: 'twitter-clone-api',
        audience: 'twitter-clone-users'
      }) as RefreshTokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw new AuthenticationError('Refresh token verification failed');
    }
  }

  // Decode token without verification (for logging/debugging)
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new BadRequestError('Invalid token format');
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      return expiration < new Date();
    } catch (error) {
      return true;
    }
  }

  // Generate both access and refresh tokens
  static generateTokenPair(userId: string, email: string, username: string): {
    accessToken: string;
    refreshToken: string;
    tokenId: string;
  } {
    const accessToken = this.generateAccessToken({ userId, email, username });
    const { token: refreshToken, tokenId } = this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
      tokenId
    };
  }
} 