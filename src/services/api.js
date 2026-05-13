// api.js - Backend API calls
// Uses Vite proxy (/api → localhost:5000) by default.
// Set VITE_API_URL in web/.env only when you need to point at a public tunnel
// (e.g. ngrok) for callback testing from a physical device on a different network.
const _envApi = import.meta.env.VITE_API_URL;
const API_BASE = (_envApi && _envApi.trim() && !_envApi.includes("loca.lt"))
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
