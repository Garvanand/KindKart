import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';
import { db } from '../lib/db';

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
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      isGuest?: boolean;
    };

    const user: any = db.prepare('SELECT id, email, phone, isVerified FROM users WHERE id = ?').get(decoded.userId);

    if (!user || !user.isVerified) {
      res.status(401).json({ error: 'Invalid or unverified user' });
      return;
    }

    req.user = { id: user.id, email: user.email, phone: user.phone };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const admin: any = db.prepare("SELECT id FROM community_members WHERE userId = ? AND role = 'admin' LIMIT 1").get(req.user.id);

    if (!admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization error' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
        const user: any = db.prepare('SELECT id, email, phone, isVerified FROM users WHERE id = ?').get(decoded.userId);
        if (user && user.isVerified) {
          req.user = { id: user.id, email: user.email, phone: user.phone };
        }
      } catch (_e) {
        // Silently fail for optional auth
      }
    }

    next();
  } catch (_error) {
    next();
  }
};
