const TOKEN_KEY = "vintage_token";
const USER_KEY = "vintage_user";

/**
 * Build API origin. Paths in this file always start with `/api/...`.
 * If VITE_API_URL already ends with `/api`, strip it so we never request `/api/api/...` (404).
 */
function apiBase() {
  let base = (import.meta.env.VITE_API_URL || "").trim();
  if (!base) return "";
  base = base.replace(/\/+$/, "");
  if (base.endsWith("/api")) {
    base = base.slice(0, -4);
  }
  return base;
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...options.headers };
  const body = options.body;
  if (body !== undefined && !(body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
    body: body !== undefined && typeof body === "object" && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let message = data && typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    if (res.status === 404) {
      message +=
        " If you use .env, set VITE_API_URL to the API root only (e.g. http://127.0.0.1:3001), not …/api. Run the API (npm run dev:api or npm run dev:full).";
    }
    throw new Error(message);
  }

  return data;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem("vintage_auth");
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("vintage_auth");
}

export function getMe() {
  return request("/api/auth/me");
}

export function login({ email, password }) {
  return request("/api/auth/login", { method: "POST", body: { email, password } });
}

export function register(payload) {
  return request("/api/auth/register", { method: "POST", body: payload });
}

export function createExchangePost(body) {
  return request("/api/exchange", { method: "POST", body });
}

export function createResellListing(body) {
  return request("/api/resell", { method: "POST", body });
}

export function createRepairRequest(body) {
  return request("/api/repair", { method: "POST", body });
}
