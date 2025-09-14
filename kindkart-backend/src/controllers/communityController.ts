import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
  };
}

export const communityController = {
  // Create a new community
  createCommunity: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { name, rules } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Community name required' });
      }

      // Generate unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const community = await prisma.community.create({
        data: {
          name,
          inviteCode,
          adminId: req.user.id,
          rules: rules || null
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Add creator as admin member
      await prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: req.user.id,
          role: 'admin',
          status: 'approved'
        }
      });

      res.status(201).json({
        message: 'Community created successfully',
        community
      });
    } catch (error) {
      console.error('Create community error:', error);
      res.status(500).json({ error: 'Failed to create community' });
    }
  },

  // Join community using invite code
  joinCommunity: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ error: 'Invite code required' });
      }

      // Find community by invite code
      const community = await prisma.community.findUnique({
        where: { inviteCode }
      });

      if (!community) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      // Check if user is already a member
      const existingMember = await prisma.communityMember.findFirst({
        where: {
          communityId: community.id,
          userId: req.user.id
        }
      });

      if (existingMember) {
        return res.status(400).json({ error: 'Already a member of this community' });
      }

      // Add user as pending member
      const membership = await prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: req.user.id,
          role: 'member',
          status: 'pending'
        },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              inviteCode: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Join request submitted successfully',
        membership
      });
    } catch (error) {
      console.error('Join community error:', error);
      res.status(500).json({ error: 'Failed to join community' });
    }
  },

  // Get community details
  getCommunity: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const community = await prisma.community.findUnique({
        where: { id },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            where: {
              status: 'approved'
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePhoto: true
                }
              }
            }
          }
        }
      });

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      res.json(community);
    } catch (error) {
      console.error('Get community error:', error);
      res.status(500).json({ error: 'Failed to get community' });
    }
  },

  // Get community members
  getMembers: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const members = await prisma.communityMember.findMany({
        where: { communityId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              qualification: true,
              certifications: true
            }
          }
        },
        orderBy: [
          { role: 'asc' }, // admin first
          { joinedAt: 'asc' }
        ]
      });

      res.json(members);
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ error: 'Failed to get members' });
    }
  },

  // Approve member request
  approveMember: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { userId } = req.body;

      // Check if current user is admin of this community
      const adminMembership = await prisma.communityMember.findFirst({
        where: {
          communityId: id,
          userId: req.user.id,
          role: 'admin'
        }
      });

      if (!adminMembership) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Update member status
      const membership = await prisma.communityMember.updateMany({
        where: {
          communityId: id,
          userId: userId
        },
        data: {
          status: 'approved'
        }
      });

      if (membership.count === 0) {
        return res.status(404).json({ error: 'Member request not found' });
      }

      res.json({ message: 'Member approved successfully' });
    } catch (error) {
      console.error('Approve member error:', error);
      res.status(500).json({ error: 'Failed to approve member' });
    }
  },

  // Reject member request
  rejectMember: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { userId } = req.body;

      // Check if current user is admin of this community
      const adminMembership = await prisma.communityMember.findFirst({
        where: {
          communityId: id,
          userId: req.user.id,
          role: 'admin'
        }
      });

      if (!adminMembership) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Delete member request
      const membership = await prisma.communityMember.deleteMany({
        where: {
          communityId: id,
          userId: userId,
          status: 'pending'
        }
      });

      if (membership.count === 0) {
        return res.status(404).json({ error: 'Member request not found' });
      }

      res.json({ message: 'Member request rejected' });
    } catch (error) {
      console.error('Reject member error:', error);
      res.status(500).json({ error: 'Failed to reject member' });
    }
  }
};
