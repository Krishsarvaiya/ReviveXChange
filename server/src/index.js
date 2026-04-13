import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, openDatabase } from "./db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const SALT_ROUNDS = 12;

if (JWT_SECRET === "dev-only-change-me" && process.env.NODE_ENV === "production") {
  console.error("Set JWT_SECRET in production.");
  process.exit(1);
}

const db = openDatabase(process.env.DATABASE_PATH);
const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

const isProduction = process.env.NODE_ENV === "production";
const localhostOriginRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      if (!isProduction && localhostOriginRe.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "512kb" }));

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["customer", "seller", "repair_shop"]);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const row = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!row) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ user: publicUser(row) });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters." });
    return;
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: "Valid email is required." });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }
  if (typeof role !== "string" || !ROLES.has(role)) {
    res.status(400).json({ error: "Role must be customer, seller, or repair_shop." });
    return;
  }
  if (findUserByEmail(db, email)) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const id = createUser(db, { email, name, passwordHash, role });
  const user = publicUser(
    db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(id)
  );
  const token = signToken(user);
  res.status(201).json({ token, user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }
  const row = findUserByEmail(db, email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  const user = publicUser(row);
  const token = signToken(user);
  res.json({ token, user });
});

function requireUserId(req) {
  const id = Number(req.user?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

app.post("/api/exchange", authMiddleware, (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Invalid session." });
    return;
  }
  const { offerProduct, wantProduct, notes } = req.body || {};
  if (typeof offerProduct !== "string" || offerProduct.trim().length < 2) {
    res.status(400).json({ error: "Describe what you are offering (at least 2 characters)." });
    return;
  }
  if (typeof wantProduct !== "string" || wantProduct.trim().length < 2) {
    res.status(400).json({ error: "Describe what you want in return (at least 2 characters)." });
    return;
  }
  const notesText = typeof notes === "string" ? notes.trim() : "";
  const result = db
    .prepare(
      `INSERT INTO exchange_posts (user_id, offer_product, want_product, notes)
       VALUES (?, ?, ?, ?)`
    )
    .run(userId, offerProduct.trim(), wantProduct.trim(), notesText);
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.post("/api/resell", authMiddleware, (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Invalid session." });
    return;
  }
  const { title, priceInr, description, photosMeta } = req.body || {};
  if (typeof title !== "string" || title.trim().length < 2) {
    res.status(400).json({ error: "Product title is required (at least 2 characters)." });
    return;
  }
  const price = Number(priceInr);
  if (!Number.isFinite(price) || price < 1 || price > 1000000000) {
    res.status(400).json({ error: "Enter a valid price in INR (1–1,000,000,000)." });
    return;
  }
  const desc = typeof description === "string" ? description.trim() : "";
  if (desc.length < 10) {
    res.status(400).json({ error: "Description should be at least 10 characters." });
    return;
  }
  let photosJson = null;
  if (Array.isArray(photosMeta) && photosMeta.length > 0) {
    const safe = photosMeta.slice(0, 6).map((p) => ({
      name: typeof p?.name === "string" ? p.name.slice(0, 200) : "file",
      size: typeof p?.size === "number" && p.size >= 0 ? p.size : 0,
    }));
    photosJson = JSON.stringify(safe);
  }
  const result = db
    .prepare(
      `INSERT INTO resell_listings (user_id, title, price_inr, description, photos_meta)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, title.trim(), Math.round(price), desc, photosJson);
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.post("/api/repair", authMiddleware, (req, res) => {
  const userId = requireUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Invalid session." });
    return;
  }
  const { title, brand, category, description } = req.body || {};
  if (typeof title !== "string" || title.trim().length < 2) {
    res.status(400).json({ error: "Product title is required." });
    return;
  }
  const brandText = typeof brand === "string" ? brand.trim() : "";
  if (typeof category !== "string" || category.trim().length < 1) {
    res.status(400).json({ error: "Please select a category." });
    return;
  }
  const desc = typeof description === "string" ? description.trim() : "";
  if (desc.length < 10) {
    res.status(400).json({ error: "Please describe the issue (at least 10 characters)." });
    return;
  }
  const result = db
    .prepare(
      `INSERT INTO repair_requests (user_id, title, brand, category, description)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, title.trim(), brandText, category.trim(), desc);
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.use((err, _req, res, _next) => {
  if (err && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS blocked" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
