// CardHeader.jsx - Shared header for all card pages
import mpesaLogo from "../assets/mpesa-logo.png";

export default function CardHeader() {
    return (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img
                src={mpesaLogo}
                alt="M-Pesa"
                style={{ height: 36, objectFit: "contain", display: "block", margin: "0 auto 6px" }}
            />
            <div style={{
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: "-0.3px",
                lineHeight: 1,
                fontFamily: "'Montserrat', sans-serif",
            }}>
                <span style={{ color: "var(--text-primary)" }}>Scan</span>
                <span style={{ color: "#e53e5a" }}>Pesa</span>
                <sup style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    verticalAlign: "super",
                    marginLeft: 1,
                }}>TM</sup>
            </div>
        </div>
    );
}
