import { Router } from 'express';
import { TweetController } from '../controllers/tweetController';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Public routes (no authentication required)
router.get('/public', TweetController.getPublicTweets);
router.get('/:id', optionalAuth, TweetController.getTweet);
router.get('/user/:id', optionalAuth, TweetController.getUserTweets);

// Protected routes (require authentication)
router.use(authenticate);

// Tweet CRUD operations
router.post('/', TweetController.createTweet);
router.put('/:id', TweetController.updateTweet);
router.delete('/:id', TweetController.deleteTweet);

// Following tweets (requires authentication)
router.get('/following', TweetController.getFollowingTweets);

export default router; 