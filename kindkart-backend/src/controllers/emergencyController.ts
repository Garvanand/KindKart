import { Request, Response } from 'express';
import { db, generateId, parseJson } from '../lib/db';
import { createNotification } from './notificationController';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

function rowToObject(row: any): any {
  if (!row) return null;
  const obj: any = {};
  for (const key in row) {
    if (typeof row[key] === 'number' && key.startsWith('is')) obj[key] = row[key] === 1;
    else obj[key] = row[key];
  }
  return obj;
}

export const emergencyController = {
  createAlert: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId, type, title, description, location } = req.body;
      if (!communityId || !title) {
        res.status(400).json({ error: 'communityId and title required' }); return;
      }
      const id = generateId();
      db.prepare(
        'INSERT INTO emergency_alerts (id, userId, communityId, type, title, description, location) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id, req.user.id, communityId, type || 'general', title, description || null, location || null);

      // Notify all community members
      const members: any[] = db.prepare(
        'SELECT userId FROM community_members WHERE communityId = ? AND status = ? AND userId != ?'
      ).all(communityId, 'approved', req.user.id);
      
      for (const member of members) {
        createNotification(
          member.userId, 'emergency_alert', 'Emergency Alert!', title, communityId, { alertId: id }
        );
      }

      const alert = rowToObject(db.prepare('SELECT * FROM emergency_alerts WHERE id = ?').get(id));
      res.status(201).json(alert);
    } catch (error) {
      console.error('Create emergency alert error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  },

  getAlerts: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId } = req.params as { communityId: string };
      const rows = db.prepare(
        'SELECT ea.*, u.name as userName FROM emergency_alerts ea JOIN users u ON ea.userId = u.id WHERE ea.communityId = ? ORDER BY ea.createdAt DESC LIMIT 50'
      ).all(communityId);
      const alerts = rows.map((r: any) => rowToObject(r));
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get alerts' });
    }
  },

  respondToAlert: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { alertId } = req.params as { alertId: string };
      const { status, message } = req.body;
      const id = generateId();
      db.prepare(
        'INSERT OR REPLACE INTO emergency_responses (id, alertId, userId, status, message) VALUES (?, ?, ?, ?, ?)'
      ).run(id, alertId, req.user.id, status || 'safe', message || null);

      // Notify alert creator
      const alert: any = db.prepare('SELECT * FROM emergency_alerts WHERE id = ?').get(alertId);
      if (alert) {
        const responder: any = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
        createNotification(
          alert.userId, 'emergency_response',
          `${responder?.name || 'Someone'} responded to your emergency`,
          `Status: ${status}`, alert.communityId, { alertId, status }
        );
      }

      res.json({ message: 'Response recorded' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to respond to alert' });
    }
  },

  getResponses: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { alertId } = req.params as { alertId: string };
      const rows = db.prepare(
        'SELECT er.*, u.name as userName, u.profilePhoto FROM emergency_responses er JOIN users u ON er.userId = u.id WHERE er.alertId = ? ORDER BY er.createdAt DESC'
      ).all(alertId);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get responses' });
    }
  },

  resolveAlert: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { alertId } = req.params as { alertId: string };
      db.prepare(
        "UPDATE emergency_alerts SET status = 'resolved', resolvedAt = datetime('now') WHERE id = ? AND userId = ?"
      ).run(alertId, req.user.id);
      res.json({ message: 'Alert resolved' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  },
};
