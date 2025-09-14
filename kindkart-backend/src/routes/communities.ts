import express from 'express';
import { communityController } from '../controllers/communityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Community routes
router.post('/create', authenticateToken, communityController.createCommunity);
router.post('/join', authenticateToken, communityController.joinCommunity);
router.get('/:id', authenticateToken, communityController.getCommunity);
router.get('/:id/members', authenticateToken, communityController.getMembers);
router.post('/:id/approve-member', authenticateToken, communityController.approveMember);
router.post('/:id/reject-member', authenticateToken, communityController.rejectMember);

export { router as communityRoutes };
