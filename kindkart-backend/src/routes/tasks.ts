import express from 'express';
import { taskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, taskController.createTask);
router.get('/community/:communityId', authenticateToken, taskController.getTasks);
router.post('/:taskId/apply', authenticateToken, taskController.applyForTask);
router.get('/:taskId/applications', authenticateToken, taskController.getApplications);
router.put('/applications/:applicationId', authenticateToken, taskController.updateApplicationStatus);
router.put('/:taskId/status', authenticateToken, taskController.updateTaskStatus);

export { router as taskRoutes };
