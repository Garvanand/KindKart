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

export const requestController = {
  // Create a new help request
  createRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        title,
        description,
        category,
        communityId,
        location,
        timing,
        privacyLevel = 'community'
      } = req.body;

      // Validate required fields
      if (!title || !description || !category || !communityId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify user is a member of the community
      const membership = await prisma.communityMember.findFirst({
        where: {
          userId: req.user.id,
          communityId: communityId,
          status: 'approved'
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a member of this community to create requests' });
      }

      // Create the request
      const request = await prisma.helpRequest.create({
        data: {
          title,
          description,
          category,
          communityId,
          requesterId: req.user.id,
          location: location || null,
          timing: timing || null,
          privacyLevel,
          status: 'pending'
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              qualification: true
            }
          },
          community: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Help request created successfully',
        request
      });
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({ error: 'Failed to create request' });
    }
  },

  // Get requests by community
  getRequestsByCommunity: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { communityId } = req.params;

      // Verify user is a member of the community
      const membership = await prisma.communityMember.findFirst({
        where: {
          userId: req.user.id,
          communityId: communityId,
          status: 'approved'
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a member of this community to view requests' });
      }

      const requests = await prisma.helpRequest.findMany({
        where: {
          communityId: communityId,
          privacyLevel: {
            in: ['community', 'public']
          }
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              qualification: true
            }
          },
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          responses: {
            include: {
              helper: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(requests);
    } catch (error) {
      console.error('Get requests by community error:', error);
      res.status(500).json({ error: 'Failed to get requests' });
    }
  },

  // Get a specific request
  getRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const request = await prisma.helpRequest.findUnique({
        where: { id },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              qualification: true,
              certifications: true
            }
          },
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          responses: {
            include: {
              helper: {
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
          },
          community: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Verify user has access to this request
      const membership = await prisma.communityMember.findFirst({
        where: {
          userId: req.user.id,
          communityId: request.communityId,
          status: 'approved'
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(request);
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({ error: 'Failed to get request' });
    }
  },

  // Respond to a request
  respondToRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get the request
      const request = await prisma.helpRequest.findUnique({
        where: { id },
        include: {
          community: true
        }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check if request is still open
      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'This request is no longer accepting responses' });
      }

      // Verify user is a member of the community
      const membership = await prisma.communityMember.findFirst({
        where: {
          userId: req.user.id,
          communityId: request.communityId,
          status: 'approved'
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'You must be a member of this community to respond' });
      }

      // Check if user is the requester
      if (request.requesterId === req.user.id) {
        return res.status(400).json({ error: 'You cannot respond to your own request' });
      }

      // Check if user has already responded
      const existingResponse = await prisma.requestResponse.findFirst({
        where: {
          requestId: id,
          helperId: req.user.id
        }
      });

      if (existingResponse) {
        return res.status(400).json({ error: 'You have already responded to this request' });
      }

      // Create the response
      const response = await prisma.requestResponse.create({
        data: {
          requestId: id,
          helperId: req.user.id,
          message,
          status: 'pending'
        },
        include: {
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Response submitted successfully',
        response
      });
    } catch (error) {
      console.error('Respond to request error:', error);
      res.status(500).json({ error: 'Failed to respond to request' });
    }
  },

  // Accept a response (requester only)
  acceptResponse: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { responseId } = req.body;

      if (!responseId) {
        return res.status(400).json({ error: 'Response ID is required' });
      }

      // Get the request
      const request = await prisma.helpRequest.findUnique({
        where: { id }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Verify user is the requester
      if (request.requesterId !== req.user.id) {
        return res.status(403).json({ error: 'Only the requester can accept responses' });
      }

      // Check if request is still pending
      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'This request is no longer accepting responses' });
      }

      // Get the response
      const response = await prisma.requestResponse.findFirst({
        where: {
          id: responseId,
          requestId: id
        }
      });

      if (!response) {
        return res.status(404).json({ error: 'Response not found' });
      }

      // Update the request to accepted status and assign helper
      const updatedRequest = await prisma.helpRequest.update({
        where: { id },
        data: {
          status: 'accepted',
          helperId: response.helperId
        },
        include: {
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      // Update the response status
      await prisma.requestResponse.update({
        where: { id: responseId },
        data: { status: 'accepted' }
      });

      res.json({
        message: 'Response accepted successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Accept response error:', error);
      res.status(500).json({ error: 'Failed to accept response' });
    }
  },

  // Update request status
  updateRequestStatus: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Get the request
      const request = await prisma.helpRequest.findUnique({
        where: { id }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Verify user has permission to update (requester or helper)
      if (request.requesterId !== req.user.id && request.helperId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Update the request status
      const updatedRequest = await prisma.helpRequest.update({
        where: { id },
        data: { status },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true
            }
          },
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      res.json({
        message: 'Request status updated successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Update request status error:', error);
      res.status(500).json({ error: 'Failed to update request status' });
    }
  },

  // Get user's requests
  getUserRequests: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const requests = await prisma.helpRequest.findMany({
        where: {
          requesterId: req.user.id
        },
        include: {
          community: {
            select: {
              id: true,
              name: true
            }
          },
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          responses: {
            include: {
              helper: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(requests);
    } catch (error) {
      console.error('Get user requests error:', error);
      res.status(500).json({ error: 'Failed to get user requests' });
    }
  },

  // Get user's responses
  getMyResponses: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const responses = await prisma.requestResponse.findMany({
        where: {
          helperId: req.user.id
        },
        include: {
          request: {
            include: {
              requester: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true
                }
              },
              community: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(responses);
    } catch (error) {
      console.error('Get my responses error:', error);
      res.status(500).json({ error: 'Failed to get responses' });
    }
  },

  // Complete a request
  completeRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      // Get the request
      const request = await prisma.helpRequest.findUnique({
        where: { id }
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Verify user has permission to complete (requester or helper)
      if (request.requesterId !== req.user.id && request.helperId !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Update the request status to completed
      const updatedRequest = await prisma.helpRequest.update({
        where: { id },
        data: { status: 'completed' },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true
            }
          },
          helper: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      });

      res.json({
        message: 'Request completed successfully',
        request: updatedRequest
      });
    } catch (error) {
      console.error('Complete request error:', error);
      res.status(500).json({ error: 'Failed to complete request' });
    }
  }
};
