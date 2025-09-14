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

export const reputationController = {
  // Get user reputation score
  getUserReputation: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { userId } = req.params;

      // Get user reputation data
      const reputation = await prisma.userReputation.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      if (!reputation) {
        // Create initial reputation record
        const newReputation = await prisma.userReputation.create({
          data: {
            userId,
            totalCredits: 0,
            communityCredits: 0,
            helperCredits: 0,
            requesterCredits: 0,
            level: 1
          }
        });

        return res.json({
          totalCredits: newReputation.totalCredits,
          communityCredits: newReputation.communityCredits,
          helperCredits: newReputation.helperCredits,
          requesterCredits: newReputation.requesterCredits,
          level: newReputation.level,
          badges: [],
          achievements: []
        });
      }

      // Get user badges
      const badges = await prisma.badgeAssignment.findMany({
        where: { userId },
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        }
      });

      // Get user achievements
      const achievements = await prisma.achievement.findMany({
        where: { userId }
      });

      res.json({
        totalCredits: reputation.totalCredits,
        communityCredits: reputation.communityCredits,
        helperCredits: reputation.helperCredits,
        requesterCredits: reputation.requesterCredits,
        level: reputation.level,
        badges: badges.map(badge => ({
          id: badge.badge.id,
          name: badge.badge.name,
          description: badge.badge.description,
          icon: badge.badge.icon,
          color: badge.badge.color,
          earnedAt: badge.earnedAt.toISOString(),
          category: badge.badge.category
        })),
        achievements: achievements.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          progress: achievement.progress,
          maxProgress: achievement.maxProgress,
          completed: achievement.completed,
          category: achievement.category
        }))
      });
    } catch (error) {
      console.error('Get user reputation error:', error);
      res.status(500).json({ error: 'Failed to get user reputation' });
    }
  },

  // Get user badges
  getUserBadges: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { userId } = req.params;

      const badges = await prisma.badgeAssignment.findMany({
        where: { userId },
        include: {
          badge: true
        },
        orderBy: {
          earnedAt: 'desc'
        }
      });

      res.json(badges.map(badge => ({
        id: badge.badge.id,
        name: badge.badge.name,
        description: badge.badge.description,
        icon: badge.badge.icon,
        color: badge.badge.color,
        earnedAt: badge.earnedAt.toISOString(),
        category: badge.badge.category
      })));
    } catch (error) {
      console.error('Get user badges error:', error);
      res.status(500).json({ error: 'Failed to get user badges' });
    }
  },

  // Get user achievements
  getUserAchievements: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { userId } = req.params;

      const achievements = await prisma.achievement.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(achievements);
    } catch (error) {
      console.error('Get user achievements error:', error);
      res.status(500).json({ error: 'Failed to get user achievements' });
    }
  },

  // Get leaderboard
  getLeaderboard: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { type, communityId, timeRange = 'month', limit = 10 } = req.query;

      let whereClause: any = {};
      let orderBy: any = {};

      // Add time range filter
      if (timeRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        if (timeRange === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (timeRange === 'month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        whereClause.createdAt = {
          gte: startDate
        };
      }

      // Build query based on leaderboard type
      if (type === 'community' && communityId) {
        // Community-specific leaderboard
        const communityMembers = await prisma.communityMember.findMany({
          where: { communityId: communityId as string },
          select: { userId: true }
        });

        const userIds = communityMembers.map(member => member.userId);
        
        const leaderboard = await prisma.userReputation.findMany({
          where: {
            userId: { in: userIds },
            ...whereClause
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePhoto: true
              }
            },
            badgeAssignments: {
              select: {
                badge: {
                  select: {
                    id: true
                  }
                }
              }
            }
          },
          orderBy: {
            totalCredits: 'desc'
          },
          take: parseInt(limit as string)
        });

        // Get completion counts
        const completionCounts = await prisma.helpRequest.groupBy({
          by: ['helperId'],
          where: {
            helperId: { in: userIds },
            status: 'completed',
            ...whereClause
          },
          _count: {
            helperId: true
          }
        });

        const completionMap = new Map(
          completionCounts.map(item => [item.helperId, item._count.helperId])
        );

        const formattedLeaderboard = leaderboard.map((user, index) => ({
          userId: user.userId,
          name: user.user.name,
          profilePhoto: user.user.profilePhoto,
          score: user.totalCredits,
          rank: index + 1,
          badges: user.badgeAssignments.length,
          completedRequests: completionMap.get(user.userId) || 0
        }));

        return res.json(formattedLeaderboard);
      } else {
        // Overall leaderboard
        const leaderboard = await prisma.userReputation.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePhoto: true
              }
            },
            badgeAssignments: {
              select: {
                badge: {
                  select: {
                    id: true
                  }
                }
              }
            }
          },
          orderBy: {
            totalCredits: 'desc'
          },
          take: parseInt(limit as string)
        });

        const userIds = leaderboard.map(user => user.userId);

        // Get completion counts
        const completionCounts = await prisma.helpRequest.groupBy({
          by: ['helperId'],
          where: {
            helperId: { in: userIds },
            status: 'completed',
            ...whereClause
          },
          _count: {
            helperId: true
          }
        });

        const completionMap = new Map(
          completionCounts.map(item => [item.helperId, item._count.helperId])
        );

        const formattedLeaderboard = leaderboard.map((user, index) => ({
          userId: user.userId,
          name: user.user.name,
          profilePhoto: user.user.profilePhoto,
          score: user.totalCredits,
          rank: index + 1,
          badges: user.badgeAssignments.length,
          completedRequests: completionMap.get(user.userId) || 0
        }));

        res.json(formattedLeaderboard);
      }
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  },

  // Get community reputation
  getCommunityReputation: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { communityId } = req.params;

      // Get community members
      const members = await prisma.communityMember.findMany({
        where: { communityId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      const userIds = members.map(member => member.userId);

      // Get reputation scores
      const reputations = await prisma.userReputation.findMany({
        where: { userId: { in: userIds } },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      // Calculate community stats
      const totalCredits = reputations.reduce((sum, rep) => sum + rep.totalCredits, 0);
      const averageCredits = reputations.length > 0 ? totalCredits / reputations.length : 0;
      const topHelpers = reputations
        .sort((a, b) => b.helperCredits - a.helperCredits)
        .slice(0, 5);

      res.json({
        communityId,
        memberCount: members.length,
        totalCredits,
        averageCredits,
        topHelpers: topHelpers.map(rep => ({
          userId: rep.userId,
          name: rep.user.name,
          profilePhoto: rep.user.profilePhoto,
          helperCredits: rep.helperCredits,
          totalCredits: rep.totalCredits
        }))
      });
    } catch (error) {
      console.error('Get community reputation error:', error);
      res.status(500).json({ error: 'Failed to get community reputation' });
    }
  },

  // Update reputation
  updateReputation: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { userId, action, points, context } = req.body;

      if (!userId || !action || points === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get or create user reputation
      let reputation = await prisma.userReputation.findUnique({
        where: { userId }
      });

      if (!reputation) {
        reputation = await prisma.userReputation.create({
          data: {
            userId,
            totalCredits: 0,
            communityCredits: 0,
            helperCredits: 0,
            requesterCredits: 0,
            level: 1
          }
        });
      }

      // Update reputation based on action type
      const updateData: any = {};
      
      if (action.startsWith('helper_')) {
        updateData.helperCredits = { increment: points };
      } else if (action.startsWith('requester_')) {
        updateData.requesterCredits = { increment: points };
      } else if (action.startsWith('community_')) {
        updateData.communityCredits = { increment: points };
      }
      
      updateData.totalCredits = { increment: points };

      // Update reputation
      const updatedReputation = await prisma.userReputation.update({
        where: { userId },
        data: updateData
      });

      // Check for level up
      const newLevel = calculateLevel(updatedReputation.totalCredits);
      if (newLevel > reputation.level) {
        await prisma.userReputation.update({
          where: { userId },
          data: { level: newLevel }
        });
      }

      // Check for badge qualifications
      await checkAndAwardBadges(userId);

      res.json({
        message: 'Reputation updated successfully',
        reputation: updatedReputation
      });
    } catch (error) {
      console.error('Update reputation error:', error);
      res.status(500).json({ error: 'Failed to update reputation' });
    }
  },

  // Award badge
  awardBadge: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { userId, badgeId, context } = req.body;

      if (!userId || !badgeId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if badge exists
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        return res.status(404).json({ error: 'Badge not found' });
      }

      // Check if user already has this badge
      const existingAssignment = await prisma.badgeAssignment.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId
          }
        }
      });

      if (existingAssignment) {
        return res.status(400).json({ error: 'User already has this badge' });
      }

      // Award badge
      const badgeAssignment = await prisma.badgeAssignment.create({
        data: {
          userId,
          badgeId,
          context: context || null
        },
        include: {
          badge: true
        }
      });

      res.json({
        message: 'Badge awarded successfully',
        badge: badgeAssignment
      });
    } catch (error) {
      console.error('Award badge error:', error);
      res.status(500).json({ error: 'Failed to award badge' });
    }
  }
};

// Helper function to calculate level
function calculateLevel(totalCredits: number): number {
  if (totalCredits < 100) return 1;
  if (totalCredits < 250) return 2;
  if (totalCredits < 500) return 3;
  if (totalCredits < 1000) return 4;
  if (totalCredits < 2000) return 5;
  if (totalCredits < 3500) return 6;
  if (totalCredits < 5000) return 7;
  if (totalCredits < 7000) return 8;
  if (totalCredits < 10000) return 9;
  return 10;
}

// Helper function to check and award badges
async function checkAndAwardBadges(userId: string) {
  // This would implement the badge checking logic
  // For now, it's a placeholder
  console.log(`Checking badges for user ${userId}`);
}
