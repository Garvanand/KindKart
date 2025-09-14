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

export const userController = {
  // Get user profile
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          age: true,
          qualification: true,
          certifications: true,
          profilePhoto: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  // Update user profile
  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { name, age, qualification, certifications } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (age) updateData.age = parseInt(age);
      if (qualification) updateData.qualification = qualification;
      if (certifications) updateData.certifications = certifications;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          age: true,
          qualification: true,
          certifications: true,
          profilePhoto: true,
          isVerified: true,
          updatedAt: true
        }
      });

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Upload profile photo
  uploadPhoto: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // TODO: Implement file upload to S3/Firebase Storage
      // For now, we'll just accept a URL
      const { photoUrl } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ error: 'Photo URL required' });
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { profilePhoto: photoUrl },
        select: {
          id: true,
          profilePhoto: true,
          updatedAt: true
        }
      });

      res.json({
        message: 'Photo uploaded successfully',
        user
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  },

  // Get user's communities
  getUserCommunities: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const communities = await prisma.communityMember.findMany({
        where: {
          userId: req.user.id,
          status: 'approved'
        },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              inviteCode: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          joinedAt: 'desc'
        }
      });

      res.json(communities);
    } catch (error) {
      console.error('Get user communities error:', error);
      res.status(500).json({ error: 'Failed to get communities' });
    }
  }
};
