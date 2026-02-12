import express from 'express';
import { authController } from '../controllers/authController';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Authentication routes with rate limiting
router.post('/send-otp', authRateLimiter, authController.sendOTP);
router.post('/verify-otp', authRateLimiter, authController.verifyOTP);
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.post('/guest-login', authRateLimiter, authController.guestLogin);
router.post('/logout', authController.logout);

export { router as authRoutes };
