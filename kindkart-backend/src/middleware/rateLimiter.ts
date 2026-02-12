import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../lib/redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.', skipSuccessfulRequests = false } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip rate limiting if Redis is not available (development mode)
    const client = await getRedisClient();
    if (!client) {
      next();
      return;
    }

    try {
      // Create a unique key for this IP and endpoint
      const key = `rate_limit:${req.ip}:${req.path}`;
      
      // Get current count
      const current = await client.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= max) {
        res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000), // seconds
        });
        return;
      }

      // Increment counter
      if (count === 0) {
        // First request in window, set with expiration
        await client.setEx(key, Math.ceil(windowMs / 1000), '1');
      } else {
        await client.incr(key);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request (fail open)
      next();
    }
  };
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many API requests. Please slow down.',
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Rate limit exceeded. Please try again later.',
});

