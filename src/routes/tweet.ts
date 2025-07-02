import { Router } from 'express';
import { TweetController } from '../controllers/tweetController';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';

const router = Router();


// Public routes (no authentication required)
router.get('/public', TweetController.getPublicTweets);


// User tweets
router.get('/user/:id', optionalAuth, TweetController.getUserTweets);

// Get tweet by id
router.get('/:id', optionalAuth, TweetController.getTweet);

// Protected routes (require authentication)
router.use(authenticate);

// Create tweet
router.post('/', TweetController.createTweet);

// Update tweet
router.put('/:id', TweetController.updateTweet);

router.delete('/:id', TweetController.deleteTweet);

// Delete tweet
// Following tweets (requires authentication)
router.get('/following', TweetController.getFollowingTweets);

export default router; 