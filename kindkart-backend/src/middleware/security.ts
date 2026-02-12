import { Request, Response, NextFunction } from 'express';

// XSS Protection middleware
export function xssProtection(req: Request, res: Response, next: NextFunction): void {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

// Input sanitization helper
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .trim();
}

// Validate and sanitize request body
export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeInput(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitize(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitize(req.body);
  }
  
  next();
}

