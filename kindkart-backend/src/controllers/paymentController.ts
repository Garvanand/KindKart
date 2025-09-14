import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
  };
}

export const paymentController = {
  // Create Razorpay order
  createOrder: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { requestId, amount, currency, helperId } = req.body;

      if (!requestId || !amount || !currency || !helperId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify request exists and user has permission
      const request = await prisma.helpRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: { select: { id: true } },
          helper: { select: { id: true } }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Verify user is the requester
      if (request.requester.id !== req.user.id) {
        return res.status(403).json({ error: 'Only the requester can make payments' });
      }

      // Verify helper is assigned
      if (request.helper?.id !== helperId) {
        return res.status(400).json({ error: 'Invalid helper assignment' });
      }

      // Check if payment already exists
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          requestId: requestId,
          payerId: req.user.id,
          status: { in: ['pending', 'completed'] }
        }
      });

      if (existingTransaction) {
        return res.status(400).json({ error: 'Payment already exists for this request' });
      }

      // Create Razorpay order
      const options = {
        amount: amount, // Amount in paise
        currency: currency,
        receipt: `req_${requestId}_${Date.now()}`,
        notes: {
          requestId: requestId,
          payerId: req.user.id,
          payeeId: helperId
        }
      };

      const order = await razorpay.orders.create(options);

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          requestId: requestId,
          payerId: req.user.id,
          payeeId: helperId,
          amount: amount / 100, // Convert back to rupees
          status: 'pending',
          paymentGatewayId: order.id
        }
      });

      res.json({
        message: 'Order created successfully',
        order: order,
        transaction: transaction
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Verify payment
  verifyPayment: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { orderId, paymentId, signature } = req.body;

      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ error: 'Missing payment verification data' });
      }

      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      // Get transaction
      const transaction = await prisma.transaction.findFirst({
        where: {
          paymentGatewayId: orderId,
          payerId: req.user.id,
          status: 'pending'
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          paymentGatewayId: paymentId
        }
      });

      // Create escrow hold (20 minutes from now)
      const releaseTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
      const escrowHold = await prisma.escrowHold.create({
        data: {
          transactionId: updatedTransaction.id,
          releaseTime: releaseTime,
          status: 'held'
        }
      });

      // Update request status
      await prisma.helpRequest.update({
        where: { id: transaction.requestId },
        data: { status: 'in_progress' }
      });

      res.json({
        message: 'Payment verified successfully',
        transaction: updatedTransaction,
        escrowHold: escrowHold
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  },

  // Get wallet balance
  getWallet: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { userId } = req.params;

      // Verify user can access this wallet
      if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Calculate wallet balance
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { payerId: userId },
            { payeeId: userId }
          ],
          status: 'completed'
        },
        include: {
          escrowHolds: true
        }
      });

      let balance = 0;
      let pendingAmount = 0;
      let totalEarned = 0;
      let totalSpent = 0;

      transactions.forEach(transaction => {
        if (transaction.payeeId === userId) {
          // User received money
          totalEarned += transaction.amount;
          
          const hasActiveEscrow = transaction.escrowHolds.some(
            hold => hold.status === 'held' && new Date(hold.releaseTime) > new Date()
          );
          
          if (hasActiveEscrow) {
            pendingAmount += transaction.amount;
          } else {
            balance += transaction.amount;
          }
        } else {
          // User paid money
          totalSpent += transaction.amount;
        }
      });

      res.json({
        balance,
        pendingAmount,
        totalEarned,
        totalSpent
      });
    } catch (error) {
      console.error('Get wallet error:', error);
      res.status(500).json({ error: 'Failed to get wallet data' });
    }
  },

  // Get transaction history
  getTransactions: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { payerId: req.user.id },
            { payeeId: req.user.id }
          ]
        },
        include: {
          request: {
            select: {
              id: true,
              title: true
            }
          },
          payer: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          payee: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          escrowHolds: {
            select: {
              id: true,
              releaseTime: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Format transactions
      const formattedTransactions = transactions.map(transaction => {
        const isPayer = transaction.payerId === req.user!.id;
        const otherUser = isPayer ? transaction.payee : transaction.payer;
        
        return {
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          type: isPayer ? 'payment' : 'earning',
          createdAt: transaction.createdAt,
          description: `${isPayer ? 'Payment for' : 'Payment from'}: ${transaction.request.title}`,
          request: transaction.request,
          otherUser: otherUser,
          escrowHold: transaction.escrowHolds[0] || null
        };
      });

      res.json(formattedTransactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  },

  // Release payment from escrow
  releasePayment: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { transactionId } = req.params;

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          escrowHolds: true,
          request: true
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if user has permission (requester or helper)
      const canRelease = transaction.payerId === req.user.id || 
                        transaction.payeeId === req.user.id;

      if (!canRelease) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Check if escrow is still active
      const activeEscrow = transaction.escrowHolds.find(
        hold => hold.status === 'held' && new Date(hold.releaseTime) > new Date()
      );

      if (!activeEscrow) {
        return res.status(400).json({ error: 'No active escrow found' });
      }

      // Update escrow status
      await prisma.escrowHold.update({
        where: { id: activeEscrow.id },
        data: { status: 'released' }
      });

      // Update request status to completed
      await prisma.helpRequest.update({
        where: { id: transaction.requestId },
        data: { status: 'completed' }
      });

      res.json({
        message: 'Payment released successfully'
      });
    } catch (error) {
      console.error('Release payment error:', error);
      res.status(500).json({ error: 'Failed to release payment' });
    }
  },

  // Dispute payment
  disputePayment: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { transactionId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Dispute reason is required' });
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          escrowHolds: true
        }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if user has permission (requester or helper)
      const canDispute = transaction.payerId === req.user.id || 
                        transaction.payeeId === req.user.id;

      if (!canDispute) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Update escrow status to disputed
      const activeEscrow = transaction.escrowHolds.find(
        hold => hold.status === 'held'
      );

      if (activeEscrow) {
        await prisma.escrowHold.update({
          where: { id: activeEscrow.id },
          data: { 
            status: 'disputed',
            verificationProof: reason
          }
        });
      }

      res.json({
        message: 'Dispute raised successfully. Admin will review the case.'
      });
    } catch (error) {
      console.error('Dispute payment error:', error);
      res.status(500).json({ error: 'Failed to raise dispute' });
    }
  },

  // Mark request as completed
  markCompleted: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { requestId } = req.params;
      const { proof } = req.body;

      const request = await prisma.helpRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: { select: { id: true } },
          helper: { select: { id: true } }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if user is requester or helper
      const canComplete = request.requester.id === req.user.id || 
                         (request.helper && request.helper.id === req.user.id);

      if (!canComplete) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Update request status
      const updatedRequest = await prisma.helpRequest.update({
        where: { id: requestId },
        data: { 
          status: 'completed',
          attachments: proof ? [proof] : request.attachments
        }
      });

      res.json({
        message: 'Request marked as completed successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Mark completed error:', error);
      res.status(500).json({ error: 'Failed to mark as completed' });
    }
  }
};
