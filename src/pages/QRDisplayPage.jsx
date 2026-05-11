// QRDisplayPage.jsx - Step 3: Signed QR + Verified Merchant Badge + Test STK Push
import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { initiatePayment, generateQRToken } from "../services/api";
import { StepDots } from "./QRTypePage";
import CardHeader from "../components/CardHeader";

const BASE_URL = import.meta.env.VITE_WEB_URL || window.location.origin;

function SecurityBadge({ qrMode, expiry, expiresAt }) {
  const isStatic = qrMode === "static";
  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-KE", { dateStyle: "medium" })
    : "Never";

  return (
    <div style={{ width: "100%", background: "rgba(0,166,81,0.06)", border: "1px solid rgba(0,166,81,0.2)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--mpesa-green)" }} />
        <span style={{ fontWeight: 800, fontSize: 13, color: "var(--mpesa-green)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Verified Merchant QR
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "QR Type",    value: isStatic ? "Static (Permanent)" : "Dynamic (Transaction)" },
          { label: "Security",   value: "HMAC-SHA256 Signed" },
          { label: "Valid Until", value: expiryLabel },
          { label: "Status",     value: "ACTIVE" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--bg-card)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: label === "Status" ? "var(--mpesa-green)" : "var(--text-primary)" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QRDisplayPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qrRef = useRef(null);

  const type     = params.get("type")     || "till";
  const merchant = params.get("merchant") || "";
  const till     = params.get("till")     || "";
  const paybill  = params.get("paybill")  || "";
  const account  = params.get("account")  || "";
  const amount   = params.get("amount")   || "";
  const ref      = params.get("ref")      || "";
  const qrMode   = params.get("qrMode")   || "static";
  const expiry   = params.get("expiry")   || "never";
  const orderId  = params.get("orderId")  || "";

  const accountId = type === "paybill" ? paybill : till;

  const [qrToken,    setQrToken]    = useState(null);
  const [qrPayload,  setQrPayload]  = useState(null);
  const [qrLoading,  setQrLoading]  = useState(true);
  const [qrError,    setQrError]    = useState("");

  const [testPhone,   setTestPhone]   = useState("");
  const [testAmount,  setTestAmount]  = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError,   setTestError]   = useState("");

  // Generate signed token from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await generateQRToken({
          qrType:      qrMode,
          merchant,
          accountType: type,
          accountId,
          account:     account || undefined,
          amount:      amount  ? Number(amount) : undefined,
          ref:         ref     || undefined,
          orderId:     orderId || undefined,
          expiry,
        });
        setQrToken(result.token);
        setQrPayload(result.payload);
      } catch (err) {
        setQrError("Could not generate secure QR. Is the backend running?");
      } finally {
        setQrLoading(false);
      }
    })();
  }, []);

  // The QR encodes a pay URL with the signed token
  const qrUrl = qrToken
    ? `${BASE_URL}/pay?token=${qrToken}`
    : `${BASE_URL}/pay?merchant=${encodeURIComponent(merchant)}&${type === "paybill" ? "paybill=" + paybill : "till=" + till}${amount ? "&amount=" + amount : ""}`;

  const isLocalUrl = /^http:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)/.test(qrUrl);
  const typeLabel  = type === "till" ? `Till ${till}` : type === "paybill" ? `Paybill ${paybill}` : `Pochi ${till}`;

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
      link.download = `${merchant.replace(/\s+/g, "_")}_QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  async function handleTestPayment() {
    setTestError("");
    if (!testPhone.trim()) { setTestError("Enter a phone number."); return; }
    const amt = testAmount || amount;
    if (!amt || isNaN(amt) || Number(amt) < 1) { setTestError("Enter a valid amount."); return; }
    setTestLoading(true);
    try {
      const result = await initiatePayment({
        phone:     testPhone.replace(/[\s-]/g, ""),
        amount:    Number(amt),
        merchant,
        reference: ref     || orderId || undefined,
        till:      (type === "till" || type === "pochi") ? till    : undefined,
        paybill:   type === "paybill" ? paybill : undefined,
        account:   type === "paybill" ? account : undefined,
      });
      navigate(`/waiting?ref=${result.reference}&merchant=${encodeURIComponent(merchant)}&amount=${amt}`);
    } catch (err) {
      setTestError(err.message || "STK Push failed. Is the backend running?");
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <div className="card" style={{ display: "flex", flexDirection: "column" }}>
        <CardHeader />
        <StepDots current={2} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

          {/* Merchant verified header */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{merchant}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{typeLabel}{amount ? ` - KES ${Number(amount).toLocaleString()}` : " - Open Amount"}</div>
          </div>

          {/* QR Code */}
          {qrLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
              Generating secure QR...
            </div>
          ) : qrError ? (
            <div className="error-msg" style={{ width: "100%" }}>{qrError}</div>
          ) : (
            <div ref={qrRef} className="qr-box">
              <QRCode value={qrUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>
          )}

          {/* Security badge */}
          {qrPayload && (
            <SecurityBadge
              qrMode={qrMode}
              expiry={expiry}
              expiresAt={qrPayload.expiresAt}
            />
          )}

          {isLocalUrl && (
            <div style={{ background: "rgba(255,184,63,0.12)", border: "1px solid rgba(255,184,63,0.4)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--warning)", textAlign: "center", lineHeight: 1.6, width: "100%" }}>
              Warning: Local URL - Google Lens will not reach it outside your WiFi.
              Run node start-dev.cjs to get a public tunnel URL.
            </div>
          )}

          <button className="btn btn-primary" onClick={handleDownload} disabled={qrLoading || !!qrError}>
            Download QR Code (PNG)
          </button>

          <div className="divider" style={{ width: "100%", margin: "4px 0" }} />

          {/* Test STK Push */}
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Test Payment via STK Push
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" inputMode="tel" placeholder="07XX XXX XXX"
                value={testPhone} onChange={(e) => { setTestPhone(e.target.value); setTestError(""); }} maxLength={13} />
            </div>
            {!amount && (
              <div className="form-group">
                <label className="form-label">Amount (KES)</label>
                <input className="form-input" type="number" inputMode="numeric" placeholder="e.g. 100"
                  value={testAmount} onChange={(e) => { setTestAmount(e.target.value); setTestError(""); }} min="1" />
              </div>
            )}
            {testError && <div className="error-msg">{testError}</div>}
            <button className="btn btn-primary" onClick={handleTestPayment} disabled={testLoading}>
              {testLoading ? "Sending STK Push..." : "Send STK Push to Phone"}
            </button>
          </div>

          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back to Edit Details</button>
        </div>

        <div className="powered-by" style={{ marginTop: 16 }}>Powered by Safaricom Daraja API</div>
      </div>
    </div>
  );
}
