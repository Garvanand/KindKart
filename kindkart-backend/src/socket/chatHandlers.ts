import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupChatHandlers(io: Server) {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET!) as any;
      
      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isVerified: true }
      });

      if (!user || !user.isVerified) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected with socket ${socket.id}`);

    // Join a chat room for a specific request
    socket.on('join-chat', async ({ requestId }) => {
      try {
        if (!socket.userId) return;

        // Verify user has access to this request
        const request = await prisma.helpRequest.findUnique({
          where: { id: requestId },
          include: {
            requester: { select: { id: true } },
            helper: { select: { id: true } }
          }
        });

        if (!request) {
          socket.emit('error', { message: 'Request not found' });
          return;
        }

        // Check if user is requester or helper
        const canAccess = request.requester.id === socket.userId || 
                         (request.helper && request.helper.id === socket.userId);

        if (!canAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Join the room
        const roomName = `chat-${requestId}`;
        socket.join(roomName);
        
        console.log(`User ${socket.userId} joined chat room ${roomName}`);
        socket.emit('joined-chat', { requestId });
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave a chat room
    socket.on('leave-chat', ({ requestId }) => {
      const roomName = `chat-${requestId}`;
      socket.leave(roomName);
      console.log(`User ${socket.userId} left chat room ${roomName}`);
    });

    // Send a message
    socket.on('send-message', async ({ requestId, content, receiverId }) => {
      try {
        if (!socket.userId) return;

        // Verify user has access to this request
        const request = await prisma.helpRequest.findUnique({
          where: { id: requestId },
          include: {
            requester: { select: { id: true } },
            helper: { select: { id: true } }
          }
        });

        if (!request) {
          socket.emit('error', { message: 'Request not found' });
          return;
        }

        // Check if user is requester or helper
        const canAccess = request.requester.id === socket.userId || 
                         (request.helper && request.helper.id === socket.userId);

        if (!canAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Verify receiver is the other participant
        const expectedReceiver = request.requester.id === socket.userId ? 
          request.helper?.id : request.requester.id;

        if (receiverId !== expectedReceiver) {
          socket.emit('error', { message: 'Invalid receiver' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId,
            receiverId: receiverId,
            requestId: requestId,
            content: content,
            messageType: 'text'
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePhoto: true
              }
            }
          }
        });

        // Emit message to all users in the chat room
        const roomName = `chat-${requestId}`;
        io.to(roomName).emit('new-message', message);

        console.log(`Message sent in room ${roomName} by user ${socket.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ requestId, receiverId, isTyping }) => {
      if (!socket.userId) return;

      const roomName = `chat-${requestId}`;
      
      // Emit typing indicator to other users in the room
      socket.to(roomName).emit('typing', {
        userId: socket.userId,
        isTyping: isTyping
      });
    });

    // Handle user disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Handle connection errors
  io.on('connection_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });
}
