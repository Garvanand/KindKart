import express from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, notificationController.getNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.put('/:id/read', authenticateToken, notificationController.markRead);
router.put('/read-all', authenticateToken, notificationController.markAllRead);

export { router as notificationRoutes };
