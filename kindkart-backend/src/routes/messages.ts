import express from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken);

// Message management routes
router.get('/request/:requestId', messageController.getMessagesByRequest);
router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getUserConversations);

export { router as messageRoutes };
