import { prisma } from '../config/database';
import { UserProfile, FollowResponse, PaginatedUsersResponse, UserStats } from '../types/user';
import { NotFoundError, ConflictError, BadRequestError } from '../errors';

export class UserService {
  // Get user profile with stats
  static async getUserProfile(userId: string): Promise<UserProfile> {
   
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        throw new NotFoundError('User');
      }

      const profile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: null, // Will be available after database migration
        profileImage: null, // Will be available after database migration
        coverImage: null, // Will be available after database migration
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        followersCount: 0, // Temporary - will be updated when Follow model is available
        followingCount: 0, // Temporary - will be updated when Follow model is available
        tweetsCount: 0 // Temporary - will be updated when Tweet model is available
      };
      return profile;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError('Failed to get user profile');
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      return {
        followersCount: 0, // Temporary - will be updated when Follow model is available
        followingCount: 0, // Temporary - will be updated when Follow model is available
        tweetsCount: 0 // Temporary - will be updated when Tweet model is available
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError('Failed to get user stats');
    }
  }

  // Follow a user (temporary implementation)
  static async followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      // Check if trying to follow self
      if (followerId === followingId) {
        throw new BadRequestError('Cannot follow yourself');
      }

      // Check if user to follow exists
      const userToFollow = await prisma.user.findUnique({
        where: { id: followingId }
      });

      if (!userToFollow) {
        throw new NotFoundError('User to follow');
      }

      // Temporary: Return success but don't actually create follow relationship
      // This will be implemented when the Follow model is available
      return {
        success: true,
        message: 'Follow functionality will be available after database migration',
        data: {
          isFollowing: false,
          followersCount: 0,
          followingCount: 0
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Failed to follow user');
    }
  }

  // Unfollow a user (temporary implementation)
  static async unfollowUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      // Check if trying to unfollow self
      if (followerId === followingId) {
        throw new BadRequestError('Cannot unfollow yourself');
      }

      // Check if user to unfollow exists
      const userToUnfollow = await prisma.user.findUnique({
        where: { id: followingId }
      });

      if (!userToUnfollow) {
        throw new NotFoundError('User to unfollow');
      }

      // Temporary: Return success but don't actually delete follow relationship
      // This will be implemented when the Follow model is available
      return {
        success: true,
        message: 'Unfollow functionality will be available after database migration',
        data: {
          isFollowing: false,
          followersCount: 0,
          followingCount: 0
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Failed to unfollow user');
    }
  }

  // Get followers list (temporary implementation)
  static async getFollowers(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedUsersResponse> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Temporary: Return empty list
      // This will be implemented when the Follow model is available
      return {
        success: true,
        data: {
          users: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError('Failed to get followers');
    }
  }

  // Get following list (temporary implementation)
  static async getFollowing(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedUsersResponse> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      // Temporary: Return empty list
      // This will be implemented when the Follow model is available
      return {
        success: true,
        data: {
          users: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError('Failed to get following');
    }
  }

  // Check if user is following another user (temporary implementation)
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Temporary: Always return false
      // This will be implemented when the Follow model is available
      return false;
    } catch (error) {
      return false;
    }
  }
} 