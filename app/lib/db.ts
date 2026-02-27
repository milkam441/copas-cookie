import Database from 'better-sqlite3';
import { Entry, Cookie, Preset, PresetCookie } from '@/app/types';
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

function getTableColumns(database: Database.Database, tableName: string): string[] {
  const rows = database.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return rows.map((row) => row.name);
}

function ensurePresetSchema(database: Database.Database) {
  const columns = new Set(getTableColumns(database, 'presets'));

  // Older DBs might have used a different group column name or missed timestamps.
  if (!columns.has('grp')) {
    database.exec("ALTER TABLE presets ADD COLUMN grp TEXT NOT NULL DEFAULT 'other'");
  }

  if (!columns.has('createdAt')) {
    database.exec('ALTER TABLE presets ADD COLUMN createdAt INTEGER NOT NULL DEFAULT 0');
  }

  if (!columns.has('updatedAt')) {
    database.exec('ALTER TABLE presets ADD COLUMN updatedAt INTEGER NOT NULL DEFAULT 0');
  }

  const refreshedColumns = new Set(getTableColumns(database, 'presets'));
  if (refreshedColumns.has('group') && refreshedColumns.has('grp')) {
    database.exec('UPDATE presets SET grp = COALESCE(NULLIF("group", ""), grp)');
  }

  const now = Date.now();
  database
    .prepare('UPDATE presets SET createdAt = ? WHERE createdAt IS NULL OR createdAt = 0')
    .run(now);
  database
    .prepare('UPDATE presets SET updatedAt = createdAt WHERE updatedAt IS NULL OR updatedAt = 0')
    .run();
}

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
      
      CREATE TABLE IF NOT EXISTS presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('simple', 'full', 'credentials')),
        name TEXT NOT NULL,
        grp TEXT NOT NULL DEFAULT 'other',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS preset_cookies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        presetId INTEGER NOT NULL,
        name TEXT NOT NULL,
        domain TEXT,
        httpOnly INTEGER DEFAULT 0,
        secure INTEGER DEFAULT 0,
        sameSite TEXT,
        prioritas TEXT,
        FOREIGN KEY (presetId) REFERENCES presets(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_entries_createdAt ON entries(createdAt);
      CREATE INDEX IF NOT EXISTS idx_cookies_entryId ON cookies(entryId);
      CREATE INDEX IF NOT EXISTS idx_presets_key ON presets(key);
      CREATE INDEX IF NOT EXISTS idx_preset_cookies_presetId ON preset_cookies(presetId);
    `);

    ensurePresetSchema(db);
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

// ========== PRESET FUNCTIONS ==========

function dbToPreset(row: any, cookies: any[]): Preset {
  return {
    id: row.id,
    key: row.key,
    type: row.type,
    name: row.name,
    group: row.grp,
    cookies: cookies.map((c) => ({
      name: c.name,
      domain: c.domain || undefined,
      httpOnly: c.httpOnly === 1,
      secure: c.secure === 1,
      sameSite: (c.sameSite as 'Strict' | 'Lax' | 'None') || undefined,
      prioritas: c.prioritas || undefined,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function getAllPresets(): Preset[] {
  const database = getDb();
  const presetRows = database
    .prepare('SELECT * FROM presets ORDER BY grp, name')
    .all() as any[];

  const presets: Preset[] = [];

  for (const row of presetRows) {
    const cookies = database
      .prepare('SELECT * FROM preset_cookies WHERE presetId = ?')
      .all(row.id) as any[];

    presets.push(dbToPreset(row, cookies));
  }

  return presets;
}

export function getPresetByKey(key: string): Preset | null {
  const database = getDb();
  const presetRow = database.prepare('SELECT * FROM presets WHERE key = ?').get(key) as any;

  if (!presetRow) return null;

  const cookies = database
    .prepare('SELECT * FROM preset_cookies WHERE presetId = ?')
    .all(presetRow.id) as any[];

  return dbToPreset(presetRow, cookies);
}

export function getPresetById(id: number): Preset | null {
  const database = getDb();
  const presetRow = database.prepare('SELECT * FROM presets WHERE id = ?').get(id) as any;

  if (!presetRow) return null;

  const cookies = database
    .prepare('SELECT * FROM preset_cookies WHERE presetId = ?')
    .all(presetRow.id) as any[];

  return dbToPreset(presetRow, cookies);
}

export function addPreset(preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>): Preset {
  const database = getDb();
  const now = Date.now();

  const transaction = database.transaction(() => {
    // Insert preset
    const result = database
      .prepare(
        'INSERT INTO presets (key, type, name, grp, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(preset.key, preset.type, preset.name, preset.group, now, now);

    const presetId = result.lastInsertRowid as number;

    // Insert preset cookies
    const insertCookie = database.prepare(
      'INSERT INTO preset_cookies (presetId, name, domain, httpOnly, secure, sameSite, prioritas) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (const cookie of preset.cookies) {
      insertCookie.run(
        presetId,
        cookie.name,
        cookie.domain || null,
        cookie.httpOnly ? 1 : 0,
        cookie.secure ? 1 : 0,
        cookie.sameSite || null,
        cookie.prioritas || null
      );
    }

    return presetId;
  });

  const presetId = transaction();
  return getPresetById(presetId as number)!;
}

export function updatePreset(
  id: number,
  preset: Omit<Preset, 'id' | 'createdAt' | 'updatedAt'>
): Preset | null {
  const database = getDb();
  const now = Date.now();

  const transaction = database.transaction(() => {
    // Update preset
    database
      .prepare(
        'UPDATE presets SET key = ?, type = ?, name = ?, grp = ?, updatedAt = ? WHERE id = ?'
      )
      .run(preset.key, preset.type, preset.name, preset.group, now, id);

    // Delete old cookies
    database.prepare('DELETE FROM preset_cookies WHERE presetId = ?').run(id);

    // Insert new cookies
    const insertCookie = database.prepare(
      'INSERT INTO preset_cookies (presetId, name, domain, httpOnly, secure, sameSite, prioritas) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (const cookie of preset.cookies) {
      insertCookie.run(
        id,
        cookie.name,
        cookie.domain || null,
        cookie.httpOnly ? 1 : 0,
        cookie.secure ? 1 : 0,
        cookie.sameSite || null,
        cookie.prioritas || null
      );
    }
  });

  transaction();
  return getPresetById(id);
}

export function deletePreset(id: number): boolean {
  const database = getDb();
  const result = database.prepare('DELETE FROM presets WHERE id = ?').run(id);
  return result.changes > 0;
}

