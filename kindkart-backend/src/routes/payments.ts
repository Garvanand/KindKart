import express from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

// Payment management routes
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/wallet/:userId', paymentController.getWallet);
router.get('/transactions', paymentController.getTransactions);
router.post('/release/:transactionId', paymentController.releasePayment);
router.post('/dispute/:transactionId', paymentController.disputePayment);
router.post('/complete/:requestId', paymentController.markCompleted);

export { router as paymentRoutes };
