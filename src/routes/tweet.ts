import { Router } from 'express';
import { TweetController } from '../controllers/tweetController';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const tempUploadDir = 'temp-uploads';
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const upload = multer({
  dest: tempUploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Public routes (no authentication required)
router.get('/public', TweetController.getPublicTweets);


// User tweets
router.get('/user/:id', optionalAuth, TweetController.getUserTweets);

// Get tweet by id
router.get('/:id', optionalAuth, TweetController.getTweet);

// Protected routes (require authentication)
router.use(authenticate);

// Create tweet with optional image upload
router.post('/', upload.single('image'), TweetController.createTweet);

// Update tweet
router.put('/:id', TweetController.updateTweet);

router.delete('/:id', TweetController.deleteTweet);

// Delete tweet
// Following tweets (requires authentication)
router.get('/following', TweetController.getFollowingTweets);

export default router; 