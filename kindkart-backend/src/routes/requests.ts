import express from 'express';
import { requestController } from '../controllers/requestController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All request routes require authentication
router.use(authenticateToken);

// Request management routes
router.post('/create', requestController.createRequest);
router.get('/my-requests', requestController.getUserRequests);
router.get('/my-responses', requestController.getMyResponses);
router.get('/community/:communityId', requestController.getRequestsByCommunity);
router.get('/:id', requestController.getRequest);

// Response and interaction routes
router.post('/:id/respond', requestController.respondToRequest);
router.post('/:id/accept-response', requestController.acceptResponse);
router.put('/:id/status', requestController.updateRequestStatus);
router.put('/:id/complete', requestController.completeRequest);

export { router as requestRoutes };
