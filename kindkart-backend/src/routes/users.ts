import express from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// User routes (all protected)
router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/upload-photo', userController.uploadPhoto);
router.get('/communities', userController.getUserCommunities);

export { router as userRoutes };
