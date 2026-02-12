import { Request, Response } from 'express';
import { db, generateId, parseJson, stringifyJson } from '../lib/db';
import { createNotification } from './notificationController';

interface AuthRequest extends Request {
  user?: { id: string; email: string; phone: string };
}

function rowToObject(row: any): any {
  if (!row) return null;
  const obj: any = {};
  for (const key in row) {
    if (typeof row[key] === 'number' && (key.startsWith('is') || key === 'maxParticipants' || key === 'payment')) {
      if (key.startsWith('is')) obj[key] = row[key] === 1;
      else obj[key] = row[key];
    } else obj[key] = row[key];
  }
  return obj;
}

export const taskController = {
  createTask: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId, title, description, category, priority, isRecurring, recurrencePattern, scheduledDate, scheduledTime, maxParticipants, payment, tags } = req.body;
      if (!communityId || !title || !description || !category) {
        res.status(400).json({ error: 'Required fields missing' }); return;
      }
      const id = generateId();
      db.prepare(
        `INSERT INTO community_tasks (id, communityId, creatorId, title, description, category, priority, isRecurring, recurrencePattern, scheduledDate, scheduledTime, maxParticipants, payment, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(id, communityId, req.user.id, title, description, category, priority || 'medium', isRecurring ? 1 : 0, recurrencePattern || null, scheduledDate || null, scheduledTime || null, maxParticipants || 1, payment || 0, stringifyJson(tags || []));
      const task = rowToObject(db.prepare('SELECT * FROM community_tasks WHERE id = ?').get(id));
      if (task) task.tags = parseJson(task.tags, []);
      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  getTasks: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { communityId } = req.params as { communityId: string };
      const status = req.query.status as string;
      let query = 'SELECT ct.*, u.name as creatorName FROM community_tasks ct JOIN users u ON ct.creatorId = u.id WHERE ct.communityId = ?';
      const params: any[] = [communityId];
      if (status) { query += ' AND ct.status = ?'; params.push(status); }
      query += ' ORDER BY ct.createdAt DESC';
      const rows = db.prepare(query).all(...params);
      const tasks = rows.map((r: any) => { const t = rowToObject(r); t.tags = parseJson(t.tags, []); return t; });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  },

  applyForTask: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { taskId } = req.params as { taskId: string };
      const { message } = req.body;
      const id = generateId();
      db.prepare(
        'INSERT INTO task_applications (id, taskId, userId, message) VALUES (?, ?, ?, ?)'
      ).run(id, taskId, req.user.id, message || null);

      // Notify task creator
      const task: any = db.prepare('SELECT * FROM community_tasks WHERE id = ?').get(taskId);
      if (task) {
        const applicant: any = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
        createNotification(task.creatorId, 'task_application', 'New Task Application', `${applicant?.name || 'Someone'} applied for: ${task.title}`, task.communityId, { taskId });
      }
      res.status(201).json({ message: 'Application submitted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to apply for task' });
    }
  },

  getApplications: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { taskId } = req.params as { taskId: string };
      const rows = db.prepare(
        'SELECT ta.*, u.name as userName, u.profilePhoto FROM task_applications ta JOIN users u ON ta.userId = u.id WHERE ta.taskId = ? ORDER BY ta.createdAt DESC'
      ).all(taskId);
      res.json(rows.map((r: any) => rowToObject(r)));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get applications' });
    }
  },

  updateApplicationStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { applicationId } = req.params as { applicationId: string };
      const { status } = req.body;
      db.prepare('UPDATE task_applications SET status = ? WHERE id = ?').run(status, applicationId);
      
      if (status === 'accepted') {
        const app: any = db.prepare('SELECT ta.*, ct.title, ct.communityId FROM task_applications ta JOIN community_tasks ct ON ta.taskId = ct.id WHERE ta.id = ?').get(applicationId);
        if (app) {
          createNotification(app.userId, 'task_accepted', 'Task Application Accepted', `Your application for "${app.title}" was accepted!`, app.communityId, { taskId: app.taskId });
          db.prepare("UPDATE community_tasks SET status = 'in_progress' WHERE id = ?").run(app.taskId);
        }
      }
      res.json({ message: 'Application updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update application' });
    }
  },

  updateTaskStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Auth required' }); return; }
      const { taskId } = req.params as { taskId: string };
      const { status } = req.body;
      db.prepare("UPDATE community_tasks SET status = ?, updatedAt = datetime('now') WHERE id = ?").run(status, taskId);
      res.json({ message: 'Task updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task' });
    }
  },
};
