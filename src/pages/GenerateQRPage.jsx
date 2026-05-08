// GenerateQRPage.jsx - Step-by-step QR generator (no scrolling)
import { useState, useRef } from "react";
import { QRCode } from "react-qr-code";
import { useNavigate } from "react-router-dom";
import mpesaLogo from "../assets/mpesa-logo.png";
import { initiatePayment } from "../services/api";

const BASE_URL = import.meta.env.VITE_WEB_URL || window.location.origin;

// Steps: 0=type, 1=details, 2=qr+test
const TOTAL_STEPS = 3;

export default function GenerateQRPage() {
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState("till");
  const [form, setForm] = useState({ merchant: "", till: "", paybill: "", account: "", amount: "", ref: "" });
  const [error, setError] = useState("");

  // QR + test payment
  const [generated, setGenerated] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testAmount, setTestAmount] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  function buildQRUrl() {
    const p = new URLSearchParams();
    if (form.merchant) p.set("merchant", form.merchant);
    if (activeTab === "till" && form.till) p.set("till", form.till);
    if (activeTab === "paybill" && form.paybill) p.set("paybill", form.paybill);
    if (activeTab === "paybill" && form.account) p.set("account", form.account);
    if (form.amount) p.set("amount", form.amount);
    if (form.ref) p.set("ref", form.ref);
    return `${BASE_URL}/pay?${p.toString()}`;
  }

  const qrUrl = buildQRUrl();
  const isLocalUrl = qrUrl.includes("localhost") || qrUrl.includes("127.0.0.1") || /http:\/\/\d+\.\d+\.\d+\.\d+/.test(qrUrl);

  // -- Navigation --
  function goNext() {
    setError("");
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!form.merchant.trim()) { setError("Business name is required."); return; }
      if (activeTab === "till" && !form.till.trim()) { setError("Till number is required."); return; }
      if (activeTab === "paybill" && !form.paybill.trim()) { setError("Paybill number is required."); return; }
      setGenerated(true);
      setStep(2);
    }
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  // -- Download QR --
  function handleDownload() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `${form.merchant.replace(/\s+/g, "_")}_QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  // -- Test STK Push --
  async function handleTestPayment() {
    setTestError("");
    if (!testPhone.trim()) { setTestError("Enter a phone number."); return; }
    const amt = testAmount || form.amount;
    if (!amt || isNaN(amt) || Number(amt) < 1) { setTestError("Enter a valid amount."); return; }
    setTestLoading(true);
    try {
      const result = await initiatePayment({
        phone: testPhone.replace(/[\s-]/g, ""),
        amount: Number(amt),
        merchant: form.merchant,
        reference: form.ref || undefined,
        till: activeTab === "till" ? form.till : undefined,
        paybill: activeTab === "paybill" ? form.paybill : undefined,
        account: activeTab === "paybill" ? form.account : undefined,
      });
      navigate(`/waiting?ref=${result.reference}&merchant=${encodeURIComponent(form.merchant)}&amount=${amt}`);
    } catch (err) {
      setTestError(err.message || "STK Push failed.");
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>

        {/* Logo */}
        <div className="logo-row" style={{ marginBottom: 16 }}>
          <img src={mpesaLogo} alt="M-Pesa" style={{ height: 38, objectFit: "contain" }} />
          <div className="logo-text">Generate <span>QR Code</span></div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? "var(--mpesa-green)" : i < step ? "var(--mpesa-dark)" : "var(--border)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* -- STEP 0: Payment Type -- */}
        {step === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Payment Type</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                How do your customers pay you?
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {[
                { key: "till", label: "Till Number", desc: "Buy Goods and Services" },
                { key: "paybill", label: "Paybill", desc: "Pay Bill / Lipa Na M-Pesa" },
              ].map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setError(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "18px 20px", borderRadius: 14, cursor: "pointer",
                    border: `2px solid ${activeTab === key ? "var(--mpesa-green)" : "var(--border)"}`,
                    background: activeTab === key ? "rgba(0,166,81,0.08)" : "var(--bg-input)",
                    color: "var(--text-primary)", textAlign: "left", width: "100%",
                    transition: "all 0.2s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{desc}</div>
                  </div>
                  {activeTab === key && (
                    <span style={{ marginLeft: "auto", color: "var(--mpesa-green)", fontSize: 16, fontWeight: 700 }}>v</span>
                  )}
                </button>
              ))}
            </div>

            <button className="btn btn-primary" onClick={goNext}>
              Continue
            </button>
          </div>
        )}

        {/* -- STEP 1: Business Details -- */}
        {step === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Business Details</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {activeTab === "till" ? "Till Number" : "Paybill"} setup
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <label className="form-label">Business / Merchant Name *</label>
              <input className="form-input" name="merchant" placeholder="e.g. Makila Smart Wash"
                value={form.merchant} onChange={handleChange} autoFocus />
            </div>

            {activeTab === "till" ? (
              <div className="form-group">
                <label className="form-label">Till Number *</label>
                <input className="form-input" name="till" placeholder="e.g. 123456"
                  value={form.till} onChange={handleChange} inputMode="numeric" />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Paybill Number *</label>
                  <input className="form-input" name="paybill" placeholder="e.g. 400200"
                    value={form.paybill} onChange={handleChange} inputMode="numeric" />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number (optional)</label>
                  <input className="form-input" name="account" placeholder="e.g. ORDER_001"
                    value={form.account} onChange={handleChange} />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Fixed Amount KES (optional)</label>
              <input className="form-input" name="amount" type="number" inputMode="numeric"
                placeholder="Leave blank - customer enters amount"
                value={form.amount} onChange={handleChange} min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Order / Reference (optional)</label>
              <input className="form-input" name="ref" placeholder="e.g. TABLE_5"
                value={form.ref} onChange={handleChange} />
            </div>

            <button className="btn btn-primary" onClick={goNext} style={{ marginBottom: 12 }}>
              Generate QR Code
            </button>
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
          </div>
        )}

        {/* -- STEP 2: QR Code + Test Payment -- */}
        {step === 2 && generated && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

            {/* QR */}
            <div ref={qrRef} className="qr-box">
              <QRCode value={qrUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>

            <div className="qr-merchant-label">
              {form.merchant}
              {activeTab === "till" ? ` - Till ${form.till}` : ` - Paybill ${form.paybill}`}
              {form.amount ? ` - KES ${Number(form.amount).toLocaleString()}` : " - Open Amount"}
            </div>

            {isLocalUrl && (
              <div style={{
                background: "rgba(255,184,63,0.12)", border: "1px solid rgba(255,184,63,0.4)",
                borderRadius: 10, padding: "10px 14px", fontSize: 12,
                color: "var(--warning)", textAlign: "center", lineHeight: 1.6, width: "100%",
              }}>
                Warning: Local URL - Google Lens will not reach it outside your WiFi.
                Run <strong>node start-dev.js</strong> to get a public tunnel URL.
              </div>
            )}

            <button className="btn btn-primary" onClick={handleDownload}>
              Download QR Code (PNG)
            </button>

            <div className="divider" style={{ width: "100%", margin: "4px 0" }} />

            <div style={{ width: "100%" }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: "var(--text-secondary)",
                marginBottom: 14, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                Test Payment via STK Push
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input" type="tel" inputMode="tel" placeholder="07XX XXX XXX"
                  value={testPhone}
                  onChange={(e) => { setTestPhone(e.target.value); setTestError(""); }}
                  maxLength={13}
                />
              </div>

              {!form.amount && (
                <div className="form-group">
                  <label className="form-label">Amount (KES)</label>
                  <input
                    className="form-input" type="number" inputMode="numeric" placeholder="e.g. 100"
                    value={testAmount}
                    onChange={(e) => { setTestAmount(e.target.value); setTestError(""); }}
                    min="1"
                  />
                </div>
              )}

              {testError && <div className="error-msg">{testError}</div>}

              <button className="btn btn-primary" onClick={handleTestPayment} disabled={testLoading}>
                {testLoading ? "Sending STK Push..." : "Send STK Push to Phone"}
              </button>
            </div>

            <button className="btn btn-secondary" onClick={goBack}>
              Back to Edit Details
            </button>
          </div>
        )}

        <div className="powered-by" style={{ marginTop: 16 }}>Powered by Safaricom Daraja API</div>
      </div>
    </div>
  );
}
