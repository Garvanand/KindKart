import { Request, Response } from 'express';
import { db, generateId, parseJson, stringifyJson } from '../lib/db';

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

export const gamificationController = {
  getChallenges: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const rows = db.prepare(
        "SELECT c.*, cp.progress, cp.isCompleted FROM challenges c LEFT JOIN challenge_progress cp ON cp.challengeId = c.id AND cp.userId = ? WHERE c.isActive = 1 AND c.endDate >= datetime('now') ORDER BY c.endDate ASC"
      ).all(req.user.id);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get challenges' });
    }
  },

  updateChallengeProgress: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { challengeId } = req.params as { challengeId: string };
      const { increment } = req.body;
      
      const existing: any = db.prepare('SELECT * FROM challenge_progress WHERE challengeId = ? AND userId = ?').get(challengeId, req.user.id);
      if (existing) {
        const newProgress = existing.progress + (increment || 1);
        const challenge: any = db.prepare('SELECT target FROM challenges WHERE id = ?').get(challengeId);
        const completed = challenge && newProgress >= challenge.target;
        db.prepare(
          "UPDATE challenge_progress SET progress = ?, isCompleted = ?, completedAt = ? WHERE challengeId = ? AND userId = ?"
        ).run(newProgress, completed ? 1 : 0, completed ? new Date().toISOString() : null, challengeId, req.user.id);
      } else {
        const id = generateId();
        db.prepare(
          'INSERT INTO challenge_progress (id, challengeId, userId, progress) VALUES (?, ?, ?, ?)'
        ).run(id, challengeId, req.user.id, increment || 1);
      }
      res.json({ message: 'Progress updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update progress' });
    }
  },

  getStreaks: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const rows = db.prepare('SELECT * FROM user_streaks WHERE userId = ?').all(req.user.id);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get streaks' });
    }
  },

  getKarmaShop: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const rows = db.prepare('SELECT * FROM karma_shop_items WHERE isActive = 1 ORDER BY cost ASC').all();
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get karma shop' });
    }
  },

  redeemItem: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { itemId } = req.body;
      
      const item: any = db.prepare('SELECT * FROM karma_shop_items WHERE id = ?').get(itemId);
      if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
      
      // Check user has enough karma
      const rep: any = db.prepare('SELECT SUM(totalPoints) as total FROM user_reputations WHERE userId = ?').get(req.user.id);
      const totalKarma = rep?.total || 0;
      
      // Count already redeemed
      const redeemed: any = db.prepare("SELECT SUM(ki.cost) as spent FROM karma_redemptions kr JOIN karma_shop_items ki ON kr.itemId = ki.id WHERE kr.userId = ? AND kr.status != 'cancelled'").get(req.user.id);
      const availableKarma = totalKarma - (redeemed?.spent || 0);
      
      if (availableKarma < item.cost) {
        res.status(400).json({ error: 'Not enough karma points' }); return;
      }
      
      const id = generateId();
      db.prepare('INSERT INTO karma_redemptions (id, userId, itemId) VALUES (?, ?, ?)').run(id, req.user.id, itemId);
      res.status(201).json({ message: 'Item redeemed successfully', redemptionId: id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to redeem item' });
    }
  },

  getRedemptions: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const rows = db.prepare(
        'SELECT kr.*, ki.title, ki.description, ki.cost, ki.category FROM karma_redemptions kr JOIN karma_shop_items ki ON kr.itemId = ki.id WHERE kr.userId = ? ORDER BY kr.redeemedAt DESC'
      ).all(req.user.id);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get redemptions' });
    }
  },
};

export const searchController = {
  globalSearch: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { q, communityId } = req.query as { q?: string; communityId?: string };
      if (!q || q.length < 2) { res.json({ users: [], requests: [], events: [], announcements: [] }); return; }
      
      const searchTerm = `%${q}%`;
      
      // Search users in user's communities
      const users = db.prepare(
        `SELECT DISTINCT u.id, u.name, u.email, u.profilePhoto FROM users u 
         JOIN community_members cm ON cm.userId = u.id 
         WHERE (u.name LIKE ? OR u.email LIKE ?) 
         AND cm.communityId IN (SELECT communityId FROM community_members WHERE userId = ? AND status = 'approved')
         LIMIT 10`
      ).all(searchTerm, searchTerm, req.user.id);
      
      // Search help requests
      const requests = db.prepare(
        `SELECT hr.id, hr.title, hr.category, hr.status, hr.communityId FROM help_requests hr 
         WHERE (hr.title LIKE ? OR hr.description LIKE ?) 
         AND hr.communityId IN (SELECT communityId FROM community_members WHERE userId = ? AND status = 'approved')
         LIMIT 10`
      ).all(searchTerm, searchTerm, req.user.id);
      
      // Search events
      const events = db.prepare(
        `SELECT ce.id, ce.title, ce.eventDate, ce.communityId FROM community_events ce 
         WHERE ce.title LIKE ? 
         AND ce.communityId IN (SELECT communityId FROM community_members WHERE userId = ? AND status = 'approved')
         LIMIT 10`
      ).all(searchTerm, req.user.id);
      
      // Search announcements
      const announcements = db.prepare(
        `SELECT a.id, a.title, a.communityId FROM announcements a 
         WHERE (a.title LIKE ? OR a.content LIKE ?) 
         AND a.communityId IN (SELECT communityId FROM community_members WHERE userId = ? AND status = 'approved')
         LIMIT 10`
      ).all(searchTerm, searchTerm, req.user.id);
      
      res.json({ users, requests, events, announcements });
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  },
};

export const analyticsController = {
  getCommunityAnalytics: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId } = req.params as { communityId: string };
      
      // Verify admin
      const isAdmin: any = db.prepare("SELECT id FROM community_members WHERE userId = ? AND communityId = ? AND role = 'admin'").get(req.user.id, communityId);
      if (!isAdmin) { res.status(403).json({ error: 'Admin access required' }); return; }
      
      const totalMembers: any = db.prepare("SELECT COUNT(*) as count FROM community_members WHERE communityId = ? AND status = 'approved'").get(communityId);
      const totalRequests: any = db.prepare('SELECT COUNT(*) as count FROM help_requests WHERE communityId = ?').get(communityId);
      const pendingRequests: any = db.prepare("SELECT COUNT(*) as count FROM help_requests WHERE communityId = ? AND status = 'pending'").get(communityId);
      const completedRequests: any = db.prepare("SELECT COUNT(*) as count FROM help_requests WHERE communityId = ? AND status = 'completed'").get(communityId);
      const totalTransactions: any = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as volume FROM transactions WHERE requestId IN (SELECT id FROM help_requests WHERE communityId = ?)").get(communityId);
      
      // Top helpers
      const topHelpers = db.prepare(
        `SELECT u.id, u.name, u.profilePhoto, COUNT(hr.id) as helpsCount, COALESCE(ur.totalPoints, 0) as points
         FROM help_requests hr 
         JOIN users u ON hr.helperId = u.id
         LEFT JOIN user_reputations ur ON ur.userId = u.id AND ur.communityId = ?
         WHERE hr.communityId = ? AND hr.status = 'completed'
         GROUP BY u.id ORDER BY helpsCount DESC LIMIT 10`
      ).all(communityId, communityId);
      
      // Category distribution
      const categories = db.prepare(
        'SELECT category, COUNT(*) as count FROM help_requests WHERE communityId = ? GROUP BY category ORDER BY count DESC'
      ).all(communityId);
      
      // Weekly request counts (last 8 weeks)
      const weeklyRequests = db.prepare(
        `SELECT strftime('%Y-W%W', createdAt) as week, COUNT(*) as count 
         FROM help_requests WHERE communityId = ? AND createdAt >= datetime('now', '-56 days')
         GROUP BY week ORDER BY week ASC`
      ).all(communityId);
      
      res.json({
        totalMembers: totalMembers?.count || 0,
        totalRequests: totalRequests?.count || 0,
        pendingRequests: pendingRequests?.count || 0,
        completedRequests: completedRequests?.count || 0,
        transactionCount: totalTransactions?.count || 0,
        transactionVolume: totalTransactions?.volume || 0,
        topHelpers,
        categories,
        weeklyRequests,
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  },
};

export const eventsController = {
  createEvent: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId, title, description, eventDate, eventTime, location, maxAttendees } = req.body;
      if (!communityId || !title || !eventDate) { res.status(400).json({ error: 'Required fields missing' }); return; }
      const id = generateId();
      db.prepare(
        'INSERT INTO community_events (id, communityId, creatorId, title, description, eventDate, eventTime, location, maxAttendees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, communityId, req.user.id, title, description || null, eventDate, eventTime || null, location || null, maxAttendees || null);
      const event = rowToObject(db.prepare('SELECT * FROM community_events WHERE id = ?').get(id));
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create event' });
    }
  },

  getEvents: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { communityId } = req.params as { communityId: string };
      const rows = db.prepare(
        'SELECT ce.*, u.name as creatorName, (SELECT COUNT(*) FROM event_attendees WHERE eventId = ce.id) as attendeeCount FROM community_events ce JOIN users u ON ce.creatorId = u.id WHERE ce.communityId = ? ORDER BY ce.eventDate ASC'
      ).all(communityId);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get events' });
    }
  },

  attendEvent: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { eventId } = req.params as { eventId: string };
      const { status } = req.body;
      const id = generateId();
      db.prepare('INSERT OR REPLACE INTO event_attendees (id, eventId, userId, status) VALUES (?, ?, ?, ?)').run(id, eventId, req.user.id, status || 'going');
      res.json({ message: 'RSVP recorded' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to RSVP' });
    }
  },

  getAnnouncements: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { communityId } = req.params as { communityId: string };
      const rows = db.prepare(
        'SELECT a.*, u.name as authorName FROM announcements a JOIN users u ON a.authorId = u.id WHERE a.communityId = ? ORDER BY a.isPinned DESC, a.createdAt DESC'
      ).all(communityId);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get announcements' });
    }
  },

  createAnnouncement: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId, title, content, isPinned } = req.body;
      if (!communityId || !title || !content) { res.status(400).json({ error: 'Required fields missing' }); return; }
      const id = generateId();
      db.prepare('INSERT INTO announcements (id, communityId, authorId, title, content, isPinned) VALUES (?, ?, ?, ?, ?, ?)').run(id, communityId, req.user.id, title, content, isPinned ? 1 : 0);
      const announcement = rowToObject(db.prepare('SELECT * FROM announcements WHERE id = ?').get(id));
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  },

  saveTourCompletion: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { tourId } = req.body;
      if (!tourId) { res.status(400).json({ error: 'tourId required' }); return; }
      const id = generateId();
      db.prepare('INSERT OR REPLACE INTO tour_completions (id, userId, tourId) VALUES (?, ?, ?)').run(id, req.user.id, tourId);
      res.json({ message: 'Tour completion saved' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save tour completion' });
    }
  },

  getTourCompletions: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const rows = db.prepare('SELECT tourId FROM tour_completions WHERE userId = ?').all(req.user.id);
      res.json(rows.map((r: any) => r.tourId));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get tour completions' });
    }
  },
};
