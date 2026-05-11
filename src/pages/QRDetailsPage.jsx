// QRDetailsPage.jsx - Step 2: Business details + QR type + expiry
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StepDots } from "./QRTypePage";
import CardHeader from "../components/CardHeader";

const STATIC_EXPIRY = [
  { value: "never", label: "Never expires" },
  { value: "1m",    label: "1 Month" },
  { value: "3m",    label: "3 Months" },
  { value: "6m",    label: "6 Months" },
  { value: "12m",   label: "12 Months" },
];

const DYNAMIC_EXPIRY = [
  { value: "5min",  label: "5 Minutes" },
  { value: "30min", label: "30 Minutes" },
  { value: "1h",    label: "1 Hour" },
  { value: "24h",   label: "24 Hours" },
];

export default function QRDetailsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const type = params.get("type") || "till";

  const [form, setForm] = useState({
    merchant: "", till: "", paybill: "", account: "", amount: "", ref: "",
    qrMode: "static",
    expiry: "never",
    orderId: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
      const updated = { ...f, [name]: value };
      if (name === "qrMode") {
        updated.expiry = value === "static" ? "never" : "30min";
      }
      return updated;
    });
    setError("");
  }

  function handleGenerate() {
    if (!form.merchant.trim()) { setError("Business name is required."); return; }
    if (type === "till" && !form.till.trim()) { setError("Till number is required."); return; }
    if (type === "paybill" && !form.paybill.trim()) { setError("Paybill number is required."); return; }
    if (type === "pochi" && !form.till.trim()) { setError("M-Pesa phone number is required."); return; }
    if (form.qrMode === "dynamic" && (!form.amount || Number(form.amount) < 1)) {
      setError("Dynamic QR requires a fixed amount."); return;
    }
    const p = new URLSearchParams({ type, ...form });
    navigate(`/generate/qr?${p.toString()}`);
  }

  const typeLabel = type === "till" ? "Till Number" : type === "paybill" ? "Paybill" : "Pochi La Biashara";
  const expiryOptions = form.qrMode === "static" ? STATIC_EXPIRY : DYNAMIC_EXPIRY;

  return (
    <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <div className="card" style={{ display: "flex", flexDirection: "column" }}>
        <CardHeader />
        <StepDots current={1} />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", background: "rgba(0,166,81,0.1)", border: "1px solid rgba(0,166,81,0.25)", borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "var(--mpesa-green)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
            Step 2 of 3
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Business Details</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{typeLabel} setup</div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label className="form-label">QR Code Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { value: "static",  title: "Static QR",  desc: "Permanent for your shop or counter" },
              { value: "dynamic", title: "Dynamic QR", desc: "Single transaction, expires automatically" },
            ].map(({ value, title, desc }) => (
              <button key={value} type="button"
                onClick={() => handleChange({ target: { name: "qrMode", value } })}
                style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left", border: `2px solid ${form.qrMode === value ? "var(--mpesa-green)" : "var(--border)"}`, background: form.qrMode === value ? "rgba(0,166,81,0.07)" : "var(--bg-input)", color: "var(--text-primary)", transition: "all 0.2s" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Business / Merchant Name *</label>
          <input className="form-input" name="merchant" placeholder="e.g. Makila Smart Wash" value={form.merchant} onChange={handleChange} autoFocus />
        </div>

        {type === "till" ? (
          <div className="form-group">
            <label className="form-label">Till Number *</label>
            <input className="form-input" name="till" placeholder="e.g. 123456" value={form.till} onChange={handleChange} inputMode="numeric" />
          </div>
        ) : type === "paybill" ? (
          <>
            <div className="form-group">
              <label className="form-label">Paybill Number *</label>
              <input className="form-input" name="paybill" placeholder="e.g. 400200" value={form.paybill} onChange={handleChange} inputMode="numeric" />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number (optional)</label>
              <input className="form-input" name="account" placeholder="e.g. ORDER_001" value={form.account} onChange={handleChange} />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="form-label">M-Pesa Phone Number *</label>
            <input className="form-input" name="till" placeholder="e.g. 0712 345 678" value={form.till} onChange={handleChange} inputMode="tel" type="tel" />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">{form.qrMode === "dynamic" ? "Amount KES *" : "Fixed Amount KES (optional)"}</label>
          <input className="form-input" name="amount" type="number" inputMode="numeric"
            placeholder={form.qrMode === "dynamic" ? "Required for dynamic QR" : "Leave blank - customer enters amount"}
            value={form.amount} onChange={handleChange} min="1" />
        </div>

        {form.qrMode === "static" && (
          <div className="form-group">
            <label className="form-label">Order / Reference (optional)</label>
            <input className="form-input" name="ref" placeholder="e.g. TABLE_5" value={form.ref} onChange={handleChange} />
          </div>
        )}

        {form.qrMode === "dynamic" && (
          <div className="form-group">
            <label className="form-label">Order ID (optional)</label>
            <input className="form-input" name="orderId" placeholder="e.g. ORD-001" value={form.orderId} onChange={handleChange} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">{form.qrMode === "static" ? "QR Validity Period" : "QR Expiry Time"}</label>
          <select className="form-input" name="expiry" value={form.expiry} onChange={handleChange} style={{ cursor: "pointer" }}>
            {expiryOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} style={{ marginBottom: 12 }}>
          Generate Secure QR Code
        </button>
        <button className="btn btn-secondary" onClick={() => navigate("/generate")}>Back</button>

        <div className="powered-by" style={{ marginTop: 20 }}>Powered by Safaricom Daraja API</div>
      </div>
    </div>
  );
}
