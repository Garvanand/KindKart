import { Request, Response } from 'express';
import { db, generateId, parseJson, stringifyJson } from '../lib/db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

function rowToObject(row: any): any {
  if (!row) return null;
  const obj: any = {};
  for (const key in row) {
    if (typeof row[key] === 'number' && (key.startsWith('is') || key === 'isPinned')) {
      obj[key] = row[key] === 1;
    } else { obj[key] = row[key]; }
  }
  return obj;
}

export const notificationController = {
  getNotifications: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const limit = parseInt(req.query.limit as string) || 50;
      const rows = db.prepare(
        'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?'
      ).all(req.user.id, limit);
      const notifications = rows.map((r: any) => {
        const n = rowToObject(r);
        n.data = parseJson(n.data, {});
        return n;
      });
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  },

  getUnreadCount: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const result: any = db.prepare(
        'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0'
      ).get(req.user.id);
      res.json({ count: result.count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  },

  markRead: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { id } = req.params as { id: string };
      db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?').run(id, req.user.id);
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification' });
    }
  },

  markAllRead: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark all notifications' });
    }
  },
};

// Helper to create notification
export function createNotification(userId: string, type: string, title: string, message: string, communityId?: string, data?: any) {
  const id = generateId();
  db.prepare(
    'INSERT INTO notifications (id, userId, communityId, type, title, message, data) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, userId, communityId || null, type, title, message, stringifyJson(data || {}));
  return id;
}
