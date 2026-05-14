// QRDisplayPage.jsx - Step 3: Signed QR + Test STK Push
import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { initiatePayment, generateQRToken } from "../services/api";
import { StepDots } from "./QRTypePage";
import CardHeader from "../components/CardHeader";

// Public base URL for QR codes.
// On Netlify: use VITE_WEB_URL (set in Netlify env vars).
// Local dev with tunnel: use VITE_WEB_URL if set and not a stale loca.lt URL.
// Fallback: window.location.origin (works on same WiFi or localhost).
function getBaseUrl() {
  const env = import.meta.env.VITE_WEB_URL;
  if (env && env.trim() && !env.includes("loca.lt") && !env.includes("localhost")) {
    return env.trim().replace(/\/$/, "");
  }
  return window.location.origin;
}

export default function QRDisplayPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qrRef = useRef(null);

  const type = params.get("type") || "till";
  const merchant = params.get("merchant") || "";
  const till = params.get("till") || "";
  const paybill = params.get("paybill") || "";
  const account = params.get("account") || "";
  const amount = params.get("amount") || "";
  const ref = params.get("ref") || "";
  const qrMode = params.get("qrMode") || "static";
  const expiry = params.get("expiry") || "never";
  const orderId = params.get("orderId") || "";

  const accountId = type === "paybill" ? paybill : till;

  // Build the fallback (unsigned) pay URL using current origin
  function buildFallbackUrl() {
    const base = getBaseUrl();
    const p = new URLSearchParams();
    if (merchant) p.set("merchant", merchant);
    if (type === "till" && till) p.set("till", till);
    if (type === "paybill" && paybill) p.set("paybill", paybill);
    if (type === "paybill" && account) p.set("account", account);
    if (type === "pochi" && till) p.set("till", till);
    if (type === "sendmoney" && till) p.set("till", till);
    if (amount) p.set("amount", amount);
    if (ref) p.set("ref", ref);
    if (orderId) p.set("orderId", orderId);
    return `${base}/pay?${p.toString()}`;
  }

  const [qrUrl, setQrUrl] = useState(buildFallbackUrl);
  const [qrSigned, setQrSigned] = useState(false);
  const [qrSignError, setQrSignError] = useState(false);
  const [baseUrl, setBaseUrl] = useState(getBaseUrl);

  const [testPhone, setTestPhone] = useState("");
  const [testAmount, setTestAmount] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");

  // Try to get a cryptographically signed token from the backend
  useEffect(() => {
    (async () => {
      try {
        const result = await generateQRToken({
          qrType: qrMode,
          merchant,
          accountType: type,
          accountId,
          account: account || undefined,
          amount: amount ? Number(amount) : undefined,
          ref: ref || undefined,
          orderId: orderId || undefined,
          expiry,
          // sandbox: skip merchant verification so testing works without onboarding
          skipVerification: true,
        });
        if (result.token) {
          const base = getBaseUrl();
          setBaseUrl(base);
          setQrUrl(`${base}/pay?token=${result.token}`);
          setQrSigned(true);
        }
      } catch (_) {
        setQrSignError(true);
      }
    })();
  }, []);

  const typeLabel =
    type === "till" ? `Till ${till}` :
      type === "paybill" ? `Paybill ${paybill}` :
        type === "sendmoney" ? `Send Money → ${till}` :
          `Pochi ${till}`;

  // ── Download QR as PNG ──────────────────────────────
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
      link.download = `${(merchant || "QR").replace(/\s+/g, "_")}_QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  // ── Test STK Push ───────────────────────────────────
  async function handleTestPayment() {
    setTestError("");
    if (!testPhone.trim()) { setTestError("Enter a phone number."); return; }
    const amt = testAmount || amount;
    if (!amt || isNaN(amt) || Number(amt) < 1) { setTestError("Enter a valid amount."); return; }
    setTestLoading(true);
    try {
      const result = await initiatePayment({
        phone: testPhone.replace(/[\s-]/g, ""),
        amount: Number(amt),
        merchant,
        reference: ref || orderId || undefined,
        till: (type === "till" || type === "pochi" || type === "sendmoney") ? till : undefined,
        paybill: type === "paybill" ? paybill : undefined,
        account: type === "paybill" ? account : undefined,
      });
      navigate(`/waiting?ref=${result.reference}&merchant=${encodeURIComponent(merchant)}&amount=${amt}`);
    } catch (err) {
      setTestError(err.message || "STK Push failed. Is the backend running?");
    } finally {
      setTestLoading(false);
    }
  }

  // Warn if QR URL is localhost — phone won't be able to reach it
  const isLocalUrl = qrUrl.includes("localhost") || qrUrl.includes("127.0.0.1");

  return (
    <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <div className="card" style={{ display: "flex", flexDirection: "column" }}>
        <CardHeader />
        <StepDots current={2} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

          {/* Merchant header */}
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{merchant}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {typeLabel}{amount ? ` · KES ${Number(amount).toLocaleString()}` : " · Open Amount"}
            </div>
          </div>

          {/* QR Code */}
          <div ref={qrRef} className="qr-box">
            <QRCode value={qrUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
          </div>

          {/* Signed status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
            color: qrSigned ? "var(--mpesa-green)" : "var(--text-muted)",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: qrSigned ? "var(--mpesa-green)" : "#aaa" }} />
            {qrSigned ? "Cryptographically Signed" : qrSignError ? "Unsigned (backend offline)" : "Signing..."}
          </div>

          {/* Local URL warning — phone can't scan this */}
          {isLocalUrl && (
            <div style={{
              background: "rgba(232,150,10,0.1)", border: "1px solid rgba(232,150,10,0.35)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#b37800",
              lineHeight: 1.6, width: "100%", textAlign: "center",
            }}>
              ⚠️ QR points to localhost — phones can't scan this.<br />
              Set <code>VITE_WEB_URL</code> to your ngrok URL in <code>web/.env</code> and restart Vite.
            </div>
          )}

          {/* QR URL preview (truncated) */}
          <div style={{
            fontSize: 10, color: "var(--text-muted)", wordBreak: "break-all",
            textAlign: "center", maxWidth: "100%", padding: "0 4px",
          }}>
            {qrUrl.length > 80 ? qrUrl.substring(0, 80) + "…" : qrUrl}
          </div>

          <button className="btn btn-primary" onClick={handleDownload}>
            Download QR Code (PNG)
          </button>

          <div className="divider" style={{ width: "100%", margin: "4px 0" }} />

          {/* Test STK Push */}
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
            {!amount && (
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

          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back to Edit Details
          </button>
        </div>

        <div className="powered-by" style={{ marginTop: 16 }}>Powered by Safaricom Daraja API</div>
      </div>
    </div>
  );
}
