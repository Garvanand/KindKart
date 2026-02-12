import { Request, Response } from 'express';
import { db, generateId, parseJson, stringifyJson } from '../lib/db';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

function rowToObject(row: any): any {
  if (!row) return null;
  const obj: any = {};
  for (const key in row) obj[key] = row[key];
  return obj;
}

async function attachRequestIncludes(request: any): Promise<any> {
  if (!request) return null;
  request.attachments = parseJson(request.attachments, []);
  const requester: any = db.prepare('SELECT id, name, email, profilePhoto, qualification FROM users WHERE id = ?').get(request.requesterId);
  request.requester = requester || null;
  if (request.helperId) {
    const helper: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(request.helperId);
    request.helper = helper || null;
  } else {
    request.helper = null;
  }
  const community: any = db.prepare('SELECT id, name FROM communities WHERE id = ?').get(request.communityId);
  request.community = community || null;
  // Attach responses
  const responses: any[] = db.prepare('SELECT * FROM request_responses WHERE requestId = ? ORDER BY createdAt DESC').all(request.id);
  request.responses = responses.map((r: any) => {
    const resp = rowToObject(r);
    const h: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(r.helperId);
    resp.helper = h || null;
    return resp;
  });
  return request;
}

export const requestController = {
  createRequest: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { title, description, category, communityId, location, timing, privacyLevel = 'community' } = req.body;
      if (!title || !description || !category || !communityId) {
        res.status(400).json({ error: 'Missing required fields' }); return;
      }
      const membership: any = db.prepare("SELECT id FROM community_members WHERE userId = ? AND communityId = ? AND status = 'approved'").get(req.user.id, communityId);
      if (!membership) { res.status(403).json({ error: 'You must be a member of this community' }); return; }
      
      const id = generateId();
      db.prepare(
        `INSERT INTO help_requests (id, requesterId, communityId, title, description, category, status, location, timing, privacyLevel, attachments) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, '[]')`
      ).run(id, req.user.id, communityId, title, description, category, location || null, timing || null, privacyLevel);
      
      const row: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      const request = await attachRequestIncludes(rowToObject(row));
      res.status(201).json({ message: 'Help request created successfully', request });
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({ error: 'Failed to create request' });
    }
  },

  getRequestsByCommunity: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const communityId = req.params.communityId as string;
      const membership: any = db.prepare("SELECT id FROM community_members WHERE userId = ? AND communityId = ? AND status = 'approved'").get(req.user.id, communityId);
      if (!membership) { res.status(403).json({ error: 'You must be a member' }); return; }
      
      const rows: any[] = db.prepare('SELECT * FROM help_requests WHERE communityId = ? ORDER BY createdAt DESC').all(communityId);
      const requests = [];
      for (const row of rows) {
        requests.push(await attachRequestIncludes(rowToObject(row)));
      }
      res.json(requests);
    } catch (error) {
      console.error('Get requests error:', error);
      res.status(500).json({ error: 'Failed to get requests' });
    }
  },

  getRequest: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params as { id: string };
      const row: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      if (!row) { res.status(404).json({ error: 'Request not found' }); return; }
      const request = await attachRequestIncludes(rowToObject(row));
      res.json(request);
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({ error: 'Failed to get request' });
    }
  },

  respondToRequest: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params as { id: string };
      const { message } = req.body;
      if (!message) { res.status(400).json({ error: 'Message is required' }); return; }
      
      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
      if (request.status !== 'pending') { res.status(400).json({ error: 'Request no longer accepting responses' }); return; }
      if (request.requesterId === req.user.id) { res.status(400).json({ error: 'Cannot respond to own request' }); return; }
      
      const existing: any = db.prepare('SELECT id FROM request_responses WHERE requestId = ? AND helperId = ?').get(id, req.user.id);
      if (existing) { res.status(400).json({ error: 'Already responded' }); return; }
      
      const responseId = generateId();
      db.prepare('INSERT INTO request_responses (id, requestId, helperId, message, status) VALUES (?, ?, ?, ?, ?)').run(responseId, id, req.user.id, message, 'pending');
      
      const response = rowToObject(db.prepare('SELECT * FROM request_responses WHERE id = ?').get(responseId));
      const helper: any = db.prepare('SELECT id, name, profilePhoto FROM users WHERE id = ?').get(req.user.id);
      response.helper = helper;
      
      res.status(201).json({ message: 'Response submitted successfully', response });
    } catch (error) {
      console.error('Respond to request error:', error);
      res.status(500).json({ error: 'Failed to respond' });
    }
  },

  acceptResponse: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params as { id: string };
      const { responseId } = req.body;
      if (!responseId) { res.status(400).json({ error: 'Response ID required' }); return; }
      
      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
      if (request.requesterId !== req.user.id) { res.status(403).json({ error: 'Only requester can accept' }); return; }
      if (request.status !== 'pending') { res.status(400).json({ error: 'Request no longer pending' }); return; }
      
      const response: any = db.prepare('SELECT * FROM request_responses WHERE id = ? AND requestId = ?').get(responseId, id);
      if (!response) { res.status(404).json({ error: 'Response not found' }); return; }
      
      db.prepare("UPDATE help_requests SET status = 'accepted', helperId = ?, updatedAt = datetime('now') WHERE id = ?").run(response.helperId, id);
      db.prepare("UPDATE request_responses SET status = 'accepted' WHERE id = ?").run(responseId);
      
      const updated: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      const result = await attachRequestIncludes(rowToObject(updated));
      res.json({ message: 'Response accepted successfully', request: result });
    } catch (error) {
      console.error('Accept response error:', error);
      res.status(500).json({ error: 'Failed to accept response' });
    }
  },

  updateRequestStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params as { id: string };
      const { status } = req.body;
      if (!status) { res.status(400).json({ error: 'Status required' }); return; }
      
      const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
      
      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
      if (request.requesterId !== req.user.id && request.helperId !== req.user.id) {
        res.status(403).json({ error: 'Permission denied' }); return;
      }
      
      db.prepare("UPDATE help_requests SET status = ?, updatedAt = datetime('now') WHERE id = ?").run(status, id);
      const updated: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      const result = await attachRequestIncludes(rowToObject(updated));
      res.json({ message: 'Status updated', request: result });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  },

  getUserRequests: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const rows: any[] = db.prepare('SELECT * FROM help_requests WHERE requesterId = ? ORDER BY createdAt DESC').all(req.user.id);
      const requests = [];
      for (const row of rows) {
        requests.push(await attachRequestIncludes(rowToObject(row)));
      }
      res.json(requests);
    } catch (error) {
      console.error('Get user requests error:', error);
      res.status(500).json({ error: 'Failed to get requests' });
    }
  },

  getMyResponses: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const rows: any[] = db.prepare('SELECT * FROM request_responses WHERE helperId = ? ORDER BY createdAt DESC').all(req.user.id);
      const responses = [];
      for (const row of rows) {
        const resp = rowToObject(row);
        const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(resp.requestId);
        if (request) {
          resp.request = await attachRequestIncludes(rowToObject(request));
        }
        responses.push(resp);
      }
      res.json(responses);
    } catch (error) {
      console.error('Get my responses error:', error);
      res.status(500).json({ error: 'Failed to get responses' });
    }
  },

  completeRequest: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Authentication required' }); return; }
      const { id } = req.params as { id: string };
      const request: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      if (!request) { res.status(404).json({ error: 'Request not found' }); return; }
      if (request.requesterId !== req.user.id && request.helperId !== req.user.id) {
        res.status(403).json({ error: 'Permission denied' }); return;
      }
      
      db.prepare("UPDATE help_requests SET status = 'completed', updatedAt = datetime('now') WHERE id = ?").run(id);
      const updated: any = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
      const result = await attachRequestIncludes(rowToObject(updated));
      res.json({ message: 'Request completed', request: result });
    } catch (error) {
      console.error('Complete request error:', error);
      res.status(500).json({ error: 'Failed to complete request' });
    }
  }
};
