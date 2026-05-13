// MerchantRegisterPage.jsx — Merchant onboarding + verification
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardHeader from "../components/CardHeader";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const ACCOUNT_TYPES = [
    { value: "till", label: "Till Number (Buy Goods)" },
    { value: "paybill", label: "Paybill Number" },
    { value: "pochi", label: "Pochi La Biashara" },
    { value: "sendmoney", label: "Send Money (Phone)" },
];

export default function MerchantRegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState("register"); // "register" | "verify" | "done"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [merchantId, setMerchantId] = useState("");
    const [devCode, setDevCode] = useState(""); // sandbox only

    const [form, setForm] = useState({
        businessName: "",
        accountType: "till",
        accountId: "",
        accountNumber: "",
        phone: "",
        ownerName: "",
        nationalId: "",
    });
    const [verifyCode, setVerifyCode] = useState("");

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setError("");
    }

    async function handleRegister() {
        setError("");
        if (!form.businessName.trim()) { setError("Business name is required"); return; }
        if (!form.accountId.trim()) { setError("Account ID is required"); return; }
        if (!form.phone.trim()) { setError("Phone number is required"); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/merchants/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            setMerchantId(data.merchantId);
            if (data._devCode) setDevCode(data._devCode); // sandbox only
            setStep("verify");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerify() {
        setError("");
        if (!verifyCode.trim() || verifyCode.length !== 6) { setError("Enter the 6-digit code"); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/merchants/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchantId, code: verifyCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");
            setStep("done");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const accountIdLabel = {
        till: "Till Number",
        paybill: "Paybill Number",
        pochi: "M-Pesa Phone Number",
        sendmoney: "Recipient Phone Number",
    }[form.accountType] || "Account ID";

    if (step === "done") {
        return (
            <div className="page">
                <div className="card" style={{ textAlign: "center" }}>
                    <CardHeader />
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,166,81,0.1)", border: "2px solid var(--mpesa-green)", margin: "24px auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "var(--mpesa-green)" }}>✓</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Merchant Verified</div>
                    <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
                        {form.businessName} is now verified on ScanPesa. You can generate trusted QR codes.
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-input)", borderRadius: 8, padding: "8px 12px", marginBottom: 24, fontFamily: "monospace" }}>
                        Merchant ID: {merchantId}
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate(`/generate/details?type=${form.accountType}&merchantId=${merchantId}`)}>
                        Generate QR Code
                    </button>
                    <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate("/")}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (step === "verify") {
        return (
            <div className="page">
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                    <CardHeader />
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Verify Ownership</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            A 6-digit code was sent to your registered phone number. Enter it below to confirm you own this account.
                        </div>
                    </div>

                    {devCode && (
                        <div style={{ background: "rgba(0,166,81,0.08)", border: "1px solid rgba(0,166,81,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "var(--mpesa-green)" }}>
                            <strong>Sandbox mode — your code is: {devCode}</strong>
                        </div>
                    )}

                    {error && <div className="error-msg">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Verification Code</label>
                        <input
                            className="form-input"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            value={verifyCode}
                            onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                            style={{ fontSize: 24, fontWeight: 800, textAlign: "center", letterSpacing: 8 }}
                            autoFocus
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleVerify} disabled={loading} style={{ marginBottom: 10 }}>
                        {loading ? "Verifying..." : "Confirm & Verify"}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setStep("register")}>Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                <CardHeader />

                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ display: "inline-block", background: "rgba(0,166,81,0.1)", border: "1px solid rgba(0,166,81,0.25)", borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "var(--mpesa-green)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
                        Merchant Onboarding
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Register Your Business</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Verify ownership to generate trusted QR codes</div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input className="form-input" name="businessName" placeholder="e.g. Makila Smart Wash" value={form.businessName} onChange={handleChange} autoFocus />
                </div>

                <div className="form-group">
                    <label className="form-label">Payment Type *</label>
                    <select className="form-input" name="accountType" value={form.accountType} onChange={handleChange} style={{ cursor: "pointer" }}>
                        {ACCOUNT_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">{accountIdLabel} *</label>
                    <input
                        className="form-input"
                        name="accountId"
                        placeholder={form.accountType === "till" ? "e.g. 123456" : form.accountType === "paybill" ? "e.g. 400200" : "e.g. 0712 345 678"}
                        value={form.accountId}
                        onChange={handleChange}
                        inputMode={form.accountType === "till" || form.accountType === "paybill" ? "numeric" : "tel"}
                    />
                </div>

                {form.accountType === "paybill" && (
                    <div className="form-group">
                        <label className="form-label">Account Number (optional)</label>
                        <input className="form-input" name="accountNumber" placeholder="e.g. STORE_001" value={form.accountNumber} onChange={handleChange} />
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Business Phone Number *</label>
                    <input className="form-input" name="phone" type="tel" inputMode="tel" placeholder="e.g. 0712 345 678" value={form.phone} onChange={handleChange} />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Verification code will be sent here</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Owner Name (optional)</label>
                    <input className="form-input" name="ownerName" placeholder="Full name" value={form.ownerName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">National ID (optional)</label>
                    <input className="form-input" name="nationalId" placeholder="ID number" value={form.nationalId} onChange={handleChange} inputMode="numeric" />
                </div>

                <button className="btn btn-primary" onClick={handleRegister} disabled={loading} style={{ marginBottom: 10 }}>
                    {loading ? "Submitting..." : "Register & Get Verification Code"}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/")}>Cancel</button>

                <div className="powered-by" style={{ marginTop: 20 }}>Secured by ScanPesa Verification</div>
            </div>
        </div>
    );
}
