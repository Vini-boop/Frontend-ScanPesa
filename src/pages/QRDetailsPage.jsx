// QRDetailsPage.jsx - Step 2: Business details
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StepDots } from "./QRTypePage";
import CardHeader from "../components/CardHeader";

export default function QRDetailsPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const type = params.get("type") || "till";

    const [form, setForm] = useState({ merchant: "", till: "", paybill: "", account: "", amount: "", ref: "" });
    const [error, setError] = useState("");

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError("");
    }

    function handleGenerate() {
        if (!form.merchant.trim()) { setError("Business name is required."); return; }
        if (type === "till" && !form.till.trim()) { setError("Till number is required."); return; }
        if (type === "paybill" && !form.paybill.trim()) { setError("Paybill number is required."); return; }
        if (type === "pochi" && !form.till.trim()) { setError("M-Pesa phone number is required."); return; }
        const p = new URLSearchParams({ type, ...form });
        navigate(`/generate/qr?${p.toString()}`);
    }

    const typeLabel = type === "till" ? "Till Number" : type === "paybill" ? "Paybill" : "Pochi La Biashara";

    return (
        <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>

                <CardHeader />
                <StepDots current={1} />

                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        display: "inline-block",
                        background: "rgba(0,166,81,0.1)", border: "1px solid rgba(0,166,81,0.25)",
                        borderRadius: 100, padding: "4px 14px",
                        fontSize: 11, fontWeight: 700, color: "var(--mpesa-green)",
                        letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12,
                    }}>
                        Step 2 of 3
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Business Details</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{typeLabel} setup</div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-group">
                    <label className="form-label">Business / Merchant Name *</label>
                    <input className="form-input" name="merchant" placeholder="e.g. Makila Smart Wash"
                        value={form.merchant} onChange={handleChange} autoFocus />
                </div>

                {type === "till" ? (
                    <div className="form-group">
                        <label className="form-label">Till Number *</label>
                        <input className="form-input" name="till" placeholder="e.g. 123456"
                            value={form.till} onChange={handleChange} inputMode="numeric" />
                    </div>
                ) : type === "paybill" ? (
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
                ) : (
                    <div className="form-group">
                        <label className="form-label">M-Pesa Phone Number *</label>
                        <input className="form-input" name="till" placeholder="e.g. 0712 345 678"
                            value={form.till} onChange={handleChange} inputMode="tel" type="tel" />
                    </div>
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

                <button className="btn btn-primary" onClick={handleGenerate} style={{ marginBottom: 12 }}>
                    Generate QR Code
                </button>
                <button className="btn btn-secondary" onClick={() => navigate("/generate")}>
                    Back
                </button>

                <div className="powered-by" style={{ marginTop: 20 }}>Powered by Safaricom Daraja API</div>
            </div>
        </div>
    );
}
