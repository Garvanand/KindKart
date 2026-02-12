/**
 * Database wrapper that provides Prisma-like interface for SQLite
 * This makes it easier to migrate from Prisma
 */
import { db, generateId, parseJson, stringifyJson } from './db';

// Helper to convert SQLite row to object
function rowToObject(row: any): any {
  if (!row) return null;
  const obj: any = {};
  for (const key in row) {
    // Convert SQLite integer booleans to JavaScript booleans
    if ((key === 'isVerified' || key.includes('is')) && typeof row[key] === 'number') {
      obj[key] = row[key] === 1;
    } else {
      obj[key] = row[key];
    }
  }
  return obj;
}

// Helper to apply select/include to result
function applySelect(result: any, select?: any, include?: any): any {
  if (!result) return result;
  
  if (select) {
    const selected: any = {};
    for (const key in select) {
      if (select[key] === true && result[key] !== undefined) {
        selected[key] = result[key];
      }
    }
    return selected;
  }
  
  return result;
}

// Prisma-like database client (all methods return Promises for async compatibility)
export const prisma = {
  user: {
    findUnique: async (args: { where: { id?: string; email?: string; phone?: string }; select?: any; include?: any }) => {
      const { where, select, include } = args;
      let query = 'SELECT * FROM users WHERE ';
      const conditions: string[] = [];
      const values: any[] = [];

      if (where.id) {
        conditions.push('id = ?');
        values.push(where.id);
      }
      if (where.email) {
        conditions.push('email = ?');
        values.push(where.email);
      }
      if (where.phone) {
        conditions.push('phone = ?');
        values.push(where.phone);
      }

      if (conditions.length === 0) return null;
      query += conditions.join(' AND ');

      const row = db.prepare(query).get(...values);
      if (!row) return null;

      const user = rowToObject(row);
      user.certifications = parseJson(user.certifications, []);
      return applySelect(user, select, include);
    },

    findFirst: async (args: { where?: any; OR?: any[] }) => {
      const { where, OR } = args;
      let query = 'SELECT * FROM users WHERE ';
      const conditions: string[] = [];
      const values: any[] = [];

      if (OR && OR.length > 0) {
        const orConditions: string[] = [];
        OR.forEach((condition: any) => {
          if (condition.email) {
            orConditions.push('email = ?');
            values.push(condition.email);
          }
          if (condition.phone) {
            orConditions.push('phone = ?');
            values.push(condition.phone);
          }
        });
        if (orConditions.length > 0) {
          conditions.push(`(${orConditions.join(' OR ')})`);
        }
      } else if (where) {
        if (where.email) {
          conditions.push('email = ?');
          values.push(where.email);
        }
        if (where.phone) {
          conditions.push('phone = ?');
          values.push(where.phone);
        }
        if (where.id) {
          conditions.push('id = ?');
          values.push(where.id);
        }
      }

      if (conditions.length === 0) return null;
      query += conditions.join(' AND ');

      const row = db.prepare(query).get(...values);
      if (!row) return null;

      const user = rowToObject(row);
      user.certifications = parseJson(user.certifications, []);
      return user;
    },

    create: async (args: { data: any; select?: any; include?: any }) => {
      const { data, select, include } = args;
      const id = generateId();
      const certifications = stringifyJson(data.certifications || []);

      db.prepare(`
        INSERT INTO users (id, email, phone, name, age, qualification, certifications, profilePhoto, isVerified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.email || '',
        data.phone || '',
        data.name,
        data.age || null,
        data.qualification || null,
        certifications,
        data.profilePhoto || null,
        data.isVerified ? 1 : 0
      );

      const user = await prisma.user.findUnique({ where: { id } });
      return applySelect(user, select, include);
    },

    update: async (args: { where: { id: string }; data: any; select?: any }) => {
      const { where, data, select } = args;
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.age !== undefined) {
        updates.push('age = ?');
        values.push(data.age);
      }
      if (data.qualification !== undefined) {
        updates.push('qualification = ?');
        values.push(data.qualification);
      }
      if (data.certifications !== undefined) {
        updates.push('certifications = ?');
        values.push(stringifyJson(data.certifications));
      }
      if (data.profilePhoto !== undefined) {
        updates.push('profilePhoto = ?');
        values.push(data.profilePhoto);
      }
      if (data.isVerified !== undefined) {
        updates.push('isVerified = ?');
        values.push(data.isVerified ? 1 : 0);
      }

      updates.push('updatedAt = datetime("now")');
      values.push(where.id);

      if (updates.length > 1) {
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      }

      const user = await prisma.user.findUnique({ where: { id: where.id } });
      return applySelect(user, select);
    },
  },

  community: {
    findUnique: async (args: { where: { id?: string; inviteCode?: string }; select?: any; include?: any }) => {
      const { where, select, include } = args;
      let query = 'SELECT * FROM communities WHERE ';
      const conditions: string[] = [];
      const values: any[] = [];

      if (where.id) {
        conditions.push('id = ?');
        values.push(where.id);
      }
      if (where.inviteCode) {
        conditions.push('inviteCode = ?');
        values.push(where.inviteCode);
      }

      if (conditions.length === 0) return null;
      query += conditions.join(' AND ');

      const row = db.prepare(query).get(...values);
      if (!row) return null;

      const community = rowToObject(row);
      community.settings = parseJson(community.settings, null);
      
      // Handle include for admin
      if (include?.admin) {
        const admin = await prisma.user.findUnique({ where: { id: community.adminId }, select: include.admin.select });
        community.admin = admin;
      }
      
      return applySelect(community, select, include);
    },

    create: async (args: { data: any; select?: any; include?: any }) => {
      const { data, select, include } = args;
      const id = generateId();
      const settings = data.settings ? stringifyJson(data.settings) : null;

      db.prepare(`
        INSERT INTO communities (id, name, inviteCode, adminId, settings, rules)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.name,
        data.inviteCode,
        data.adminId,
        settings,
        data.rules || null
      );

      const community = await prisma.community.findUnique({ where: { id }, include });
      return applySelect(community, select, include);
    },
  },

  communityMember: {
    findMany: async (args?: { where?: { userId?: string; communityId?: string; status?: string }; include?: any; orderBy?: { joinedAt?: 'asc' | 'desc' } }) => {
      let query = 'SELECT * FROM community_members';
      const conditions: string[] = [];
      const values: any[] = [];

      if (args?.where) {
        if (args.where.userId) {
          conditions.push('userId = ?');
          values.push(args.where.userId);
        }
        if (args.where.communityId) {
          conditions.push('communityId = ?');
          values.push(args.where.communityId);
        }
        if (args.where.status) {
          conditions.push('status = ?');
          values.push(args.where.status);
        }
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      if (args?.orderBy?.joinedAt) {
        query += ` ORDER BY joinedAt ${args.orderBy.joinedAt.toUpperCase()}`;
      }

      const rows = db.prepare(query).all(...values);
      const members = rows.map(rowToObject);

      if (args?.include?.community) {
        for (const member of members) {
          member.community = await prisma.community.findUnique({
            where: { id: member.communityId },
            select: args.include.community.select,
          });
        }
      }

      return members;
    },

    findFirst: async (args: { where: { userId: string; communityId?: string; role?: string; status?: string } }) => {
      const { where } = args;
      let query = 'SELECT * FROM community_members WHERE userId = ?';
      const values: any[] = [where.userId];
      
      if (where.communityId) {
        query += ' AND communityId = ?';
        values.push(where.communityId);
      }

      if (where.role) {
        query += ' AND role = ?';
        values.push(where.role);
      }
      
      if (where.status) {
        query += ' AND status = ?';
        values.push(where.status);
      }
      
      const row = db.prepare(query).get(...values);
      return row ? rowToObject(row) : null;
    },

    create: async (args: { data: any }) => {
      const { data } = args;
      const id = generateId();

      db.prepare(`
        INSERT INTO community_members (id, communityId, userId, role, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        id,
        data.communityId,
        data.userId,
        data.role || 'member',
        data.status || 'pending'
      );

      return await prisma.communityMember.findFirst({
        where: { userId: data.userId, communityId: data.communityId }
      });
    },

      update: async (args: { where: { id: string }; data: any }) => {
        const { where, data } = args;
        const updates: string[] = [];
        const values: any[] = [];

        if (data.role !== undefined) {
          updates.push('role = ?');
          values.push(data.role);
        }
        if (data.status !== undefined) {
          updates.push('status = ?');
          values.push(data.status);
        }

        values.push(where.id);

        if (updates.length > 0) {
          db.prepare(`UPDATE community_members SET ${updates.join(', ')} WHERE id = ?`).run(...values);
        }

        const row = db.prepare('SELECT * FROM community_members WHERE id = ?').get(where.id);
        return row ? rowToObject(row) : null;
      },

      delete: async (args: { where: { id: string } }) => {
        const { where } = args;
        db.prepare('DELETE FROM community_members WHERE id = ?').run(where.id);
        return { id: where.id };
      },
    },

  helpRequest: {
    findMany: async (args?: { where?: { communityId?: string; requesterId?: string; status?: string }; include?: any }) => {
      let query = 'SELECT * FROM help_requests';
      const conditions: string[] = [];
      const values: any[] = [];

      if (args?.where) {
        if (args.where.communityId) {
          conditions.push('communityId = ?');
          values.push(args.where.communityId);
        }
        if (args.where.requesterId) {
          conditions.push('requesterId = ?');
          values.push(args.where.requesterId);
        }
        if (args.where.status) {
          conditions.push('status = ?');
          values.push(args.where.status);
        }
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY createdAt DESC';

      const rows = db.prepare(query).all(...values);
      const requests = rows.map((row: any) => {
        const request = rowToObject(row);
        request.attachments = parseJson(request.attachments, []);
        return request;
      });

      // Handle include
      if (args?.include) {
        for (const request of requests) {
          if (args.include.requester) {
            request.requester = await prisma.user.findUnique({ 
              where: { id: request.requesterId },
              select: args.include.requester.select 
            });
          }
          if (args.include.community) {
            request.community = await prisma.community.findUnique({ 
              where: { id: request.communityId },
              select: args.include.community.select 
            });
          }
        }
      }

      return requests;
    },

    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const { where, include } = args;
      const row = db.prepare('SELECT * FROM help_requests WHERE id = ?').get(where.id);
      if (!row) return null;

      const request = rowToObject(row);
      request.attachments = parseJson(request.attachments, []);

      // Handle include
      if (include) {
        if (include.requester) {
          request.requester = await prisma.user.findUnique({ 
            where: { id: request.requesterId },
            select: include.requester.select 
          });
        }
        if (include.community) {
          request.community = await prisma.community.findUnique({ 
            where: { id: request.communityId },
            select: include.community.select 
          });
        }
      }

      return request;
    },

    create: async (args: { data: any; include?: any }) => {
      const { data, include } = args;
      const id = generateId();
      const attachments = stringifyJson(data.attachments || []);

      db.prepare(`
        INSERT INTO help_requests (id, requesterId, communityId, title, description, category, status, helperId, location, timing, privacyLevel, attachments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.requesterId,
        data.communityId,
        data.title,
        data.description,
        data.category,
        data.status || 'pending',
        data.helperId || null,
        data.location || null,
        data.timing || null,
        data.privacyLevel || 'community',
        attachments
      );

      return await prisma.helpRequest.findUnique({ where: { id }, include });
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const { where, data } = args;
      const updates: string[] = [];
      const values: any[] = [];

      Object.keys(data).forEach(key => {
        if (key === 'attachments') {
          updates.push('attachments = ?');
          values.push(stringifyJson(data[key]));
        } else if (data[key] !== undefined && data[key] !== null) {
          updates.push(`${key} = ?`);
          values.push(data[key]);
        }
      });

      updates.push('updatedAt = datetime("now")');
      values.push(where.id);

      if (updates.length > 1) {
        db.prepare(`UPDATE help_requests SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      }

      return await prisma.helpRequest.findUnique({ where: { id: where.id } });
    },
  },

  userReputation: {
    findUnique: async (args: { where: { userId: string; communityId?: string } }) => {
      const { where } = args;
      let query = 'SELECT * FROM user_reputations WHERE userId = ?';
      const values: any[] = [where.userId];
      
      if (where.communityId) {
        query += ' AND communityId = ?';
        values.push(where.communityId);
      }

      const row = db.prepare(query).get(...values);
      if (!row) return null;

      const reputation = rowToObject(row);
      reputation.badges = parseJson(reputation.badges, []);
      return reputation;
    },

    create: async (args: { data: any }) => {
      const { data } = args;
      const id = generateId();
      
      db.prepare(`
        INSERT INTO user_reputations (id, userId, communityId, totalPoints, helperScore, requesterScore, badges, rank)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.userId,
        data.communityId || '',
        data.totalPoints || data.totalCredits || 0,
        data.helperScore || data.helperCredits || 0,
        data.requesterScore || data.requesterCredits || 0,
        stringifyJson(data.badges || []),
        data.rank || null
      );

      return await prisma.userReputation.findUnique({ where: { userId: data.userId, communityId: data.communityId || '' } });
    },

    update: async (args: { where: { userId: string }; data: any }) => {
      const { where, data } = args;
      
      // Get current reputation
      const current = await prisma.userReputation.findUnique({ where: { userId: where.userId } });
      if (!current) {
        return await prisma.userReputation.create({ 
          data: { 
            userId: where.userId, 
            totalPoints: 0,
            helperScore: 0,
            requesterScore: 0
          } 
        });
      }

      const updates: string[] = [];
      const values: any[] = [];

      // Handle increment operations
      if (data.totalPoints?.increment !== undefined) {
        updates.push('totalPoints = totalPoints + ?');
        values.push(data.totalPoints.increment);
      } else if (data.totalPoints !== undefined) {
        updates.push('totalPoints = ?');
        values.push(data.totalPoints);
      }

      if (data.totalCredits?.increment !== undefined) {
        updates.push('totalPoints = totalPoints + ?');
        values.push(data.totalCredits.increment);
      }

      if (data.helperScore?.increment !== undefined) {
        updates.push('helperScore = helperScore + ?');
        values.push(data.helperScore.increment);
      } else if (data.helperScore !== undefined) {
        updates.push('helperScore = ?');
        values.push(data.helperScore);
      }

      if (data.helperCredits?.increment !== undefined) {
        updates.push('helperScore = helperScore + ?');
        values.push(data.helperCredits.increment);
      }

      if (data.requesterScore?.increment !== undefined) {
        updates.push('requesterScore = requesterScore + ?');
        values.push(data.requesterScore.increment);
      } else if (data.requesterScore !== undefined) {
        updates.push('requesterScore = ?');
        values.push(data.requesterScore);
      }

      if (data.requesterCredits?.increment !== undefined) {
        updates.push('requesterScore = requesterScore + ?');
        values.push(data.requesterCredits.increment);
      }

      if (data.badges !== undefined) {
        updates.push('badges = ?');
        values.push(stringifyJson(data.badges));
      }

      if (data.level !== undefined) {
        updates.push('rank = ?'); // Using rank field for level
        values.push(data.level);
      }

      if (data.rank !== undefined) {
        updates.push('rank = ?');
        values.push(data.rank);
      }

      updates.push('updatedAt = datetime("now")');
      values.push(where.userId);

      if (updates.length > 1) {
        db.prepare(`UPDATE user_reputations SET ${updates.join(', ')} WHERE userId = ?`).run(...values);
      }

      return await prisma.userReputation.findUnique({ where: { userId: where.userId } });
    },

    upsert: async (args: { where: { userId: string; communityId: string }; create: any; update: any }) => {
      const { where, create, update } = args;
      const existing = await prisma.userReputation.findUnique({ where });

      if (existing) {
        return await prisma.userReputation.update({ where: { userId: where.userId }, data: update });
      } else {
        return await prisma.userReputation.create({ 
          data: { 
            ...create, 
            userId: where.userId, 
            communityId: where.communityId 
          } 
        });
      }
    },
  },

  message: {
    findMany: async (args: { where: { requestId?: string; senderId?: string; receiverId?: string }; include?: any }) => {
      let query = 'SELECT * FROM messages';
      const conditions: string[] = [];
      const values: any[] = [];

      if (args.where.requestId) {
        conditions.push('requestId = ?');
        values.push(args.where.requestId);
      }
      if (args.where.senderId) {
        conditions.push('senderId = ?');
        values.push(args.where.senderId);
      }
      if (args.where.receiverId) {
        conditions.push('receiverId = ?');
        values.push(args.where.receiverId);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY createdAt ASC';

      const rows = db.prepare(query).all(...values);

      const messages = [];
      for (const row of rows) {
        const message = rowToObject(row);
        if (args.include?.sender) {
          message.sender = await prisma.user.findUnique({
            where: { id: message.senderId },
            select: args.include.sender.select,
          });
        }
        messages.push(message);
      }

      return messages;
    },

    create: async (args: { data: any; include?: any }) => {
      const { data, include } = args;
      const id = generateId();

      db.prepare(
        `INSERT INTO messages (id, senderId, receiverId, requestId, content, messageType, attachments)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        data.senderId,
        data.receiverId,
        data.requestId,
        data.content,
        data.messageType || 'text',
        stringifyJson(data.attachments || [])
      );

      const message = await prisma.message.findUnique({
        where: { id },
        include,
      });
      return message;
    },

    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const { where, include } = args;
      const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(where.id);
      if (!row) return null;
      const message = rowToObject(row);
      if (include?.sender) {
        message.sender = await prisma.user.findUnique({
          where: { id: message.senderId },
          select: include.sender.select,
        });
      }
      return message;
    },
  },
};
