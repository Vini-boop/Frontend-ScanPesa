// LandingPage.jsx
import { useNavigate } from "react-router-dom";
import mpesaLogo from "../assets/mpesa-logo.png";
import ThemeToggle from "../components/ThemeToggle";

const HOW_IT_WORKS = [
    { step: "01", label: "QR", title: "Create your QR", desc: "Enter your business name and Till or Paybill number. Your QR is generated instantly — no account needed." },
    { step: "02", label: "Print", title: "Print or display it", desc: "Download the QR as a PNG. Print it, frame it, or show it on a screen at your counter." },
    { step: "03", label: "Scan", title: "Customer scans", desc: "Customer points their camera or Google Lens at the QR. The payment page opens automatically." },
    { step: "04", label: "Done", title: "Money in seconds", desc: "Customer enters their M-Pesa PIN. You both get instant confirmation. Done." },
];

const BUSINESS_TYPES = [
    "Retail Shops", "Restaurants", "Salons & Spas", "Transport",
    "Clinics", "Delivery", "Schools", "Contractors",
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-dark)", color: "var(--text-primary)", fontFamily: "var(--font-ui)", overflowX: "hidden" }}>

            {/* NAV */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid var(--nav-border)",
                position: "sticky", top: 0, zIndex: 100,
                background: "var(--nav-bg)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={mpesaLogo} alt="M-Pesa" style={{ height: 30, objectFit: "contain" }} />
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 900, letterSpacing: "-0.3px", lineHeight: 1 }}>
                        <span style={{ color: "var(--text-primary)" }}>Scan</span>
                        <span style={{ color: "#e53e5a" }}>Pesa</span>
                        <sup style={{ fontSize: 9, color: "var(--text-muted)", verticalAlign: "super", marginLeft: 1 }}>TM</sup>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <ThemeToggle />
                    <button
                        onClick={() => navigate("/generate")}
                        style={{
                            background: "var(--mpesa-green)", color: "#fff", border: "none",
                            borderRadius: 8, padding: "10px 20px",
                            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-ui)",
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <section style={{
                textAlign: "center",
                padding: "64px 24px 56px",
                background: "var(--hero-glow)",
            }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--badge-bg)", border: "1px solid var(--badge-border)",
                    borderRadius: 100, padding: "6px 16px",
                    fontSize: 12, fontWeight: 600, color: "var(--badge-color)",
                    marginBottom: 28, fontFamily: "var(--font-ui)",
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--mpesa-green)", display: "inline-block" }} />
                    Powered by Safaricom Daraja API
                </div>

                <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 7vw, 48px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
                    Accept M-Pesa Payments
                    <br />
                    <span style={{ color: "var(--mpesa-green)" }}>With a Single QR Code</span>
                </h1>

                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 400, margin: "0 auto 40px" }}>
                    Generate a QR code for your business in 30 seconds.
                    Customers scan it and pay instantly — no app, no hassle.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 340, margin: "0 auto" }}>
                    <button
                        onClick={() => navigate("/generate")}
                        style={{
                            width: "100%", background: "linear-gradient(135deg, var(--mpesa-green), var(--mpesa-dark))",
                            color: "#fff", border: "none", borderRadius: 14, padding: "18px 32px",
                            fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-ui)",
                            boxShadow: "0 12px 40px rgba(0,166,81,0.35)",
                        }}
                    >
                        Generate My QR Code
                    </button>
                    <button
                        onClick={() => navigate("/pay")}
                        style={{
                            width: "100%", background: "var(--bg-input)", color: "var(--text-primary)",
                            border: "1.5px solid var(--border)", borderRadius: 14, padding: "16px 32px",
                            fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-ui)",
                        }}
                    >
                        I have a QR — Pay Now
                    </button>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 36, flexWrap: "wrap" }}>
                    {["Secure and Encrypted", "Instant Confirmation", "Kenya"].map((t) => (
                        <span key={t} style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--trust-color)", fontWeight: 500 }}>{t}</span>
                    ))}
                </div>
            </section>

            {/* STATS */}
            <section style={{
                display: "flex", justifyContent: "center",
                borderTop: "1px solid var(--section-border)",
                borderBottom: "1px solid var(--section-border)",
            }}>
                {[
                    { value: "30s", label: "Setup time" },
                    { value: "FREE", label: "Always free" },
                    { value: "24/7", label: "Always on" },
                ].map(({ value, label }, i) => (
                    <div key={i} style={{
                        flex: 1, textAlign: "center", padding: "28px 12px",
                        borderRight: i < 2 ? "1px solid var(--section-border)" : "none",
                    }}>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 900, color: "var(--stat-value)", letterSpacing: "-1px" }}>{value}</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
                    </div>
                ))}
            </section>

            {/* HOW IT WORKS */}
            <section style={{ padding: "56px 24px", maxWidth: 480, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--mpesa-green)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 10 }}>
                        How it works
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
                        From setup to payment in under a minute
                    </h2>
                </div>

                {HOW_IT_WORKS.map(({ step, label, title, desc }, i, arr) => (
                    <div key={i} style={{ display: "flex" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                background: "var(--step-icon-bg)", border: "1px solid var(--step-icon-bd)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "var(--font-heading)", fontSize: 11, fontWeight: 900,
                                color: "var(--mpesa-green)", letterSpacing: "0.5px",
                            }}>
                                {label}
                            </div>
                            {i < arr.length - 1 && (
                                <div style={{ width: 1, flex: 1, background: "var(--step-line)", margin: "4px 0", minHeight: 28 }} />
                            )}
                        </div>
                        <div style={{ paddingBottom: i < arr.length - 1 ? 28 : 0, paddingTop: 8 }}>
                            <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, color: "var(--mpesa-green)", letterSpacing: "1px", marginBottom: 2 }}>STEP {step}</div>
                            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{desc}</div>
                        </div>
                    </div>
                ))}
            </section>

            {/* WHO IS IT FOR */}
            <section style={{
                padding: "48px 24px",
                background: "var(--section-alt)",
                borderTop: "1px solid var(--section-border)",
                borderBottom: "1px solid var(--section-border)",
            }}>
                <div style={{ maxWidth: 480, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 28 }}>
                        <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, color: "var(--mpesa-green)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 10 }}>
                            Perfect for
                        </div>
                        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800 }}>Any business that accepts M-Pesa</h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {BUSINESS_TYPES.map((label) => (
                            <div key={label} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "14px 16px", borderRadius: 12,
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "var(--mpesa-green)", flexShrink: 0,
                                }} />
                                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section style={{ padding: "64px 24px", textAlign: "center" }}>
                <div style={{ maxWidth: 380, margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 12 }}>
                        Ready to get paid<br />
                        <span style={{ color: "var(--mpesa-green)" }}>the smart way?</span>
                    </h2>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.7 }}>
                        Set up your M-Pesa QR code in 30 seconds. Free forever.
                    </p>
                    <button
                        onClick={() => navigate("/generate")}
                        style={{
                            width: "100%",
                            background: "linear-gradient(135deg, var(--mpesa-green), var(--mpesa-dark))",
                            color: "#fff", border: "none", borderRadius: 14,
                            padding: "20px 32px", fontSize: 18, fontWeight: 800,
                            cursor: "pointer", fontFamily: "var(--font-ui)",
                            boxShadow: "0 16px 48px rgba(0,166,81,0.4)",
                        }}
                    >
                        Generate My QR Code — Free
                    </button>
                    <div style={{ fontFamily: "var(--font-body)", marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
                        No account needed · Works on any phone · Instant setup
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{
                borderTop: "1px solid var(--section-border)",
                padding: "24px", textAlign: "center",
                fontFamily: "var(--font-body)", fontSize: 12, color: "var(--footer-color)",
            }}>
                <img src={mpesaLogo} alt="M-Pesa" style={{ height: 22, objectFit: "contain", marginBottom: 10, opacity: 0.5 }} />
                <div>Secured by Safaricom Daraja API · M-Pesa is a registered trademark of Safaricom PLC</div>
            </footer>

        </div>
    );
}
