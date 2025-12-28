import Database from 'better-sqlite3';
import { Entry, Cookie } from '@/app/types';
import path from 'path';
import fs from 'fs';

// Database file path
const dbPath = path.join(process.cwd(), 'data', 'cookies.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY,
        website TEXT NOT NULL,
        username TEXT,
        password TEXT,
        createdAt INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS cookies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entryId INTEGER NOT NULL,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        domain TEXT,
        httpOnly INTEGER DEFAULT 0,
        secure INTEGER DEFAULT 0,
        sameSite TEXT,
        prioritas TEXT,
        FOREIGN KEY (entryId) REFERENCES entries(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_entries_createdAt ON entries(createdAt);
      CREATE INDEX IF NOT EXISTS idx_cookies_entryId ON cookies(entryId);
    `);
  }
  return db;
}

// Convert Entry to database format
function entryToDb(entry: Entry): { entry: any; cookies: any[] } {
  return {
    entry: {
      id: entry.id,
      website: entry.website,
      username: entry.username || null,
      password: entry.password || null,
      createdAt: entry.createdAt,
    },
    cookies: entry.cookies.map((cookie) => ({
      entryId: entry.id,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || null,
      httpOnly: cookie.httpOnly ? 1 : 0,
      secure: cookie.secure ? 1 : 0,
      sameSite: cookie.sameSite || null,
      prioritas: cookie.prioritas || null,
    })),
  };
}

// Convert database row to Entry
function dbToEntry(row: any, cookies: any[]): Entry {
  return {
    id: row.id,
    website: row.website,
    username: row.username || undefined,
    password: row.password || undefined,
    createdAt: row.createdAt,
    cookies: cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain || undefined,
      httpOnly: c.httpOnly === 1,
      secure: c.secure === 1,
      sameSite: (c.sameSite as 'Strict' | 'Lax' | 'None') || undefined,
      prioritas: c.prioritas || undefined,
    })),
  };
}

export function getAllEntries(): Entry[] {
  const database = getDb();
  const ONE_HOUR_MS = 3600000;
  const now = Date.now();
  const cutoffTime = now - ONE_HOUR_MS;

  // Get all active entries (within 1 hour)
  const entryRows = database
    .prepare('SELECT * FROM entries WHERE createdAt > ? ORDER BY createdAt DESC')
    .all(cutoffTime) as any[];

  const entries: Entry[] = [];

  for (const row of entryRows) {
    const cookies = database
      .prepare('SELECT * FROM cookies WHERE entryId = ?')
      .all(row.id) as any[];
    
    entries.push(dbToEntry(row, cookies));
  }

  return entries;
}

export function getEntryById(id: number): Entry | null {
  const database = getDb();
  const entryRow = database.prepare('SELECT * FROM entries WHERE id = ?').get(id) as any;
  
  if (!entryRow) return null;

  const cookies = database
    .prepare('SELECT * FROM cookies WHERE entryId = ?')
    .all(id) as any[];

  return dbToEntry(entryRow, cookies);
}

export function addEntry(entry: Entry): Entry {
  const database = getDb();
  const { entry: entryData, cookies: cookiesData } = entryToDb(entry);

  const transaction = database.transaction(() => {
    // Insert entry
    database
      .prepare(
        'INSERT INTO entries (id, website, username, password, createdAt) VALUES (?, ?, ?, ?, ?)'
      )
      .run(
        entryData.id,
        entryData.website,
        entryData.username,
        entryData.password,
        entryData.createdAt
      );

    // Insert cookies
    const insertCookie = database.prepare(
      'INSERT INTO cookies (entryId, name, value, domain, httpOnly, secure, sameSite, prioritas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    for (const cookie of cookiesData) {
      insertCookie.run(
        cookie.entryId,
        cookie.name,
        cookie.value,
        cookie.domain,
        cookie.httpOnly,
        cookie.secure,
        cookie.sameSite,
        cookie.prioritas
      );
    }
  });

  transaction();

  return entry;
}

export function deleteEntry(id: number): boolean {
  const database = getDb();
  const result = database.prepare('DELETE FROM entries WHERE id = ?').run(id);
  return result.changes > 0;
}

export function deleteExpiredEntries(): number {
  const database = getDb();
  const ONE_HOUR_MS = 3600000;
  const now = Date.now();
  const cutoffTime = now - ONE_HOUR_MS;

  const result = database
    .prepare('DELETE FROM entries WHERE createdAt <= ?')
    .run(cutoffTime);
  
  return result.changes;
}

// Cleanup function
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

