import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDbPath(rawPath) {
  if (path.isAbsolute(rawPath)) return rawPath;
  return path.join(__dirname, "..", rawPath);
}

export function openDatabase(dbPathFromEnv) {
  const resolved = resolveDbPath(dbPathFromEnv || "./data/app.db");
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const db = new Database(resolved);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'repair_shop')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

    CREATE TABLE IF NOT EXISTS exchange_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      offer_product TEXT NOT NULL,
      want_product TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_exchange_user ON exchange_posts (user_id);

    CREATE TABLE IF NOT EXISTS resell_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      photos_meta TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_resell_user ON resell_listings (user_id);

    CREATE TABLE IF NOT EXISTS repair_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_repair_user ON repair_requests (user_id);
  `);
  return db;
}

export function findUserByEmail(db, email) {
  return db
    .prepare("SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = ? COLLATE NOCASE")
    .get(email.trim().toLowerCase());
}

export function createUser(db, { email, name, passwordHash, role }) {
  const result = db
    .prepare(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES (@email, @name, @password_hash, @role)`
    )
    .run({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password_hash: passwordHash,
      role,
    });
  return result.lastInsertRowid;
}
