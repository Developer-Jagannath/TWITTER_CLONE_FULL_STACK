import { prisma } from '../config/database';
import { Tweet, CreateTweetRequest, UpdateTweetRequest, TweetResponse, PaginatedTweetsResponse, TweetFilters } from '../types/tweet';
import { NotFoundError, BadRequestError, AuthorizationError } from '../errors';

// Temporary type assertion to bypass Prisma client type issues
const prismaClient = prisma as any;

export class TweetService {
  // Create a new tweet
  static async createTweet(userId: string, tweetData: CreateTweetRequest): Promise<TweetResponse> {
    try {
      const tweet = await prismaClient.tweet.create({
        data: {
          content: tweetData.content,
          userId,
          isPublic: tweetData.isPublic ?? true,
          imageUrl: tweetData.imageUrl || null
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      return {
        success: true,
        data: tweet
      };
    } catch (error) {
      throw new BadRequestError('Failed to create tweet');
    }
  }

  // Update a tweet
  static async updateTweet(tweetId: string, userId: string, tweetData: UpdateTweetRequest): Promise<TweetResponse> {
    try {
      // Check if tweet exists and belongs to user
      const existingTweet = await prismaClient.tweet.findUnique({
        where: { id: tweetId }
      });

      if (!existingTweet) {
        throw new NotFoundError('Tweet');
      }

      if (existingTweet.userId !== userId) {
        throw new AuthorizationError('Cannot edit this tweet');
      }

      const updateData: any = {
        content: tweetData.content
      };

      if (tweetData.isPublic !== undefined) {
        updateData.isPublic = tweetData.isPublic;
      }

      const tweet = await prismaClient.tweet.update({
        where: { id: tweetId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      return {
        success: true,
        data: tweet
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new BadRequestError('Failed to update tweet');
    }
  }

  // Delete a tweet
  static async deleteTweet(tweetId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if tweet exists and belongs to user
      const existingTweet = await prismaClient.tweet.findUnique({
        where: { id: tweetId }
      });

      if (!existingTweet) {
        throw new NotFoundError('Tweet');
      }

      if (existingTweet.userId !== userId) {
        throw new AuthorizationError('Cannot delete this tweet');
      }

      await prismaClient.tweet.delete({
        where: { id: tweetId }
      });

      return {
        success: true,
        message: 'Tweet deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new BadRequestError('Failed to delete tweet');
    }
  }

  // Get a single tweet
  static async getTweet(tweetId: string, currentUserId?: string): Promise<TweetResponse> {
    try {
      const tweet = await prismaClient.tweet.findUnique({
        where: { id: tweetId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        }
      });

      if (!tweet) {
        throw new NotFoundError('Tweet');
      }

      // Check if user can view this tweet
      if (!tweet.isPublic && tweet.userId !== currentUserId) {
        throw new AuthorizationError('Cannot view this tweet');
      }

      return {
        success: true,
        data: tweet
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new BadRequestError('Failed to get tweet');
    }
  }

  // Get public tweets
  static async getPublicTweets(filters: TweetFilters): Promise<PaginatedTweetsResponse> {
    try {
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const tweets = await prismaClient.tweet.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const total = await prismaClient.tweet.count({
        where: { isPublic: true }
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          tweets,
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
      throw new BadRequestError('Failed to get public tweets');
    }
  }

  // Get tweets from followed users
  static async getFollowingTweets(userId: string, filters: TweetFilters): Promise<PaginatedTweetsResponse> {
    try {
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      // Get users that the current user is following
      const following = await prismaClient.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      });

      const followingIds = following.map((f: any) => f.followingId);

      // Get tweets from followed users (public + private if following)
      const tweets = await prismaClient.tweet.findMany({
        where: {
          OR: [
            { userId: { in: followingIds }, isPublic: true },
            { userId: { in: followingIds }, isPublic: false }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const total = await prismaClient.tweet.count({
        where: {
          OR: [
            { userId: { in: followingIds }, isPublic: true },
            { userId: { in: followingIds }, isPublic: false }
          ]
        }
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          tweets,
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
      throw new BadRequestError('Failed to get following tweets');
    }
  }

  // Get user's tweets
  static async getUserTweets(userId: string, filters: TweetFilters, currentUserId?: string): Promise<PaginatedTweetsResponse> {
    try {
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      // Check if current user can view private tweets
      const canViewPrivate = userId === currentUserId;

      const whereClause = canViewPrivate 
        ? { userId } 
        : { userId, isPublic: true };

      const tweets = await prismaClient.tweet.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const total = await prismaClient.tweet.count({
        where: whereClause
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          tweets,
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
      throw new BadRequestError('Failed to get user tweets');
    }
  }
} 