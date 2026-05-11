// api.js - Backend API calls
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
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
