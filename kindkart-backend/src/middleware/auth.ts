import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, phone: true, isVerified: true }
    });

    if (!user || !user.isVerified) {
      return res.status(401).json({ error: 'Invalid or unverified user' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const communityId = req.params.id;
    
    const membership = await prisma.communityMember.findFirst({
      where: {
        userId: req.user.id,
        communityId: communityId,
        role: 'admin'
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
