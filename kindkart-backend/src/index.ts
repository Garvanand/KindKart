import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupChatHandlers } from './socket/chatHandlers';
import { env } from './lib/env';
import { getRedisClient, closeRedisConnection } from './lib/redis';
import { apiRateLimiter } from './middleware/rateLimiter';
import { initDatabase, closeDatabase } from './lib/db';

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

// Security middleware
import { xssProtection, sanitizeBody } from './middleware/security';
app.use(xssProtection);
app.use(sanitizeBody);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(env.PORT, () => {
  console.log(`🚀 KindKart Backend Server running on port ${env.PORT}`);
  console.log(`📊 Health check: http://localhost:${env.PORT}/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  closeDatabase();
  await closeRedisConnection();
  process.exit(0);
});

export { io };
