import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const authController = {
  // Send OTP for authentication
  sendOTP: async (req: Request, res: Response) => {
    try {
      const { email, phone } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ error: 'Email or phone required' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // TODO: Integrate with Firebase Auth for OTP sending
      // For now, we'll just log the OTP (remove in production)
      console.log(`OTP for ${email || phone}: ${otp}`);

      // Store OTP temporarily (you might want to use Redis for this)
      // For now, we'll just return success
      
      res.json({ 
        message: 'OTP sent successfully',
        // Remove this in production
        otp: otp
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  },

  // Verify OTP and create/authenticate user
  verifyOTP: async (req: Request, res: Response) => {
    try {
      const { email, phone, otp, name, age, qualification, certifications } = req.body;

      if (!otp) {
        return res.status(400).json({ error: 'OTP required' });
      }

      // TODO: Verify OTP with Firebase Auth
      // For now, we'll accept any 6-digit OTP
      if (otp.length !== 6 || isNaN(parseInt(otp))) {
        return res.status(400).json({ error: 'Invalid OTP format' });
      }

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email || undefined },
            { phone: phone || undefined }
          ]
        }
      });

      // Create user if doesn't exist
      if (!user) {
        if (!name) {
          return res.status(400).json({ error: 'Name required for new users' });
        }

        user = await prisma.user.create({
          data: {
            email: email || '',
            phone: phone || '',
            name,
            age: age ? parseInt(age) : null,
            qualification: qualification || null,
            certifications: certifications || [],
            isVerified: true
          }
        });
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isVerified: true,
            ...(name && { name }),
            ...(age && { age: parseInt(age) }),
            ...(qualification && { qualification }),
            ...(certifications && { certifications })
          }
        });
      }

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Authentication successful',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  },

  // Refresh access token
  refreshToken: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, isVerified: true }
      });

      if (!user || !user.isVerified) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  // Logout (client-side token removal)
  logout: async (req: Request, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // You might want to implement a token blacklist for enhanced security
    res.json({ message: 'Logged out successfully' });
  }
};
