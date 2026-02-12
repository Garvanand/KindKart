import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { storeOTP, verifyOTP } from '../lib/redis';
import { env } from '../lib/env';
import {
  createGuestUser,
  createUser,
  findUserByIdentifier,
  getUserById,
  updateUser,
} from '../db/users.db';

export const authController = {
  sendOTP: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone } = req.body;
      if (!email && !phone) { res.status(400).json({ error: 'Email or phone required' }); return; }

      const identifier = email || phone;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const stored = await storeOTP(identifier, otp, 300);
      if (!stored) console.log(`[DEV] OTP for ${identifier}: ${otp}`);

      const isDevelopment = env.NODE_ENV !== 'production';
      res.json({ message: 'OTP sent successfully', ...(isDevelopment && { otp }) });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  },

  verifyOTP: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, phone, otp, name, age, qualification, certifications } = req.body;
      if (!otp) { res.status(400).json({ error: 'OTP required' }); return; }

      const identifier = email || phone;
      if (!identifier) { res.status(400).json({ error: 'Email or phone required' }); return; }
      if (otp.length !== 6 || isNaN(parseInt(otp))) { res.status(400).json({ error: 'Invalid OTP format' }); return; }

      const isValidOTP = await verifyOTP(identifier, otp);
      if (!isValidOTP) { res.status(401).json({ error: 'Invalid or expired OTP' }); return; }

      // Check if user exists
      let user = await findUserByIdentifier(email, phone);

      if (!user) {
        if (!name) { res.status(400).json({ error: 'Name required for new users' }); return; }
        user = await createUser({
          email,
          phone,
          name,
          age: age ? parseInt(age) : null,
          qualification: qualification || null,
          certifications: certifications || [],
          isVerified: true,
        });
      } else {
        user = await updateUser(user.id, {
          name: name ?? user.name,
          age: age ? parseInt(age) : user.age,
          qualification: qualification ?? user.qualification,
          certifications: certifications ?? user.certifications,
          isVerified: true,
        });
      }

      const accessToken = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '24h' });
      const refreshToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Authentication successful',
        user: { id: user.id, email: user.email, phone: user.phone, name: user.name, isVerified: !!user.isVerified },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) { res.status(400).json({ error: 'Refresh token required' }); return; }

      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as any;
      const user = await getUserById(decoded.userId);

      if (!user || !user.isVerified) { res.status(401).json({ error: 'Invalid refresh token' }); return; }

      const accessToken = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  guestLogin: async (req: Request, res: Response): Promise<void> => {
    try {
      const guest = await createGuestUser();

      const accessToken = jwt.sign({ userId: guest.id, email: guest.email, isGuest: true }, env.JWT_SECRET, { expiresIn: '24h' });
      const refreshToken = jwt.sign({ userId: guest.id, isGuest: true }, env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        message: 'Guest session created',
        user: { id: guest.id, email: guest.email, phone: guest.phone, name: guest.name, isVerified: guest.isVerified, isGuest: true },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Guest login error:', error);
      res.status(500).json({ error: 'Failed to create guest session' });
    }
  },

  logout: async (_req: Request, res: Response): Promise<void> => {
    res.json({ message: 'Logged out successfully' });
  }
};
