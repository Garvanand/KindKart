import { Request, Response } from 'express';
import { db, generateId, parseJson } from '../lib/db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

export const communityController = {
  createCommunity: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { name, rules } = req.body;
      if (!name) { res.status(400).json({ error: 'Community name required' }); return; }

      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const id = generateId();
      db.prepare('INSERT INTO communities (id, name, inviteCode, adminId, rules) VALUES (?, ?, ?, ?, ?)').run(id, name, inviteCode, req.user.id, rules || null);

      // Add creator as admin member
      const memberId = generateId();
      db.prepare("INSERT INTO community_members (id, communityId, userId, role, status) VALUES (?, ?, ?, 'admin', 'approved')").run(memberId, id, req.user.id);

      const community: any = db.prepare('SELECT * FROM communities WHERE id = ?').get(id);
      const admin: any = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
      community.admin = admin;

      res.status(201).json({ message: 'Community created successfully', community });
    } catch (error) {
      console.error('Create community error:', error);
      res.status(500).json({ error: 'Failed to create community' });
    }
  },

  joinCommunity: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { inviteCode } = req.body;
      if (!inviteCode) { res.status(400).json({ error: 'Invite code required' }); return; }

      const community: any = db.prepare('SELECT * FROM communities WHERE inviteCode = ?').get(inviteCode);
      if (!community) { res.status(404).json({ error: 'Invalid invite code' }); return; }

      const existing: any = db.prepare('SELECT id FROM community_members WHERE communityId = ? AND userId = ?').get(community.id, req.user.id);
      if (existing) { res.status(400).json({ error: 'Already a member of this community' }); return; }

      const id = generateId();
      db.prepare("INSERT INTO community_members (id, communityId, userId, role, status) VALUES (?, ?, ?, 'member', 'approved')").run(id, community.id, req.user.id);

      const membership: any = db.prepare('SELECT * FROM community_members WHERE id = ?').get(id);
      membership.community = { id: community.id, name: community.name, inviteCode: community.inviteCode };

      res.status(201).json({
        message: 'Joined community successfully',
        community: membership.community,
        membership,
      });
    } catch (error) {
      console.error('Join community error:', error);
      res.status(500).json({ error: 'Failed to join community' });
    }
  },

  getCommunity: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params;

      const community: any = db.prepare('SELECT * FROM communities WHERE id = ?').get(id);
      if (!community) { res.status(404).json({ error: 'Community not found' }); return; }

      const admin: any = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(community.adminId);
      community.admin = admin;
      community.settings = parseJson(community.settings, null);

      const members: any[] = db.prepare('SELECT * FROM community_members WHERE communityId = ?').all(id);
      const membersWithUsers = members.map((m: any) => {
        const user: any = db.prepare('SELECT id, name, email, profilePhoto, qualification, certifications FROM users WHERE id = ?').get(m.userId);
        if (user) user.certifications = parseJson(user.certifications, []);
        return { ...m, user };
      });

      res.json({ ...community, members: membersWithUsers });
    } catch (error) {
      console.error('Get community error:', error);
      res.status(500).json({ error: 'Failed to get community' });
    }
  },

  getMembers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params;

      const members: any[] = db.prepare('SELECT * FROM community_members WHERE communityId = ?').all(id);
      const membersWithUsers = members.map((m: any) => {
        const user: any = db.prepare('SELECT id, name, email, profilePhoto, qualification, certifications FROM users WHERE id = ?').get(m.userId);
        if (user) user.certifications = parseJson(user.certifications, []);
        return { ...m, user };
      });

      membersWithUsers.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });

      res.json(membersWithUsers);
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ error: 'Failed to get members' });
    }
  },

  approveMember: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params;
      const { userId } = req.body;

      const admin: any = db.prepare("SELECT id FROM community_members WHERE communityId = ? AND userId = ? AND role = 'admin'").get(id, req.user.id);
      if (!admin) { res.status(403).json({ error: 'Admin access required' }); return; }

      const pending: any = db.prepare("SELECT id FROM community_members WHERE communityId = ? AND userId = ? AND status = 'pending'").get(id, userId);
      if (!pending) { res.status(404).json({ error: 'Member request not found' }); return; }

      db.prepare("UPDATE community_members SET status = 'approved' WHERE id = ?").run(pending.id);
      res.json({ message: 'Member approved successfully' });
    } catch (error) {
      console.error('Approve member error:', error);
      res.status(500).json({ error: 'Failed to approve member' });
    }
  },

  rejectMember: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params;
      const { userId } = req.body;

      const admin: any = db.prepare("SELECT id FROM community_members WHERE communityId = ? AND userId = ? AND role = 'admin'").get(id, req.user.id);
      if (!admin) { res.status(403).json({ error: 'Admin access required' }); return; }

      const pending: any = db.prepare("SELECT id FROM community_members WHERE communityId = ? AND userId = ? AND status = 'pending'").get(id, userId);
      if (!pending) { res.status(404).json({ error: 'Member request not found' }); return; }

      db.prepare('DELETE FROM community_members WHERE id = ?').run(pending.id);
      res.json({ message: 'Member request rejected' });
    } catch (error) {
      console.error('Reject member error:', error);
      res.status(500).json({ error: 'Failed to reject member' });
    }
  }
};
