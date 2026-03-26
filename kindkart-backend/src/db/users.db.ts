import { db, generateId, parseJson, stringifyJson } from '../lib/db';
import type { User } from './types';

type NewUserInput = {
  email?: string;
  phone?: string;
  name: string;
  age?: number | null;
  qualification?: string | null;
  certifications?: string[];
  profilePhoto?: string | null;
  isVerified?: boolean;
};

type UpdateUserInput = {
  name?: string;
  age?: number | null;
  qualification?: string | null;
  certifications?: string[];
  profilePhoto?: string | null;
  isVerified?: boolean;
};

function mapUserRow(row: any): User {
  const certifications = parseJson(row.certifications, []);
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    name: row.name,
    age: row.age ?? null,
    qualification: row.qualification ?? null,
    certifications,
    profilePhoto: row.profilePhoto ?? null,
    isVerified: !!row.isVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!row) return null;
  return mapUserRow(row);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return null;
  return mapUserRow(row);
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!row) return null;
  return mapUserRow(row);
}

export async function findUserByIdentifier(email?: string, phone?: string): Promise<User | null> {
  let row: any = null;
  if (email) {
    row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }
  if (!row && phone) {
    row = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  }
  if (!row) return null;
  return mapUserRow(row);
}

export async function createUser(input: NewUserInput): Promise<User> {
  const id = generateId();
  const fallbackEmail = `${id}@kindkart.local`;
  const fallbackPhone = `na_${id}`;
  const emailValue = input.email && input.email.trim().length > 0 ? input.email.trim() : fallbackEmail;
  const phoneValue = input.phone && input.phone.trim().length > 0 ? input.phone.trim() : fallbackPhone;

  db.prepare(
    `INSERT INTO users (id, email, phone, name, age, qualification, certifications, profilePhoto, isVerified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    emailValue,
    phoneValue,
    input.name,
    input.age ?? null,
    input.qualification ?? null,
    stringifyJson(input.certifications || []),
    input.profilePhoto ?? null,
    input.isVerified ? 1 : 0
  );

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return mapUserRow(row);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const updates: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.age !== undefined) {
    updates.push('age = ?');
    values.push(input.age);
  }
  if (input.qualification !== undefined) {
    updates.push('qualification = ?');
    values.push(input.qualification);
  }
  if (input.certifications !== undefined) {
    updates.push('certifications = ?');
    values.push(stringifyJson(input.certifications));
  }
  if (input.profilePhoto !== undefined) {
    updates.push('profilePhoto = ?');
    values.push(input.profilePhoto);
  }
  if (input.isVerified !== undefined) {
    updates.push('isVerified = ?');
    values.push(input.isVerified ? 1 : 0);
  }

  updates.push("updatedAt = datetime('now')");
  values.push(id);

  if (updates.length > 1) {
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return mapUserRow(row);
}

export async function getUserCommunities(userId: string): Promise<any[]> {
  const members: any[] = db
    .prepare(
      "SELECT * FROM community_members WHERE userId = ? AND status = 'approved' ORDER BY joinedAt DESC"
    )
    .all(userId);

  return members.map((m: any) => {
    const community: any = db
      .prepare('SELECT id, name, inviteCode, createdAt FROM communities WHERE id = ?')
      .get(m.communityId);
    return { ...m, community };
  });
}

export async function createGuestUser(): Promise<User> {
  const id = generateId();
  const guestId = `guest_${id}`;
  const guestEmail = `${guestId}@guest.kindkart.local`;
  const guestPhone = `guest_${id}`;

  db.prepare(
    `INSERT INTO users (id, email, phone, name, certifications, isVerified)
     VALUES (?, ?, ?, 'Guest User', '[]', 0)`
  ).run(id, guestEmail, guestPhone);

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return mapUserRow(row);
}

