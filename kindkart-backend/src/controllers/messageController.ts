import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
  };
}

export const messageController = {
  // Get messages for a specific request
  getMessagesByRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { requestId } = req.params;

      // Verify user has access to this request
      const request = await prisma.helpRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: { select: { id: true } },
          helper: { select: { id: true } }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if user is requester or helper
      const canAccess = request.requester.id === req.user.id || 
                       (request.helper && request.helper.id === req.user.id);

      if (!canAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get messages for this request
      const messages = await prisma.message.findMany({
        where: { requestId: requestId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.json(messages);
    } catch (error) {
      console.error('Get messages by request error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  // Send a message
  sendMessage: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { requestId, content, receiverId } = req.body;

      if (!requestId || !content || !receiverId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify user has access to this request
      const request = await prisma.helpRequest.findUnique({
        where: { id: requestId },
        include: {
          requester: { select: { id: true } },
          helper: { select: { id: true } }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if user is requester or helper
      const canAccess = request.requester.id === req.user.id || 
                       (request.helper && request.helper.id === req.user.id);

      if (!canAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Verify receiver is the other participant
      const expectedReceiver = request.requester.id === req.user.id ? 
        request.helper?.id : request.requester.id;

      if (receiverId !== expectedReceiver) {
        return res.status(400).json({ error: 'Invalid receiver' });
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          senderId: req.user.id,
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

      res.status(201).json({
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Get user's conversations
  getUserConversations: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get all requests where user is either requester or helper
      const requests = await prisma.helpRequest.findMany({
        where: {
          OR: [
            { requesterId: req.user.id },
            { helperId: req.user.id }
          ],
          status: {
            in: ['accepted', 'in_progress']
          }
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Format conversations
      const conversations = requests.map(request => {
        const otherUser = request.requester.id === req.user!.id ? 
          request.helper : request.requester;

        const lastMessage = request.messages[0];

        return {
          requestId: request.id,
          requestTitle: request.title,
          otherUser: otherUser,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            senderName: lastMessage.sender.name,
            createdAt: lastMessage.createdAt
          } : null,
          updatedAt: request.updatedAt
        };
      });

      res.json(conversations);
    } catch (error) {
      console.error('Get user conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }
};
