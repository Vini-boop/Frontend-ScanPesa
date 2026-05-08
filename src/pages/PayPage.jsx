// PayPage.jsx — Step-by-step payment flow (no scrolling, page-by-page)
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { initiatePayment } from "../services/api";
import CardHeader from "../components/CardHeader";

export default function PayPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const merchant = params.get("merchant") || "Merchant";
  const till = params.get("till") || "";
  const paybill = params.get("paybill") || "";
  const account = params.get("account") || "";
  const qrAmount = params.get("amount") || "";
  const ref = params.get("ref") || "";

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(qrAmount);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFixedAmount = Boolean(qrAmount);
  const avatarLetter = merchant.charAt(0).toUpperCase();

  const paymentType = till
    ? `Buy Goods · Till ${till}`
    : paybill
      ? `Paybill ${paybill}${account ? ` · Acc: ${account}` : ""}`
      : "M-Pesa Payment";

  function goNext() {
    setError("");
    if (step === 0) { setStep(isFixedAmount ? 2 : 1); return; }
    if (step === 1) {
      if (!amount || isNaN(amount) || Number(amount) < 1) { setError("Enter a valid amount."); return; }
      setStep(2);
    }
  }

  function goBack() {
    setError("");
    if (step === 2) { setStep(isFixedAmount ? 0 : 1); return; }
    if (step === 1) { setStep(0); }
  }

  async function handlePay() {
    setError("");
    const rawPhone = phone.replace(/[\s-]/g, "");
    if (!rawPhone || rawPhone.length < 9) { setError("Enter a valid M-Pesa phone number."); return; }
    setLoading(true);
    try {
      const result = await initiatePayment({
        phone: rawPhone,
        amount: Number(amount),
        merchant,
        reference: ref || undefined,
        till: till || undefined,
        paybill: paybill || undefined,
        account: account || undefined,
      });
      navigate(`/waiting?ref=${result.reference}&merchant=${encodeURIComponent(merchant)}&amount=${amount}`);
    } catch (err) {
      setError(err.message || "Failed to send STK Push. Try again.");
      setLoading(false);
    }
  }

  const totalSteps = isFixedAmount ? 2 : 3;
  const currentDot = isFixedAmount ? (step === 0 ? 0 : 1) : step;

  return (
    <div className="page">
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>

        <CardHeader />

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              width: i === currentDot ? 24 : 8, height: 8, borderRadius: 4,
              background: i === currentDot ? "var(--mpesa-green)" : "var(--border)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* STEP 0: Merchant Info */}
        {step === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="merchant-block" style={{ marginBottom: 32 }}>
              <div className="merchant-avatar">{avatarLetter}</div>
              <div className="merchant-name">{merchant}</div>
              <div className="merchant-till">{paymentType}</div>
              {ref && <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>Ref: {ref}</div>}
              {isFixedAmount && (
                <div className="amount-display" style={{ marginTop: 20 }}>
                  <span className="currency">KES</span>
                  <span className="amount-value">{Number(qrAmount).toLocaleString()}</span>
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={goNext}>Continue to Pay</button>
          </div>
        )}

        {/* STEP 1: Enter Amount */}
        {step === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Paying</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{merchant}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (KES)</label>
              <input
                className="form-input"
                type="number" inputMode="numeric"
                placeholder="Enter amount e.g. 500"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                min="1" autoFocus
                style={{ fontSize: 28, fontWeight: 800, textAlign: "center", padding: "18px 16px" }}
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" onClick={goNext} style={{ marginBottom: 12 }}>Continue</button>
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
          </div>
        )}

        {/* STEP 2: Phone & Pay */}
        {step === 2 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{
              background: "var(--bg-input)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "16px 20px", marginBottom: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Business</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{merchant}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Type</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{paymentType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Amount</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "var(--mpesa-green)" }}>
                  KES {Number(amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your M-Pesa Phone Number</label>
              <input
                id="phone-input"
                className="form-input"
                type="tel" inputMode="tel"
                placeholder="e.g. 0712 345 678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                maxLength={13} autoFocus
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button
              id="pay-btn"
              className="btn btn-primary"
              onClick={handlePay}
              disabled={loading}
              style={{ fontSize: 17, padding: "18px", marginBottom: 12 }}
            >
              {loading ? "Sending STK Push..." : `Pay KES ${Number(amount).toLocaleString()} via M-Pesa`}
            </button>
            <button className="btn btn-secondary" onClick={goBack} disabled={loading}>Back</button>

            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
              You will receive an M-Pesa prompt on your phone.<br />Enter your PIN to complete.
            </p>
          </div>
        )}

        <div className="powered-by">Secured by Safaricom M-Pesa</div>
      </div>
    </div>
  );
}
