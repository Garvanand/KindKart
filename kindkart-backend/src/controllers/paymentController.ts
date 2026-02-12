import { Request, Response } from 'express';
import crypto from 'crypto';
import { db, generateId, parseJson, stringifyJson } from '../lib/db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

// Razorpay mock for when keys aren't available
let razorpay: any = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
} catch (_e) {
  console.warn('Razorpay not configured');
}

export const paymentController = {
  createOrder: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { requestId, amount, currency, helperId } = req.body;
      if (!requestId || !amount || !currency || !helperId) { res.status(400).json({ error: 'Missing required fields' }); return; }

      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
      if (request.requesterId !== req.user.id) { res.status(403).json({ error: 'Only the requester can make payments' }); return; }
      if (request.helperId !== helperId) { res.status(400).json({ error: 'Invalid helper assignment' }); return; }

      const existing: any = db.prepare("SELECT id FROM transactions WHERE requestId = ? AND payerId = ? AND status IN ('pending', 'completed')").get(requestId, req.user.id);
      if (existing) { res.status(400).json({ error: 'Payment already exists for this request' }); return; }

      let order: any;
      if (razorpay) {
        order = await razorpay.orders.create({
          amount, currency,
          receipt: `req_${requestId}_${Date.now()}`,
          notes: { requestId, payerId: req.user.id, payeeId: helperId }
        });
      } else {
        order = { id: `mock_order_${generateId()}`, amount, currency, status: 'created' };
      }

      const txId = generateId();
      db.prepare("INSERT INTO transactions (id, requestId, payerId, payeeId, amount, status, paymentGatewayId) VALUES (?, ?, ?, ?, ?, 'pending', ?)").run(txId, requestId, req.user.id, helperId, amount / 100, order.id);
      const transaction: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);

      res.json({ message: 'Order created successfully', order, transaction });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  verifyPayment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { orderId, paymentId, signature } = req.body;
      if (!orderId || !paymentId || !signature) { res.status(400).json({ error: 'Missing payment verification data' }); return; }

      if (process.env.RAZORPAY_KEY_SECRET) {
        const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
        if (generated !== signature) { res.status(400).json({ error: 'Invalid payment signature' }); return; }
      }

      const transaction: any = db.prepare("SELECT * FROM transactions WHERE paymentGatewayId = ? AND payerId = ? AND status = 'pending'").get(orderId, req.user.id);
      if (!transaction) { res.status(404).json({ error: 'Transaction not found' }); return; }

      db.prepare("UPDATE transactions SET status = 'completed', paymentGatewayId = ?, completedAt = datetime('now') WHERE id = ?").run(paymentId, transaction.id);

      const releaseTime = new Date(Date.now() + 20 * 60 * 1000).toISOString();
      const escrowId = generateId();
      db.prepare("INSERT INTO escrow_holds (id, transactionId, releaseTime, status) VALUES (?, ?, ?, 'held')").run(escrowId, transaction.id, releaseTime);

      db.prepare("UPDATE help_requests SET status = 'in_progress', updatedAt = datetime('now') WHERE id = ?").run(transaction.requestId);

      const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transaction.id);
      const escrow = db.prepare('SELECT * FROM escrow_holds WHERE id = ?').get(escrowId);

      res.json({ message: 'Payment verified successfully', transaction: updated, escrowHold: escrow });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  },

  getWallet: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { userId } = req.params;
      if (req.user.id !== userId) { res.status(403).json({ error: 'Access denied' }); return; }

      const transactions: any[] = db.prepare("SELECT * FROM transactions WHERE (payerId = ? OR payeeId = ?) AND status = 'completed'").all(userId, userId);

      let balance = 0, pendingAmount = 0, totalEarned = 0, totalSpent = 0;
      const now = new Date();

      for (const tx of transactions) {
        if (tx.payeeId === userId) {
          totalEarned += tx.amount;
          const escrow: any = db.prepare("SELECT * FROM escrow_holds WHERE transactionId = ? AND status = 'held'").get(tx.id);
          if (escrow && new Date(escrow.releaseTime) > now) {
            pendingAmount += tx.amount;
          } else {
            balance += tx.amount;
          }
        } else {
          totalSpent += tx.amount;
        }
      }

      res.json({ balance, pendingAmount, totalEarned, totalSpent });
    } catch (error) {
      console.error('Get wallet error:', error);
      res.status(500).json({ error: 'Failed to get wallet data' });
    }
  },

  getTransactions: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

      const transactions: any[] = db.prepare('SELECT * FROM transactions WHERE payerId = ? OR payeeId = ? ORDER BY createdAt DESC').all(req.user.id, req.user.id);

      const formatted = transactions.map((tx: any) => {
        const isPayer = tx.payerId === req.user!.id;
        const otherUserId = isPayer ? tx.payeeId : tx.payerId;
        const otherUser: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(otherUserId);
        const request: any = db.prepare('SELECT id, title FROM help_requests WHERE id = ?').get(tx.requestId);
        const escrow: any = db.prepare('SELECT id, releaseTime, status FROM escrow_holds WHERE transactionId = ? LIMIT 1').get(tx.id);

        return {
          id: tx.id, amount: tx.amount, status: tx.status,
          type: isPayer ? 'payment' : 'earning',
          createdAt: tx.createdAt,
          description: `${isPayer ? 'Payment for' : 'Payment from'}: ${request?.title || 'Unknown'}`,
          request, otherUser, escrowHold: escrow || null
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  },

  releasePayment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { transactionId } = req.params;

      const tx: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);
      if (!tx) { res.status(404).json({ error: 'Transaction not found' }); return; }
      if (tx.payerId !== req.user.id && tx.payeeId !== req.user.id) { res.status(403).json({ error: 'Permission denied' }); return; }

      const escrow: any = db.prepare("SELECT * FROM escrow_holds WHERE transactionId = ? AND status = 'held'").get(transactionId);
      if (!escrow) { res.status(400).json({ error: 'No active escrow found' }); return; }

      db.prepare("UPDATE escrow_holds SET status = 'released' WHERE id = ?").run(escrow.id);
      db.prepare("UPDATE help_requests SET status = 'completed', updatedAt = datetime('now') WHERE id = ?").run(tx.requestId);

      res.json({ message: 'Payment released successfully' });
    } catch (error) {
      console.error('Release payment error:', error);
      res.status(500).json({ error: 'Failed to release payment' });
    }
  },

  disputePayment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { transactionId } = req.params;
      const { reason } = req.body;
      if (!reason) { res.status(400).json({ error: 'Dispute reason is required' }); return; }

      const tx: any = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId);
      if (!tx) { res.status(404).json({ error: 'Transaction not found' }); return; }
      if (tx.payerId !== req.user.id && tx.payeeId !== req.user.id) { res.status(403).json({ error: 'Permission denied' }); return; }

      const escrow: any = db.prepare("SELECT * FROM escrow_holds WHERE transactionId = ? AND status = 'held'").get(transactionId);
      if (escrow) {
        db.prepare("UPDATE escrow_holds SET status = 'disputed', verificationProof = ? WHERE id = ?").run(reason, escrow.id);
      }

      res.json({ message: 'Dispute raised successfully. Admin will review the case.' });
    } catch (error) {
      console.error('Dispute payment error:', error);
      res.status(500).json({ error: 'Failed to raise dispute' });
    }
  },

  markCompleted: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { requestId } = req.params;
      const { proof } = req.body;

      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
      if (request.requesterId !== req.user.id && request.helperId !== req.user.id) { res.status(403).json({ error: 'Permission denied' }); return; }

      const attachments = proof ? stringifyJson([proof]) : (request.attachments || '[]');
      db.prepare("UPDATE help_requests SET status = 'completed', attachments = ?, updatedAt = datetime('now') WHERE id = ?").run(attachments, requestId);
      const updated = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);

      res.json({ message: 'Request marked as completed successfully', request: updated });
    } catch (error) {
      console.error('Mark completed error:', error);
      res.status(500).json({ error: 'Failed to mark as completed' });
    }
  }
};
