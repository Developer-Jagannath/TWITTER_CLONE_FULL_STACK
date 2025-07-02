import { prisma } from '../config/database';
import { UserProfile, FollowResponse, PaginatedUsersResponse, UserStats } from '../types/user';
import { NotFoundError, ConflictError, BadRequestError } from '../errors';

// Temporary type assertion to bypass Prisma client type issues
const prismaClient = prisma as any;

export class UserService {
  // Get user profile with stats
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundError('User');
      }
      const stats = await this.getUserStats(userId);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: null,
        profileImage: null,
        coverImage: null,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        followersCount: stats.followersCount,
        followingCount: stats.followingCount,
        tweetsCount: stats.tweetsCount
      };
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
      const followersCount = await prismaClient.follow.count({ where: { followingId: userId } });
      const followingCount = await prismaClient.follow.count({ where: { followerId: userId } });
      
      // Try to get tweets count, but handle case where tweets table doesn't exist yet
      let tweetsCount = 0;
      try {
        tweetsCount = await prismaClient.tweet.count({ where: { userId } });
      } catch (tweetError) {
        // If tweets table doesn't exist yet, just use 0
        tweetsCount = 0;
      }
      
      return { followersCount, followingCount, tweetsCount };
    } catch (error) {
      throw new BadRequestError('Failed to get user stats');
    }
  }

  // Follow a user
  static async followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      if (followerId === followingId) {
        throw new BadRequestError('Cannot follow yourself');
      }
      const userToFollow = await prismaClient.user.findUnique({ where: { id: followingId } });
      if (!userToFollow) {
        throw new NotFoundError('User to follow');
      }
      // Check if already following
      const existingFollow = await prismaClient.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      if (existingFollow) {
        throw new ConflictError('Already following this user');
      }
      // Create follow relationship
      await prismaClient.follow.create({
        data: { followerId, followingId }
      });
      // Get updated counts
      const stats = await this.getUserStats(followingId);
      return {
        success: true,
        message: 'Successfully followed user',
        data: {
          isFollowing: true,
          followersCount: stats.followersCount,
          followingCount: stats.followingCount
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Failed to follow user');
    }
  }

  // Unfollow a user
  static async unfollowUser(followerId: string, followingId: string): Promise<FollowResponse> {
    try {
      if (followerId === followingId) {
        throw new BadRequestError('Cannot unfollow yourself');
      }
      // Check if follow relationship exists
      const existingFollow = await prismaClient.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      if (!existingFollow) {
        throw new NotFoundError('Follow relationship');
      }
      // Delete follow relationship
      await prismaClient.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      // Get updated counts
      const stats = await this.getUserStats(followingId);
      return {
        success: true,
        message: 'Successfully unfollowed user',
        data: {
          isFollowing: false,
          followersCount: stats.followersCount,
          followingCount: stats.followingCount
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Failed to unfollow user');
    }
  }

  // Get followers list
  static async getFollowers(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedUsersResponse> {
    try {
      const skip = (page - 1) * limit;
      const followers = await prismaClient.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      const total = await prismaClient.follow.count({ where: { followingId: userId } });
      const totalPages = Math.ceil(total / limit);
      const users: UserProfile[] = await Promise.all(followers.map(async (follow: any) => {
        const stats = await this.getUserStats(follow.followerId);
        return {
          id: follow.follower.id,
          email: follow.follower.email,
          username: follow.follower.username,
          firstName: follow.follower.firstName,
          lastName: follow.follower.lastName,
          bio: null,
          profileImage: null,
          coverImage: null,
          isEmailVerified: follow.follower.isEmailVerified,
          isActive: follow.follower.isActive,
          lastLoginAt: follow.follower.lastLoginAt,
          createdAt: follow.follower.createdAt,
          updatedAt: follow.follower.updatedAt,
          followersCount: stats.followersCount,
          followingCount: stats.followingCount,
          tweetsCount: stats.tweetsCount
        };
      }));
      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };
    } catch (error) {
      throw new BadRequestError('Failed to get followers');
    }
  }

  // Get following list
  static async getFollowing(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedUsersResponse> {
    try {
      const skip = (page - 1) * limit;
      const following = await prismaClient.follow.findMany({
        where: { followerId: userId },
        include: {
          following: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      const total = await prismaClient.follow.count({ where: { followerId: userId } });
      const totalPages = Math.ceil(total / limit);
      const users: UserProfile[] = await Promise.all(following.map(async (follow: any) => {
        const stats = await this.getUserStats(follow.followingId);
        return {
          id: follow.following.id,
          email: follow.following.email,
          username: follow.following.username,
          firstName: follow.following.firstName,
          lastName: follow.following.lastName,
          bio: null,
          profileImage: null,
          coverImage: null,
          isEmailVerified: follow.following.isEmailVerified,
          isActive: follow.following.isActive,
          lastLoginAt: follow.following.lastLoginAt,
          createdAt: follow.following.createdAt,
          updatedAt: follow.following.updatedAt,
          followersCount: stats.followersCount,
          followingCount: stats.followingCount,
          tweetsCount: stats.tweetsCount
        };
      }));
      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };
    } catch (error) {
      throw new BadRequestError('Failed to get following');
    }
  }

  // Check if user is following another user
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const follow = await prismaClient.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      return !!follow;
    } catch (error) {
      return false;
    }
  }
} 