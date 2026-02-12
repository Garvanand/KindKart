import { Request, Response } from 'express';
import { db, generateId } from '../lib/db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

export const messageController = {
  getMessagesByRequest: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { requestId } = req.params;

      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }

      const canAccess = request.requesterId === req.user.id || request.helperId === req.user.id;
      if (!canAccess) { res.status(403).json({ error: 'Access denied' }); return; }

      const rows: any[] = db.prepare('SELECT * FROM messages WHERE requestId = ? ORDER BY createdAt ASC').all(requestId);
      const messages = rows.map((m: any) => {
        const sender: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(m.senderId);
        return { ...m, sender };
      });

      res.json(messages);
    } catch (error) {
      console.error('Get messages by request error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  sendMessage: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { requestId, content, receiverId } = req.body;
      if (!requestId || !content || !receiverId) { res.status(400).json({ error: 'Missing required fields' }); return; }

      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }

      const canAccess = request.requesterId === req.user.id || request.helperId === req.user.id;
      if (!canAccess) { res.status(403).json({ error: 'Access denied' }); return; }

      const expectedReceiver = request.requesterId === req.user.id ? request.helperId : request.requesterId;
      if (receiverId !== expectedReceiver) { res.status(400).json({ error: 'Invalid receiver' }); return; }

      const id = generateId();
      db.prepare("INSERT INTO messages (id, senderId, receiverId, requestId, content, messageType, attachments) VALUES (?, ?, ?, ?, ?, 'text', '[]')").run(id, req.user.id, receiverId, requestId, content);

      const message: any = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
      const sender: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(req.user.id);
      message.sender = sender;

      res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  getUserConversations: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }

      const requests: any[] = db.prepare(
        "SELECT * FROM help_requests WHERE (requesterId = ? OR helperId = ?) AND status IN ('accepted', 'in_progress') ORDER BY updatedAt DESC"
      ).all(req.user.id, req.user.id);

      const conversations = requests.map((request: any) => {
        const requester: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(request.requesterId);
        const helper: any = request.helperId ? db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(request.helperId) : null;
        const otherUser = request.requesterId === req.user!.id ? helper : requester;

        const lastMsg: any = db.prepare('SELECT m.*, u.name as senderName FROM messages m JOIN users u ON m.senderId = u.id WHERE m.requestId = ? ORDER BY m.createdAt DESC LIMIT 1').get(request.id);

        return {
          requestId: request.id,
          requestTitle: request.title,
          otherUser,
          lastMessage: lastMsg ? { content: lastMsg.content, senderName: lastMsg.senderName, createdAt: lastMsg.createdAt } : null,
          updatedAt: request.updatedAt
        };
      });

      res.json(conversations);
    } catch (error) {
      console.error('Get user conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }
};
