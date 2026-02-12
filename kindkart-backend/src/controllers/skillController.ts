import { Request, Response } from 'express';
import { db, generateId } from '../lib/db';

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

export const skillController = {
  addSkill: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { name, category } = req.body;
      if (!name) { res.status(400).json({ error: 'Skill name required' }); return; }
      const id = generateId();
      db.prepare('INSERT INTO user_skills (id, userId, name, category) VALUES (?, ?, ?, ?)').run(id, req.user.id, name, category || null);
      const skill = rowToObject(db.prepare('SELECT * FROM user_skills WHERE id = ?').get(id));
      res.status(201).json(skill);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add skill' });
    }
  },

  getUserSkills: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params as { userId: string };
      const rows = db.prepare('SELECT us.*, v.name as verifierName FROM user_skills us LEFT JOIN users v ON us.verifiedBy = v.id WHERE us.userId = ? ORDER BY us.isVerified DESC, us.createdAt DESC').all(userId);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get skills' });
    }
  },

  verifySkill: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { skillId } = req.params as { skillId: string };
      
      // Check if verifier is admin of any community
      const isAdmin: any = db.prepare("SELECT id FROM community_members WHERE userId = ? AND role = 'admin' LIMIT 1").get(req.user.id);
      if (!isAdmin) { res.status(403).json({ error: 'Admin access required' }); return; }
      
      db.prepare("UPDATE user_skills SET isVerified = 1, verifiedBy = ?, verifiedAt = datetime('now') WHERE id = ?").run(req.user.id, skillId);
      res.json({ message: 'Skill verified' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify skill' });
    }
  },

  deleteSkill: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { skillId } = req.params as { skillId: string };
      db.prepare('DELETE FROM user_skills WHERE id = ? AND userId = ?').run(skillId, req.user.id);
      res.json({ message: 'Skill removed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete skill' });
    }
  },

  searchBySkill: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skill, communityId } = req.query as { skill?: string; communityId?: string };
      if (!skill) { res.status(400).json({ error: 'Skill query required' }); return; }
      
      let query = `
        SELECT DISTINCT u.id, u.name, u.email, u.profilePhoto, us.name as skillName, us.isVerified,
          COALESCE(ur.totalPoints, 0) as reputationPoints
        FROM user_skills us 
        JOIN users u ON us.userId = u.id
        LEFT JOIN user_reputations ur ON ur.userId = u.id
        WHERE us.name LIKE ?
      `;
      const params: any[] = [`%${skill}%`];
      
      if (communityId) {
        query += ` AND u.id IN (SELECT userId FROM community_members WHERE communityId = ? AND status = 'approved')`;
        params.push(communityId);
      }
      
      query += ' ORDER BY us.isVerified DESC, ur.totalPoints DESC LIMIT 20';
      const rows = db.prepare(query).all(...params);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to search skills' });
    }
  },
};
