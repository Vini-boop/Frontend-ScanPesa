// QRDisplayPage.jsx - Step 3: Show QR + Test STK Push
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { initiatePayment } from "../services/api";
import { StepDots } from "./QRTypePage";
import CardHeader from "../components/CardHeader";

const BASE_URL = import.meta.env.VITE_WEB_URL || window.location.origin;

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

    const qrParams = new URLSearchParams();
    if (merchant) qrParams.set("merchant", merchant);
    if (type === "till" && till) qrParams.set("till", till);
    if (type === "paybill" && paybill) qrParams.set("paybill", paybill);
    if (type === "paybill" && account) qrParams.set("account", account);
    if (type === "pochi" && till) qrParams.set("till", till);
    if (amount) qrParams.set("amount", amount);
    if (ref) qrParams.set("ref", ref);
    const qrUrl = `${BASE_URL}/pay?${qrParams.toString()}`;

    const isLocalUrl = /^http:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)/.test(qrUrl);

    const [testPhone, setTestPhone] = useState("");
    const [testAmount, setTestAmount] = useState("");
    const [testLoading, setTestLoading] = useState(false);
    const [testError, setTestError] = useState("");

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
                phone: testPhone.replace(/[\s-]/g, ""),
                amount: Number(amt),
                merchant,
                reference: ref || undefined,
                till: (type === "till" || type === "pochi") ? till : undefined,
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

    const typeLabel = type === "till" ? `Till ${till}` : type === "paybill" ? `Paybill ${paybill}` : `Pochi ${till}`;

    return (
        <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>

                <CardHeader />
                <StepDots current={2} />

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>

                    <div ref={qrRef} className="qr-box">
                        <QRCode value={qrUrl} size={200} bgColor="#ffffff" fgColor="#000000" level="H" />
                    </div>

                    <div className="qr-merchant-label">
                        {merchant} - {typeLabel}
                        {amount ? ` - KES ${Number(amount).toLocaleString()}` : " - Open Amount"}
                    </div>

                    {isLocalUrl && (
                        <div style={{
                            background: "rgba(255,184,63,0.12)", border: "1px solid rgba(255,184,63,0.4)",
                            borderRadius: 10, padding: "10px 14px", fontSize: 12,
                            color: "var(--warning)", textAlign: "center", lineHeight: 1.6, width: "100%",
                        }}>
                            Warning: Local URL - Google Lens will not reach it outside your WiFi.
                            Run node start-dev.js to get a public tunnel URL.
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
