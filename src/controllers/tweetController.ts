import { Request, Response } from 'express';
import { TweetService } from '../services/tweetService';
import { CloudinaryService } from '../services/cloudinaryService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../utils/errorUtils';
import { AuthenticationError } from '../errors';
import fs from 'fs';

// Extend Request type to include user and file
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
  file?: Express.Multer.File | undefined;
}

export class TweetController {
  // Create a new tweet with optional image upload
  static createTweet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const currentUserId = req.user?.id;
    const { content, isPublic } = req.body;
    let imageUrl: string | undefined;

    if (!currentUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    validateRequest(req, ['content']);

    // Handle image upload if file is present
    if (req.file) {
      try {
        const uploadResult = await CloudinaryService.uploadImage(req.file.path, 'tweets');
        imageUrl = uploadResult.secure_url;
        
        // Clean up temporary file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (error) {
        // Clean up temporary file on error
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw error;
      }
    }

    const result = await TweetService.createTweet(currentUserId, { content, isPublic, imageUrl: imageUrl || undefined });
    res.status(201).json(result);
  });

  // Update a tweet
  static updateTweet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: tweetId } = req.params;
    const currentUserId = req.user?.id;
    const { content, isPublic } = req.body;

    if (!currentUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    validateRequest(req, ['id', 'content']);

    const result = await TweetService.updateTweet(tweetId, currentUserId, { content, isPublic });
    res.status(200).json(result);
  });

  // Delete a tweet
  static deleteTweet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: tweetId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    validateRequest(req, ['id']);

    const result = await TweetService.deleteTweet(tweetId, currentUserId);
    res.status(200).json(result);
  });

  // Get a single tweet
  static getTweet = asyncHandler(async (req: Request, res: Response) => {
    const { id: tweetId } = req.params;
    const currentUserId = (req as AuthenticatedRequest).user?.id;

    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    validateRequest(req, ['id']);

    const result = await TweetService.getTweet(tweetId, currentUserId);
    res.status(200).json(result);
  });

  // Get public tweets
  static getPublicTweets = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await TweetService.getPublicTweets({ page, limit });
    res.status(200).json(result);
  });

  // Get tweets from followed users
  static getFollowingTweets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!currentUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    const result = await TweetService.getFollowingTweets(currentUserId, { page, limit });
    res.status(200).json(result);
  });

  // Get user's tweets
  static getUserTweets = asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const currentUserId = (req as AuthenticatedRequest).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      throw new Error('User ID is required');
    }

    validateRequest(req, ['id']);

    const result = await TweetService.getUserTweets(userId, { page, limit }, currentUserId);
    res.status(200).json(result);
  });
} 