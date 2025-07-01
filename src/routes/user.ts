import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();



// Public routes (no authentication required)


router.get('/:id/profile', UserController.getUserProfile);
router.get('/:id/followers', UserController.getFollowers);
router.get('/:id/following', UserController.getFollowing);

// Protected routes (require authentication)
router.use(authenticate);

// Follow/Unfollow routes
router.post('/:id/follow', UserController.followUser);
router.post('/:id/unfollow', UserController.unfollowUser);

export default router; 