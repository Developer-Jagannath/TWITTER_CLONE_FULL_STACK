import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, rateLimit } from '../middleware/authMiddleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', rateLimit(5), AuthController.register); // 5 requests per 15 minutes
router.post('/login', rateLimit(10), AuthController.login); // 10 requests per 15 minutes
router.post('/forgot-password', rateLimit(3), AuthController.forgotPassword); // 3 requests per 15 minutes
router.post('/verify-otp', rateLimit(5), AuthController.verifyOTP); // 5 requests per 15 minutes
router.post('/reset-password', rateLimit(3), AuthController.resetPassword); // 3 requests per 15 minutes
router.post('/refresh-token', rateLimit(20, 15 * 60 * 1000), AuthController.refreshToken); // 20 requests per 15 minutes
router.post('/logout', AuthController.logout);

// Protected routes (authentication required)
router.get('/me', authenticate as any, AuthController.getCurrentUser);
router.post('/logout-all', authenticate as any, AuthController.logoutAllDevices);
router.get('/check-token', AuthController.checkToken);

export { router as authRouter }; 