import { Request, Response } from 'express';
import { getUserById, getUserCommunities, updateUser } from '../db/users.db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

export const userController = {
  getProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const user = await getUserById(req.user.id);
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { name, age, qualification, certifications } = req.body;
      const user = await updateUser(req.user.id, {
        name,
        age: age ? parseInt(age) : undefined,
        qualification,
        certifications,
      });
      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  uploadPhoto: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { photoUrl } = req.body;
      if (!photoUrl) { res.status(400).json({ error: 'Photo URL required' }); return; }

      const user = await updateUser(req.user.id, { profilePhoto: photoUrl });
      res.json({
        message: 'Photo uploaded successfully',
        user: { id: user.id, profilePhoto: user.profilePhoto, updatedAt: user.updatedAt },
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({ error: 'Failed to upload photo' });
    }
  },

  getUserCommunities: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const communities = await getUserCommunities(req.user.id);
      res.json(communities);
    } catch (error) {
      console.error('Get user communities error:', error);
      res.status(500).json({ error: 'Failed to get communities' });
    }
  }
};
