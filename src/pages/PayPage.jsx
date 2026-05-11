// PayPage.jsx - Verifies QR token then step-by-step payment
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { initiatePayment, verifyQRToken } from "../services/api";
import CardHeader from "../components/CardHeader";

export default function PayPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();

  const token    = params.get("token")    || "";
  const merchant = params.get("merchant") || "Merchant";
  const till     = params.get("till")     || "";
  const paybill  = params.get("paybill")  || "";
  const account  = params.get("account")  || "";
  const qrAmount = params.get("amount")   || "";
  const ref      = params.get("ref")      || "";

  const [step,      setStep]      = useState(0);
  const [amount,    setAmount]    = useState(qrAmount);
  const [phone,     setPhone]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // QR verification state
  const [verifying,   setVerifying]   = useState(false);
  const [verified,    setVerified]    = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [qrData,      setQrData]      = useState(null);

  // Verify token on mount if present
  useEffect(() => {
    if (!token) return;
    setVerifying(true);
    verifyQRToken(token).then((result) => {
      if (result.valid) {
        setVerified(true);
        setQrData(result);
        if (result.amount) setAmount(String(result.amount));
      } else {
        setVerifyError(result.reason || "QR verification failed");
      }
    }).catch(() => {
      setVerifyError("Could not verify QR. Please try again.");
    }).finally(() => setVerifying(false));
  }, [token]);

  const isFixedAmount = Boolean(qrAmount || qrData?.amount);
  const displayMerchant = qrData?.merchant || merchant;
  const displayType = qrData
    ? (qrData.accountType === "till" ? `Buy Goods - Till ${qrData.accountId}` : qrData.accountType === "paybill" ? `Paybill ${qrData.accountId}` : `Pochi ${qrData.accountId}`)
    : till ? `Buy Goods - Till ${till}` : paybill ? `Paybill ${paybill}` : "M-Pesa Payment";

  const avatarLetter = displayMerchant.charAt(0).toUpperCase();

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
      const useTill    = qrData?.accountType === "till"    ? qrData.accountId : till    || undefined;
      const usePaybill = qrData?.accountType === "paybill" ? qrData.accountId : paybill || undefined;
      const useAccount = qrData?.account || account || undefined;

      const result = await initiatePayment({
        phone:     rawPhone,
        amount:    Number(amount),
        merchant:  displayMerchant,
        reference: ref || undefined,
        till:      useTill,
        paybill:   usePaybill,
        account:   useAccount,
      });
      navigate(`/waiting?ref=${result.reference}&merchant=${encodeURIComponent(displayMerchant)}&amount=${amount}`);
    } catch (err) {
      setError(err.message || "Failed to send STK Push. Try again.");
      setLoading(false);
    }
  }

  const totalSteps = isFixedAmount ? 2 : 3;
  const currentDot = isFixedAmount ? (step === 0 ? 0 : 1) : step;

  // Show verification screen
  if (token && verifying) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <CardHeader />
          <div style={{ padding: "32px 0", color: "var(--text-secondary)", fontSize: 14 }}>
            Verifying QR security signature...
          </div>
        </div>
      </div>
    );
  }

  if (token && verifyError) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <CardHeader />
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(229,62,90,0.1)", border: "2px solid var(--danger)", margin: "24px auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "var(--danger)" }}>!</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--danger)", marginBottom: 8 }}>QR Verification Failed</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>{verifyError}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7 }}>
            This QR code could not be verified. It may have expired, been tampered with, or belong to an invalid merchant account. Do not proceed with payment.
          </div>
          <div className="powered-by" style={{ marginTop: 24 }}>Secured by ScanPesa Security Layer</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
        <CardHeader />

        {/* Verified badge */}
        {verified && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16, background: "rgba(0,166,81,0.08)", border: "1px solid rgba(0,166,81,0.2)", borderRadius: 8, padding: "6px 12px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mpesa-green)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--mpesa-green)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Verified Merchant</span>
          </div>
        )}

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ width: i === currentDot ? 24 : 8, height: 8, borderRadius: 4, background: i === currentDot ? "var(--mpesa-green)" : "var(--border)", transition: "all 0.3s ease" }} />
          ))}
        </div>

        {/* STEP 0: Merchant Info */}
        {step === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="merchant-block" style={{ marginBottom: 32 }}>
              <div className="merchant-avatar">{avatarLetter}</div>
              <div className="merchant-name">{displayMerchant}</div>
              <div className="merchant-till">{displayType}</div>
              {ref && <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>Ref: {ref}</div>}
              {isFixedAmount && (
                <div className="amount-display" style={{ marginTop: 20 }}>
                  <span className="currency">KES</span>
                  <span className="amount-value">{Number(amount).toLocaleString()}</span>
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
              <div style={{ fontWeight: 700, fontSize: 16 }}>{displayMerchant}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (KES)</label>
              <input className="form-input" type="number" inputMode="numeric" placeholder="Enter amount e.g. 500"
                value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }}
                min="1" autoFocus style={{ fontSize: 28, fontWeight: 800, textAlign: "center", padding: "18px 16px" }} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" onClick={goNext} style={{ marginBottom: 12 }}>Continue</button>
            <button className="btn btn-secondary" onClick={goBack}>Back</button>
          </div>
        )}

        {/* STEP 2: Phone and Pay */}
        {step === 2 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Business</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{displayMerchant}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Payment</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{displayType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Amount</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "var(--mpesa-green)" }}>KES {Number(amount).toLocaleString()}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your M-Pesa Phone Number</label>
              <input id="phone-input" className="form-input" type="tel" inputMode="tel"
                placeholder="e.g. 0712 345 678" value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                maxLength={13} autoFocus />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button id="pay-btn" className="btn btn-primary" onClick={handlePay} disabled={loading}
              style={{ fontSize: 17, padding: "18px", marginBottom: 12 }}>
              {loading ? "Sending STK Push..." : `Pay KES ${Number(amount).toLocaleString()} via M-Pesa`}
            </button>
            <button className="btn btn-secondary" onClick={goBack} disabled={loading}>Back</button>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
              You will receive an M-Pesa prompt on your phone. Enter your PIN to complete.
            </p>
          </div>
        )}

        <div className="powered-by">Secured by Safaricom M-Pesa</div>
      </div>
    </div>
  );
}
