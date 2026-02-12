import express from 'express';
import { emergencyController } from '../controllers/emergencyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/alert', authenticateToken, emergencyController.createAlert);
router.get('/community/:communityId', authenticateToken, emergencyController.getAlerts);
router.post('/:alertId/respond', authenticateToken, emergencyController.respondToAlert);
router.get('/:alertId/responses', authenticateToken, emergencyController.getResponses);
router.put('/:alertId/resolve', authenticateToken, emergencyController.resolveAlert);

export { router as emergencyRoutes };
