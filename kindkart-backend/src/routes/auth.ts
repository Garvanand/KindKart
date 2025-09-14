import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

// Authentication routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export { router as authRoutes };
