import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, openDatabase, query } from "./db.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const SALT_ROUNDS = 12;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "512kb" }));

const dbReady = openDatabase();

if (JWT_SECRET === "dev-only-change-me" && process.env.NODE_ENV === "production") {
  console.error("Set JWT_SECRET in production.");
  process.exit(1);
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
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
    req.user = { id: Number(payload.sub), email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(dbReady)
    .then(() => fn(req, res, next))
    .catch(next);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(["customer", "seller", "repair_shop"]);

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "VintageRepairExchange API is running.",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/auth/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await query("SELECT id, email, name, role, created_at FROM users WHERE id = $1", [req.user.id]);
    const row = result.rows[0];
    if (!row) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({ user: publicUser(row) });
  })
);

app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
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
    if (await findUserByEmail(email)) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const id = await createUser({ email, name, passwordHash, role });
    const userResult = await query("SELECT id, email, name, role, created_at FROM users WHERE id = $1", [id]);
    const user = publicUser(userResult.rows[0]);
    const token = signToken(user);
    res.status(201).json({ token, user });
  })
);

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    const row = await findUserByEmail(email);
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }
    const user = publicUser(row);
    const token = signToken(user);
    res.json({ token, user });
  })
);

function requireUserId(req) {
  const id = Number(req.user?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

app.post(
  "/api/exchange",
  authMiddleware,
  asyncHandler(async (req, res) => {
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
    const result = await query(
      `INSERT INTO exchange_posts (user_id, offer_product, want_product, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, offerProduct.trim(), wantProduct.trim(), notesText]
    );
    res.status(201).json({ ok: true, id: Number(result.rows[0].id) });
  })
);

app.post(
  "/api/resell",
  authMiddleware,
  asyncHandler(async (req, res) => {
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
      res.status(400).json({ error: "Enter a valid price in INR (1-1,000,000,000)." });
      return;
    }
    const desc = typeof description === "string" ? description.trim() : "";
    if (desc.length < 10) {
      res.status(400).json({ error: "Description should be at least 10 characters." });
      return;
    }
    const safePhotos = Array.isArray(photosMeta)
      ? photosMeta.slice(0, 6).map((p) => ({
          name: typeof p?.name === "string" ? p.name.slice(0, 200) : "file",
          size: typeof p?.size === "number" && p.size >= 0 ? p.size : 0,
        }))
      : null;
    const result = await query(
      `INSERT INTO resell_listings (user_id, title, price_inr, description, photos_meta)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, title.trim(), Math.round(price), desc, safePhotos]
    );
    res.status(201).json({ ok: true, id: Number(result.rows[0].id) });
  })
);

app.post(
  "/api/sell",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Invalid session." });
      return;
    }
    const { title, askingPriceInr, category, condition, description } = req.body || {};
    if (typeof title !== "string" || title.trim().length < 2) {
      res.status(400).json({ error: "Product title is required (at least 2 characters)." });
      return;
    }
    const askingPrice = Number(askingPriceInr);
    if (!Number.isFinite(askingPrice) || askingPrice < 1 || askingPrice > 1000000000) {
      res.status(400).json({ error: "Enter a valid asking price in INR (1-1,000,000,000)." });
      return;
    }
    const categoryText = typeof category === "string" ? category.trim() : "";
    if (categoryText.length < 2) {
      res.status(400).json({ error: "Category is required (at least 2 characters)." });
      return;
    }
    const conditionText = typeof condition === "string" ? condition.trim() : "";
    if (conditionText.length < 2) {
      res.status(400).json({ error: "Condition is required (at least 2 characters)." });
      return;
    }
    const desc = typeof description === "string" ? description.trim() : "";
    if (desc.length < 10) {
      res.status(400).json({ error: "Description should be at least 10 characters." });
      return;
    }
    const result = await query(
      `INSERT INTO sell_listings (user_id, title, asking_price_inr, category, condition_text, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, title.trim(), Math.round(askingPrice), categoryText, conditionText, desc]
    );
    res.status(201).json({ ok: true, id: Number(result.rows[0].id) });
  })
);

app.post(
  "/api/repair",
  authMiddleware,
  asyncHandler(async (req, res) => {
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
    const result = await query(
      `INSERT INTO repair_requests (user_id, title, brand, category, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, title.trim(), brandText, category.trim(), desc]
    );
    res.status(201).json({ ok: true, id: Number(result.rows[0].id) });
  })
);

app.post(
  "/api/contact-us",
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Name is required (at least 2 characters)." });
      return;
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: "Valid email is required." });
      return;
    }
    const messageText = typeof message === "string" ? message.trim() : "";
    if (messageText.length < 10) {
      res.status(400).json({ error: "Message should be at least 10 characters." });
      return;
    }
    const subjectText = typeof subject === "string" ? subject.trim() : "";
    const result = await query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), subjectText, messageText]
    );
    res.status(201).json({ ok: true, id: Number(result.rows[0].id) });
  })
);

const PAYMENT_METHODS = new Set(["card", "upi", "cod"]);
const PHONE_RE = /^[0-9]{10}$/;
const PINCODE_RE = /^[0-9]{6}$/;

app.post(
  "/api/orders",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Invalid session." });
      return;
    }
    const { productId, productTitle, amountInr, buyerName, buyerPhone, addressLine1, addressLine2, city, state, pincode, paymentMethod } =
      req.body || {};
    if (typeof productId !== "string" || productId.trim().length < 2) {
      res.status(400).json({ error: "Valid product id is required." });
      return;
    }
    if (typeof productTitle !== "string" || productTitle.trim().length < 2) {
      res.status(400).json({ error: "Valid product title is required." });
      return;
    }
    const amount = Number(amountInr);
    if (!Number.isFinite(amount) || amount < 1 || amount > 1000000000) {
      res.status(400).json({ error: "Enter a valid amount in INR." });
      return;
    }
    if (typeof buyerName !== "string" || buyerName.trim().length < 2) {
      res.status(400).json({ error: "Buyer name is required." });
      return;
    }
    const phoneText = typeof buyerPhone === "string" ? buyerPhone.replace(/\D/g, "") : "";
    if (!PHONE_RE.test(phoneText)) {
      res.status(400).json({ error: "Phone number must be 10 digits." });
      return;
    }
    if (typeof addressLine1 !== "string" || addressLine1.trim().length < 5) {
      res.status(400).json({ error: "Address line 1 is required." });
      return;
    }
    const address2 = typeof addressLine2 === "string" ? addressLine2.trim() : "";
    if (typeof city !== "string" || city.trim().length < 2) {
      res.status(400).json({ error: "City is required." });
      return;
    }
    if (typeof state !== "string" || state.trim().length < 2) {
      res.status(400).json({ error: "State is required." });
      return;
    }
    const pinText = typeof pincode === "string" ? pincode.replace(/\D/g, "") : "";
    if (!PINCODE_RE.test(pinText)) {
      res.status(400).json({ error: "Pincode must be 6 digits." });
      return;
    }
    if (typeof paymentMethod !== "string" || !PAYMENT_METHODS.has(paymentMethod)) {
      res.status(400).json({ error: "Payment method must be card, upi, or cod." });
      return;
    }
    const paymentStatus = paymentMethod === "cod" ? "pending_cod" : "paid";
    const result = await query(
      `INSERT INTO orders (
        user_id, product_id, product_title, amount_inr, buyer_name, buyer_phone,
        buyer_address_line1, buyer_address_line2, buyer_city, buyer_state, buyer_pincode,
        payment_method, payment_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id`,
      [
        userId,
        productId.trim(),
        productTitle.trim(),
        Math.round(amount),
        buyerName.trim(),
        phoneText,
        addressLine1.trim(),
        address2,
        city.trim(),
        state.trim(),
        pinText,
        paymentMethod,
        paymentStatus,
      ]
    );
    res.status(201).json({
      ok: true,
      id: Number(result.rows[0].id),
      paymentStatus,
      paymentMessage:
        paymentMethod === "cod"
          ? "Order placed with Cash on Delivery."
          : `Payment successful via ${paymentMethod.toUpperCase()}.`,
    });
  })
);

app.get(
  "/api/me/submissions",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = requireUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Invalid session." });
      return;
    }

    const [sell, resell, exchange, repair, orders] = await Promise.all([
      query("SELECT id, title, asking_price_inr, created_at FROM sell_listings WHERE user_id = $1 ORDER BY id DESC LIMIT 20", [
        userId,
      ]),
      query("SELECT id, title, price_inr, created_at FROM resell_listings WHERE user_id = $1 ORDER BY id DESC LIMIT 20", [userId]),
      query(
        "SELECT id, offer_product, want_product, created_at FROM exchange_posts WHERE user_id = $1 ORDER BY id DESC LIMIT 20",
        [userId]
      ),
      query("SELECT id, title, category, created_at FROM repair_requests WHERE user_id = $1 ORDER BY id DESC LIMIT 20", [userId]),
      query(
        `SELECT id, product_title, amount_inr, payment_method, payment_status, created_at
         FROM orders
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT 20`,
        [userId]
      ),
    ]);

    res.json({
      sell: sell.rows,
      resell: resell.rows,
      exchange: exchange.rows,
      repair: repair.rows,
      orders: orders.rows,
      counts: {
        sell: sell.rows.length,
        resell: resell.rows.length,
        exchange: exchange.rows.length,
        repair: repair.rows.length,
        orders: orders.rows.length,
      },
    });
  })
);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

export default app;
export { app };

if (!process.env.VERCEL) {
  dbReady
    .then(() => {
      app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Database init failed:", err);
      process.exit(1);
    });
}
