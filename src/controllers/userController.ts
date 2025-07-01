import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../utils/errorUtils';
import { AuthenticationError } from '../errors';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export class UserController {
  // Follow a user
  static followUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userIdToFollow } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!userIdToFollow) {
      throw new Error('User ID is required');
    }

    validateRequest(req, ['id'], 'params');

    const result = await UserService.followUser(currentUserId, userIdToFollow);
    res.status(200).json(result);
  });

  // Unfollow a user
  static unfollowUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id: userIdToUnfollow } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!userIdToUnfollow) {
      throw new Error('User ID is required');
    }

    validateRequest(req, ['id'], 'params');

    const result = await UserService.unfollowUser(currentUserId, userIdToUnfollow);
    res.status(200).json(result);
  });

  // Get followers list
  static getFollowers = asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      throw new Error('User ID is required');
    }

    validateRequest(req, ['id'], 'params');

    const result = await UserService.getFollowers(userId, page, limit);
    res.status(200).json(result);
  });

  // Get following list
  static getFollowing = asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      throw new Error('User ID is required');
    }

    validateRequest(req, ['id'], 'params');

    const result = await UserService.getFollowing(userId, page, limit);
    res.status(200).json(result);
  });

  // Get user profile
  static getUserProfile = asyncHandler(async (req: Request, res: Response) => {

    const { id: userId } = req.params;
    console.log('👤 User ID from params:', userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

   
    validateRequest(req, ['id'], 'params');

    const userProfile = await UserService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: userProfile
    });
   
  });
} 