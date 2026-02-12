import express from 'express';
import { skillController } from '../controllers/skillController';
import { gamificationController, searchController, analyticsController, eventsController } from '../controllers/extendedController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Skills
router.post('/skills', authenticateToken, skillController.addSkill);
router.get('/skills/user/:userId', optionalAuth, skillController.getUserSkills);
router.put('/skills/:skillId/verify', authenticateToken, skillController.verifySkill);
router.delete('/skills/:skillId', authenticateToken, skillController.deleteSkill);
router.get('/skills/search', authenticateToken, skillController.searchBySkill);

// Gamification
router.get('/challenges', authenticateToken, gamificationController.getChallenges);
router.post('/challenges/:challengeId/progress', authenticateToken, gamificationController.updateChallengeProgress);
router.get('/streaks', authenticateToken, gamificationController.getStreaks);
router.get('/karma-shop', authenticateToken, gamificationController.getKarmaShop);
router.post('/karma-shop/redeem', authenticateToken, gamificationController.redeemItem);
router.get('/karma-shop/redemptions', authenticateToken, gamificationController.getRedemptions);

// Global Search
router.get('/search', authenticateToken, searchController.globalSearch);

// Analytics
router.get('/analytics/community/:communityId', authenticateToken, analyticsController.getCommunityAnalytics);

// Events
router.post('/events', authenticateToken, eventsController.createEvent);
router.get('/events/community/:communityId', optionalAuth, eventsController.getEvents);
router.post('/events/:eventId/attend', authenticateToken, eventsController.attendEvent);

// Announcements
router.get('/announcements/community/:communityId', optionalAuth, eventsController.getAnnouncements);
router.post('/announcements', authenticateToken, eventsController.createAnnouncement);

// Tour
router.post('/tour/complete', authenticateToken, eventsController.saveTourCompletion);
router.get('/tour/completions', authenticateToken, eventsController.getTourCompletions);

export { router as extendedRoutes };
