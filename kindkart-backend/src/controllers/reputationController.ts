import { Request, Response } from 'express';
import { db, generateId, parseJson, stringifyJson } from '../lib/db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

function calculateLevel(totalPoints: number): number {
  if (totalPoints < 100) return 1;
  if (totalPoints < 250) return 2;
  if (totalPoints < 500) return 3;
  if (totalPoints < 1000) return 4;
  if (totalPoints < 2000) return 5;
  if (totalPoints < 3500) return 6;
  if (totalPoints < 5000) return 7;
  if (totalPoints < 7000) return 8;
  if (totalPoints < 10000) return 9;
  return 10;
}

export const reputationController = {
  getUserReputation: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { userId } = req.params;

      let reputation: any = db.prepare('SELECT * FROM user_reputations WHERE userId = ?').get(userId);

      if (!reputation) {
        const id = generateId();
        db.prepare("INSERT INTO user_reputations (id, userId, communityId, totalPoints, helperScore, requesterScore, badges) VALUES (?, ?, '', 0, 0, 0, '[]')").run(id, userId);
        reputation = db.prepare('SELECT * FROM user_reputations WHERE id = ?').get(id);
      }

      reputation.badges = parseJson(reputation.badges, []);
      const user: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(userId);

      // Get badge assignments
      const badgeRows: any[] = db.prepare('SELECT * FROM badge_assignments WHERE userId = ? ORDER BY earnedAt DESC').all(userId);

      res.json({
        totalCredits: reputation.totalPoints,
        communityCredits: 0,
        helperCredits: reputation.helperScore,
        requesterCredits: reputation.requesterScore,
        level: calculateLevel(reputation.totalPoints),
        badges: badgeRows.map((b: any) => ({
          id: b.id,
          type: b.badgeType,
          earnedAt: b.earnedAt,
          communityId: b.communityId
        })),
        achievements: [],
        user
      });
    } catch (error) {
      console.error('Get user reputation error:', error);
      res.status(500).json({ error: 'Failed to get user reputation' });
    }
  },

  getUserBadges: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { userId } = req.params;
      const badges: any[] = db.prepare('SELECT * FROM badge_assignments WHERE userId = ? ORDER BY earnedAt DESC').all(userId);
      res.json(badges);
    } catch (error) {
      console.error('Get user badges error:', error);
      res.status(500).json({ error: 'Failed to get user badges' });
    }
  },

  getUserAchievements: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      res.json([]);
    } catch (error) {
      console.error('Get user achievements error:', error);
      res.status(500).json({ error: 'Failed to get user achievements' });
    }
  },

  getLeaderboard: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { communityId, limit = '10' } = req.query;
      const take = parseInt(limit as string) || 10;

      let rows: any[];
      if (communityId) {
        rows = db.prepare(`
          SELECT ur.*, u.name, u.profilePhoto
          FROM user_reputations ur
          JOIN users u ON ur.userId = u.id
          JOIN community_members cm ON cm.userId = ur.userId AND cm.communityId = ?
          ORDER BY ur.totalPoints DESC LIMIT ?
        `).all(communityId, take);
      } else {
        rows = db.prepare(`
          SELECT ur.*, u.name, u.profilePhoto
          FROM user_reputations ur
          JOIN users u ON ur.userId = u.id
          ORDER BY ur.totalPoints DESC LIMIT ?
        `).all(take);
      }

      const leaderboard = rows.map((row: any, index: number) => {
        const completedCount: any = db.prepare("SELECT COUNT(*) as count FROM help_requests WHERE helperId = ? AND status = 'completed'").get(row.userId);
        return {
          userId: row.userId,
          name: row.name,
          profilePhoto: row.profilePhoto,
          score: row.totalPoints,
          rank: index + 1,
          badges: 0,
          completedRequests: completedCount?.count || 0
        };
      });

      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  },

  getCommunityReputation: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { communityId } = req.params;

      const members: any[] = db.prepare('SELECT cm.userId, u.name, u.profilePhoto FROM community_members cm JOIN users u ON cm.userId = u.id WHERE cm.communityId = ?').all(communityId);
      const userIds = members.map(m => m.userId);

      let totalCredits = 0;
      const topHelpers: any[] = [];
      for (const userId of userIds) {
        const rep: any = db.prepare('SELECT * FROM user_reputations WHERE userId = ?').get(userId);
        if (rep) {
          totalCredits += rep.totalPoints;
          const m = members.find(m => m.userId === userId);
          topHelpers.push({ userId, name: m?.name, profilePhoto: m?.profilePhoto, helperCredits: rep.helperScore, totalCredits: rep.totalPoints });
        }
      }

      topHelpers.sort((a, b) => b.helperCredits - a.helperCredits);

      res.json({
        communityId,
        memberCount: members.length,
        totalCredits,
        averageCredits: members.length > 0 ? totalCredits / members.length : 0,
        topHelpers: topHelpers.slice(0, 5)
      });
    } catch (error) {
      console.error('Get community reputation error:', error);
      res.status(500).json({ error: 'Failed to get community reputation' });
    }
  },

  updateReputation: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { userId, action, points } = req.body;
      if (!userId || !action || points === undefined) { res.status(400).json({ error: 'Missing required fields' }); return; }

      let reputation: any = db.prepare('SELECT * FROM user_reputations WHERE userId = ?').get(userId);
      if (!reputation) {
        const id = generateId();
        db.prepare("INSERT INTO user_reputations (id, userId, communityId, totalPoints, helperScore, requesterScore, badges) VALUES (?, ?, '', 0, 0, 0, '[]')").run(id, userId);
        reputation = db.prepare('SELECT * FROM user_reputations WHERE id = ?').get(id);
      }

      if (action.startsWith('helper_')) {
        db.prepare("UPDATE user_reputations SET helperScore = helperScore + ?, totalPoints = totalPoints + ?, updatedAt = datetime('now') WHERE userId = ?").run(points, points, userId);
      } else if (action.startsWith('requester_')) {
        db.prepare("UPDATE user_reputations SET requesterScore = requesterScore + ?, totalPoints = totalPoints + ?, updatedAt = datetime('now') WHERE userId = ?").run(points, points, userId);
      } else {
        db.prepare("UPDATE user_reputations SET totalPoints = totalPoints + ?, updatedAt = datetime('now') WHERE userId = ?").run(points, userId);
      }

      const updated: any = db.prepare('SELECT * FROM user_reputations WHERE userId = ?').get(userId);
      res.json({ message: 'Reputation updated successfully', reputation: updated });
    } catch (error) {
      console.error('Update reputation error:', error);
      res.status(500).json({ error: 'Failed to update reputation' });
    }
  },

  awardBadge: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { userId, badgeType, communityId } = req.body;
      if (!userId || !badgeType) { res.status(400).json({ error: 'Missing required fields' }); return; }

      const existing: any = db.prepare('SELECT id FROM badge_assignments WHERE userId = ? AND badgeType = ? AND communityId = ?').get(userId, badgeType, communityId || '');
      if (existing) { res.status(400).json({ error: 'User already has this badge' }); return; }

      const id = generateId();
      db.prepare('INSERT INTO badge_assignments (id, userId, communityId, badgeType) VALUES (?, ?, ?, ?)').run(id, userId, communityId || '', badgeType);
      const badge: any = db.prepare('SELECT * FROM badge_assignments WHERE id = ?').get(id);

      res.json({ message: 'Badge awarded successfully', badge });
    } catch (error) {
      console.error('Award badge error:', error);
      res.status(500).json({ error: 'Failed to award badge' });
    }
  }
};
