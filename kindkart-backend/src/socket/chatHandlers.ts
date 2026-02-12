import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db, generateId } from '../lib/db';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupChatHandlers(io: Server) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));

      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as any;

      const user: any = db.prepare('SELECT id, isVerified FROM users WHERE id = ?').get(decoded.userId);
      if (!user || !user.isVerified) return next(new Error('Authentication error: Invalid user'));

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected with socket ${socket.id}`);

    socket.on('join-chat', async ({ requestId }) => {
      try {
        if (!socket.userId) return;
        const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);
        if (!request) { socket.emit('error', { message: 'Request not found' }); return; }

        const canAccess = request.requesterId === socket.userId || request.helperId === socket.userId;
        if (!canAccess) { socket.emit('error', { message: 'Access denied' }); return; }

        const roomName = `chat-${requestId}`;
        socket.join(roomName);
        socket.emit('joined-chat', { requestId });
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('leave-chat', ({ requestId }) => {
      socket.leave(`chat-${requestId}`);
    });

    socket.on('send-message', async ({ requestId, content, receiverId }) => {
      try {
        if (!socket.userId) return;
        const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(requestId);
        if (!request) { socket.emit('error', { message: 'Request not found' }); return; }

        const canAccess = request.requesterId === socket.userId || request.helperId === socket.userId;
        if (!canAccess) { socket.emit('error', { message: 'Access denied' }); return; }

        const expectedReceiver = request.requesterId === socket.userId ? request.helperId : request.requesterId;
        if (receiverId !== expectedReceiver) { socket.emit('error', { message: 'Invalid receiver' }); return; }

        const id = generateId();
        db.prepare("INSERT INTO messages (id, senderId, receiverId, requestId, content, messageType, attachments) VALUES (?, ?, ?, ?, ?, 'text', '[]')").run(id, socket.userId, receiverId, requestId, content);

        const message: any = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
        const sender: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(socket.userId);
        message.sender = sender;

        io.to(`chat-${requestId}`).emit('new-message', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ requestId, isTyping }) => {
      if (!socket.userId) return;
      socket.to(`chat-${requestId}`).emit('typing', { userId: socket.userId, isTyping });
    });

    // Emergency alert handlers
    socket.on('join-community', ({ communityId }) => {
      if (!socket.userId) return;
      socket.join(`community-${communityId}`);
    });

    socket.on('emergency-alert', ({ communityId, alertId }) => {
      if (!socket.userId) return;
      io.to(`community-${communityId}`).emit('emergency-alert', { alertId, userId: socket.userId });
    });

    socket.on('emergency-response', ({ communityId, alertId, status }) => {
      if (!socket.userId) return;
      io.to(`community-${communityId}`).emit('emergency-response', { alertId, userId: socket.userId, status });
    });

    // Notification handler
    socket.on('join-notifications', () => {
      if (!socket.userId) return;
      socket.join(`notifications-${socket.userId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);
    });
  });
}
