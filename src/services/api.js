// api.js — Backend API calls
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
  return data; // { status, receipt, amount }
}
