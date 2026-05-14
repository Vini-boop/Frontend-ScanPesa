// api.js - Backend API calls
//
// Routing logic:
//   - On Netlify (production): always use /api — netlify.toml proxies it to Render
//   - Local dev with tunnel:   use VITE_API_URL directly (set in web/.env)
//   - Local dev no tunnel:     use /api — Vite proxy forwards to localhost:5000
//
// VITE_API_URL is only used when running locally with a tunnel for callback testing.
// In production on Netlify, the proxy in netlify.toml handles /api/* → Render.

const _envApi = import.meta.env.VITE_API_URL;
const _isNetlify = typeof window !== "undefined" && window.location.hostname.includes(".netlify.app");
const _isLocalhost = typeof window !== "undefined" && (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
);

// Use direct URL only when running locally with a tunnel URL set
const API_BASE = (!_isNetlify && _isLocalhost && _envApi && _envApi.trim() && !_envApi.includes("loca.lt"))
  ? _envApi.trim()
  : "/api";

export async function initiatePayment(payload) {
  const res = await fetch(`${API_BASE}/stkpush`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "STK Push failed");
  return data;
}

export async function getPaymentStatus(reference) {
  const res = await fetch(`${API_BASE}/status/${reference}`);
  const data = await res.json();
  return data;
}

// Generate a cryptographically signed QR token
export async function generateQRToken(payload) {
  const res = await fetch(`${API_BASE}/qr/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "QR generation failed");
  return data; // { success, token, payload, expiresAt, issuedAt }
}

// Verify a QR token before initiating payment
export async function verifyQRToken(token) {
  const res = await fetch(`${API_BASE}/qr/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  return data; // { valid, reason, merchant, accountType, ... }
}

// Register a merchant for onboarding
export async function registerMerchant(payload) {
  const res = await fetch(`${API_BASE}/merchants/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data; // { success, merchantId, message, _devCode? }
}

// Verify merchant ownership with code
export async function verifyMerchant(merchantId, code) {
  const res = await fetch(`${API_BASE}/merchants/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchantId, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Verification failed");
  return data;
}

// Look up a verified merchant by account ID
export async function lookupMerchant(accountId) {
  const res = await fetch(`${API_BASE}/merchants/lookup/${encodeURIComponent(accountId)}`);
  const data = await res.json();
  return data; // { verified, merchant? }
}

// Register C2B callback URLs with Safaricom (admin/setup call)
export async function registerC2BUrls(shortCode) {
  const res = await fetch(`${API_BASE}/c2b/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shortCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "C2B registration failed");
  return data;
}
