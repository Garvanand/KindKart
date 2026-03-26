import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

type RequestWithId = Request & { requestId?: string };

export const requestHooks = (req: RequestWithId, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id']?.toString() || crypto.randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;

    // Keep logging concise, but always include request ID for traceability.
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
      `status=${res.statusCode} duration=${durationMs}ms requestId=${requestId}`
    );
  });

  next();
};
