import Database from 'better-sqlite3';
import type { Database as BetterSqliteDatabase } from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// Database file path
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'kindkart.db');

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db: BetterSqliteDatabase = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Better concurrency

// Initialize schema
export function initDatabase() {
  console.log('📦 Initializing SQLite database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      qualification TEXT,
      certifications TEXT DEFAULT '[]',
      profilePhoto TEXT,
      isVerified INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Communities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      inviteCode TEXT UNIQUE NOT NULL,
      adminId TEXT NOT NULL,
      settings TEXT,
      rules TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Community members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_members (
      id TEXT PRIMARY KEY,
      communityId TEXT NOT NULL,
      userId TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      status TEXT DEFAULT 'pending',
      joinedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(communityId, userId),
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Help requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS help_requests (
      id TEXT PRIMARY KEY,
      requesterId TEXT NOT NULL,
      communityId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      helperId TEXT,
      location TEXT,
      timing TEXT,
      privacyLevel TEXT DEFAULT 'community',
      attachments TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (requesterId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
      FOREIGN KEY (helperId) REFERENCES users(id)
    )
  `);

  // Request responses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_responses (
      id TEXT PRIMARY KEY,
      requestId TEXT NOT NULL,
      helperId TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (requestId) REFERENCES help_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (helperId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      requestId TEXT NOT NULL,
      content TEXT NOT NULL,
      messageType TEXT DEFAULT 'text',
      attachments TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (requestId) REFERENCES help_requests(id) ON DELETE CASCADE
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      requestId TEXT NOT NULL,
      payerId TEXT NOT NULL,
      payeeId TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      paymentGatewayId TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      completedAt TEXT,
      FOREIGN KEY (requestId) REFERENCES help_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (payerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (payeeId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Escrow holds table
  db.exec(`
    CREATE TABLE IF NOT EXISTS escrow_holds (
      id TEXT PRIMARY KEY,
      transactionId TEXT NOT NULL,
      releaseTime TEXT NOT NULL,
      verificationProof TEXT,
      status TEXT DEFAULT 'held',
      FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE
    )
  `);

  // User reputations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_reputations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      communityId TEXT NOT NULL,
      totalPoints INTEGER DEFAULT 0,
      helperScore INTEGER DEFAULT 0,
      requesterScore INTEGER DEFAULT 0,
      badges TEXT DEFAULT '[]',
      rank INTEGER,
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(userId, communityId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE
    )
  `);

  // Badge assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS badge_assignments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      communityId TEXT NOT NULL,
      badgeType TEXT NOT NULL,
      earnedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE
    )
  `);

  // Leaderboards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboards (
      id TEXT PRIMARY KEY,
      communityId TEXT NOT NULL,
      period TEXT NOT NULL,
      rankings TEXT NOT NULL,
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(communityId, period),
      FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE
    )
  `);

    // Notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        communityId TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT DEFAULT '{}',
        isRead INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Emergency alerts table
    db.exec(`
      CREATE TABLE IF NOT EXISTS emergency_alerts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        communityId TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'general',
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        location TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        resolvedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE
      )
    `);

    // Emergency responses table
    db.exec(`
      CREATE TABLE IF NOT EXISTS emergency_responses (
        id TEXT PRIMARY KEY,
        alertId TEXT NOT NULL,
        userId TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'safe',
        message TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (alertId) REFERENCES emergency_alerts(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Community tasks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS community_tasks (
        id TEXT PRIMARY KEY,
        communityId TEXT NOT NULL,
        creatorId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        isRecurring INTEGER DEFAULT 0,
        recurrencePattern TEXT,
        scheduledDate TEXT,
        scheduledTime TEXT,
        maxParticipants INTEGER DEFAULT 1,
        payment REAL DEFAULT 0,
        tags TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
        FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Task applications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS task_applications (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        userId TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        message TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (taskId) REFERENCES community_tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(taskId, userId)
      )
    `);

    // User skills table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        isVerified INTEGER DEFAULT 0,
        verifiedBy TEXT,
        verifiedAt TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verifiedBy) REFERENCES users(id)
      )
    `);

    // Weekly challenges table
    db.exec(`
      CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        communityId TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        target INTEGER NOT NULL DEFAULT 1,
        rewardPoints INTEGER NOT NULL DEFAULT 10,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `);

    // Challenge progress table
    db.exec(`
      CREATE TABLE IF NOT EXISTS challenge_progress (
        id TEXT PRIMARY KEY,
        challengeId TEXT NOT NULL,
        userId TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        isCompleted INTEGER DEFAULT 0,
        completedAt TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (challengeId) REFERENCES challenges(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(challengeId, userId)
      )
    `);

    // User streaks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'daily_help',
        currentStreak INTEGER DEFAULT 0,
        longestStreak INTEGER DEFAULT 0,
        lastActivityDate TEXT,
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, type)
      )
    `);

    // Karma shop items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS karma_shop_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cost INTEGER NOT NULL,
        category TEXT NOT NULL,
        imageUrl TEXT,
        stock INTEGER DEFAULT -1,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `);

    // Karma redemptions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS karma_redemptions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        itemId TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        redeemedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (itemId) REFERENCES karma_shop_items(id) ON DELETE CASCADE
      )
    `);

    // Tour completion table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tour_completions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        tourId TEXT NOT NULL,
        completedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, tourId)
      )
    `);

    // Community events table
    db.exec(`
      CREATE TABLE IF NOT EXISTS community_events (
        id TEXT PRIMARY KEY,
        communityId TEXT NOT NULL,
        creatorId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        eventDate TEXT NOT NULL,
        eventTime TEXT,
        location TEXT,
        maxAttendees INTEGER,
        status TEXT DEFAULT 'upcoming',
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
        FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Event attendees table
    db.exec(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id TEXT PRIMARY KEY,
        eventId TEXT NOT NULL,
        userId TEXT NOT NULL,
        status TEXT DEFAULT 'going',
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (eventId) REFERENCES community_events(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(eventId, userId)
      )
    `);

    // Community announcements table
    db.exec(`
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        communityId TEXT NOT NULL,
        authorId TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        isPinned INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (communityId) REFERENCES communities(id) ON DELETE CASCADE,
        FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(userId);
      CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(communityId);
      CREATE INDEX IF NOT EXISTS idx_help_requests_community ON help_requests(communityId);
      CREATE INDEX IF NOT EXISTS idx_help_requests_requester ON help_requests(requesterId);
      CREATE INDEX IF NOT EXISTS idx_messages_request ON messages(requestId);
      CREATE INDEX IF NOT EXISTS idx_user_reputations_user ON user_reputations(userId);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
      CREATE INDEX IF NOT EXISTS idx_emergency_alerts_community ON emergency_alerts(communityId);
      CREATE INDEX IF NOT EXISTS idx_community_tasks_community ON community_tasks(communityId);
      CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(userId);
    `);

  console.log('✅ Database initialized successfully');
}

// Helper function to generate CUID-like IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper to parse JSON fields
export function parseJson<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

// Helper to stringify JSON fields
export function stringifyJson(value: any): string {
  return JSON.stringify(value || []);
}

// Database instance
export { db };

// Close database connection
export function closeDatabase() {
  db.close();
}





