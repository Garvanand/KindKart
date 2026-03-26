import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupChatHandlers } from './socket/chatHandlers';
import { env } from './lib/env';
import { getRedisClient, closeRedisConnection } from './lib/redis';
import { apiRateLimiter } from './middleware/rateLimiter';
import { initDatabase, closeDatabase, db } from './lib/db';
import { requestHooks } from './middleware/requestHooks';

// Environment variables are validated on import

// Initialize SQLite database
initDatabase();

// Initialize Redis connection
getRedisClient().catch(err => {
  console.warn('Redis connection failed (continuing without Redis):', err.message);
});

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestHooks);

// Security middleware
import { xssProtection, sanitizeBody } from './middleware/security';
app.use(xssProtection);
app.use(sanitizeBody);

// Health check endpoint
app.get('/health', async (_req, res) => {
  let dbStatus: 'up' | 'down' = 'up';
  let redisStatus: 'up' | 'down' = 'down';

  try {
    db.prepare('SELECT 1 as ok').get();
  } catch (_error) {
    dbStatus = 'down';
  }

  try {
    const redis = await getRedisClient();
    redisStatus = redis?.isOpen ? 'up' : 'down';
  } catch (_error) {
    redisStatus = 'down';
  }

  const statusCode = dbStatus === 'up' ? 200 : 503;
  res.status(statusCode).json({
    status: dbStatus === 'up' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: {
      db: dbStatus,
      redis: redisStatus,
    },
  });
});

app.get('/health/ready', (_req, res) => {
  try {
    db.prepare('SELECT 1 as ok').get();
    res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
  } catch (_error) {
    res.status(503).json({ ready: false, timestamp: new Date().toISOString() });
  }
});

// API Routes with rate limiting
app.use('/api/auth', require('./routes/auth').authRoutes);
app.use('/api/users', apiRateLimiter, require('./routes/users').userRoutes);
app.use('/api/communities', apiRateLimiter, require('./routes/communities').communityRoutes);
app.use('/api/requests', apiRateLimiter, require('./routes/requests').requestRoutes);
app.use('/api/messages', apiRateLimiter, require('./routes/messages').messageRoutes);
app.use('/api/payments', apiRateLimiter, require('./routes/payments').paymentRoutes);
app.use('/api/reputation', apiRateLimiter, require('./routes/reputation').reputationRoutes);
app.use('/api/ai', apiRateLimiter, require('./routes/ai').aiRoutes);
app.use('/api/notifications', apiRateLimiter, require('./routes/notifications').notificationRoutes);
app.use('/api/emergency', apiRateLimiter, require('./routes/emergency').emergencyRoutes);
app.use('/api/tasks', apiRateLimiter, require('./routes/tasks').taskRoutes);
app.use('/api/ext', apiRateLimiter, require('./routes/extended').extendedRoutes);

// Setup Socket.IO handlers
setupChatHandlers(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = Number(err?.statusCode || err?.status || 500);
  const message = statusCode >= 500 ? 'Internal server error' : err?.message || 'Request failed';
  const requestId = req.headers['x-request-id']?.toString() || res.getHeader('x-request-id')?.toString();

  console.error('API Error:', {
    method: req.method,
    path: req.path,
    requestId,
    statusCode,
    message: err?.message,
    stack: err?.stack,
  });

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

const startServer = (port: number, retriesLeft = 2): void => {
  const handleError = (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on port ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  };

  server.once('error', handleError);
  server.listen(port, () => {
    server.removeListener('error', handleError);
    console.log(`🚀 KindKart Backend Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
  });
};

startServer(env.PORT);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  closeDatabase();
  await closeRedisConnection();
  process.exit(0);
});

export { io };
