import express from 'express';
import { reputationController } from '../controllers/reputationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All reputation routes require authentication
router.use(authenticateToken);

// Reputation management routes
router.get('/user/:userId', reputationController.getUserReputation);
router.get('/user/:userId/badges', reputationController.getUserBadges);
router.get('/user/:userId/achievements', reputationController.getUserAchievements);
router.get('/leaderboard', reputationController.getLeaderboard);
router.get('/community/:communityId', reputationController.getCommunityReputation);
router.post('/update', reputationController.updateReputation);
router.post('/award-badge', reputationController.awardBadge);

export { router as reputationRoutes };
