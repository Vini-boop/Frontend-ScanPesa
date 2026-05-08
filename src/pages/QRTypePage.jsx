// QRTypePage.jsx  Step 1: Choose payment type
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardHeader  from "../components/CardHeader";
import tillLogo    from "../assets/till-logo.jpg";
import paybillLogo from "../assets/paybill-logo.webp";
import pochiLogo   from "../assets/pochi-logo.jpg";

const TYPES = [
  { key: "till",    img: tillLogo,    alt: "Till Number",       label: "Till Number",       desc: "Buy Goods & Services  for shops, restaurants, and retail",          badge: "Most common" },
  { key: "paybill", img: paybillLogo, alt: "Paybill",           label: "Paybill",           desc: "Pay Bill / Lipa Na M-Pesa  for utilities, schools, clinics",        badge: null },
  { key: "pochi",   img: pochiLogo,   alt: "Pochi La Biashara", label: "Pochi La Biashara", desc: "Accept payments directly to your M-Pesa  ideal for small businesses", badge: null },
];

export default function QRTypePage() {
  const navigate = useNavigate();
  const [type, setType] = useState("till");

  return (
    <div className="page" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <div className="card" style={{ display: "flex", flexDirection: "column" }}>
        <CardHeader />
        <StepDots current={0} />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-block", background: "rgba(0,166,81,0.1)", border: "1px solid rgba(0,166,81,0.25)", borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "var(--mpesa-green)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
            Step 1 of 3
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" }}>How do customers pay you?</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Choose your M-Pesa payment method</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {TYPES.map(({ key, img, alt, label, desc, badge }) => {
            const active = type === key;
            return (
              <button key={key} onClick={() => setType(key)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: `2px solid ${active ? "var(--mpesa-green)" : "var(--border)"}`, background: active ? "rgba(0,166,81,0.07)" : "var(--bg-input)", color: "var(--text-primary)", textAlign: "left", width: "100%", transition: "all 0.2s", boxShadow: active ? "0 0 0 4px rgba(0,166,81,0.08)" : "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, overflow: "hidden", border: `1px solid ${active ? "rgba(0,166,81,0.3)" : "var(--border)"}` }}>
                  <img src={img} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                    {badge && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--mpesa-green)", background: "rgba(0,166,81,0.1)", borderRadius: 100, padding: "2px 8px" }}>{badge}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `2px solid ${active ? "var(--mpesa-green)" : "var(--border)"}`, background: active ? "var(--mpesa-green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                  {active && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}></span>}
                </div>
              </button>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={() => navigate(`/generate/details?type=${type}`)}>Continue </button>
        <div className="powered-by" style={{ marginTop: 20 }}>Powered by Safaricom Daraja API</div>
      </div>
    </div>
  );
}

export function StepDots({ current }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: i === current ? 28 : 8, height: 8, borderRadius: 4, background: i === current ? "var(--mpesa-green)" : i < current ? "var(--mpesa-dark)" : "var(--border)", transition: "all 0.3s ease" }} />
      ))}
    </div>
  );
}


