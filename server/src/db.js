import { Pool } from "pg";

let pool;
let initPromise;

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Add it to your environment variables.");
  }
  pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
          }
        : false,
  });
  return pool;
}

export async function query(text, params = []) {
  const p = getPool();
  return p.query(text, params);
}

async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'seller', 'repair_shop')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

    CREATE TABLE IF NOT EXISTS exchange_posts (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      offer_product TEXT NOT NULL,
      want_product TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_exchange_user ON exchange_posts (user_id);

    CREATE TABLE IF NOT EXISTS resell_listings (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      photos_meta JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_resell_user ON resell_listings (user_id);

    CREATE TABLE IF NOT EXISTS sell_listings (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      asking_price_inr INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      condition_text TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_sell_user ON sell_listings (user_id);

    CREATE TABLE IF NOT EXISTS repair_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_repair_user ON repair_requests (user_id);

    CREATE TABLE IF NOT EXISTS contact_messages (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages (LOWER(email));

    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      amount_inr INTEGER NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_phone TEXT NOT NULL,
      buyer_address_line1 TEXT NOT NULL,
      buyer_address_line2 TEXT NOT NULL DEFAULT '',
      buyer_city TEXT NOT NULL,
      buyer_state TEXT NOT NULL,
      buyer_pincode TEXT NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'upi', 'cod')),
      payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'pending_cod')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
  `);
}

export async function openDatabase() {
  if (!initPromise) {
    initPromise = initSchema();
  }
  await initPromise;
}

export async function findUserByEmail(email) {
  const result = await query(
    "SELECT id, email, name, password_hash, role, created_at FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email.trim().toLowerCase()]
  );
  return result.rows[0] || null;
}

export async function createUser({ email, name, passwordHash, role }) {
  const result = await query(
    `INSERT INTO users (email, name, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email.trim().toLowerCase(), name.trim(), passwordHash, role]
  );
  return Number(result.rows[0].id);
}
