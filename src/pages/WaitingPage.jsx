// WaitingPage.jsx - Polls backend for payment status
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../services/api";
import CardHeader from "../components/CardHeader";

const TIMEOUT_SECS = 90;
const POLL_INTERVAL = 3000;

export default function WaitingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const reference = params.get("ref") || "";
  const merchant = params.get("merchant") || "Merchant";
  const amount = params.get("amount") || "";

  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECS);
  const [dots, setDots] = useState(".");
  const resolvedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !resolvedRef.current) {
      resolvedRef.current = true;
      navigate(`/failed?ref=${reference}&reason=timeout`);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft]);

  useEffect(() => {
    if (!reference) return;
    const poll = async () => {
      if (resolvedRef.current) return;
      try {
        const data = await getPaymentStatus(reference);
        if (data.status === "paid") {
          resolvedRef.current = true;
          navigate(`/success?ref=${reference}&receipt=${data.receipt || ""}&amount=${data.amount || amount}&merchant=${encodeURIComponent(merchant)}`);
        } else if (data.status === "failed") {
          resolvedRef.current = true;
          navigate(`/failed?ref=${reference}&reason=cancelled`);
        }
      } catch (_) { }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [reference]);

  useEffect(() => {
    if (!reference) return;
    let unsubscribe = null;
    (async () => {
      try {
        const { db } = await import("../services/firebase");
        const { doc, onSnapshot } = await import("firebase/firestore");
        const docRef = doc(db, "payments", reference);
        unsubscribe = onSnapshot(docRef, (snap) => {
          if (!snap.exists() || resolvedRef.current) return;
          const d = snap.data();
          if (d.status === "paid") {
            resolvedRef.current = true;
            navigate(`/success?ref=${reference}&receipt=${d.receipt || ""}&amount=${d.amount || amount}&merchant=${encodeURIComponent(merchant)}`);
          } else if (d.status === "failed") {
            resolvedRef.current = true;
            navigate(`/failed?ref=${reference}&reason=cancelled`);
          }
        });
      } catch (_) { }
    })();
    return () => unsubscribe?.();
  }, [reference]);

  const progress = ((TIMEOUT_SECS - timeLeft) / TIMEOUT_SECS) * 100;

  return (
    <div className="page">
      <div className="card">
        <CardHeader />

        <div className="spinner-wrapper">
          <div className="pulse-ring">
            <span style={{ fontSize: 28, zIndex: 2, fontWeight: 900, color: "var(--mpesa-green)" }}>M</span>
          </div>

          <div>
            <div className="wait-title">Check Your Phone{dots}</div>
            <div className="wait-subtitle">
              An M-Pesa STK Push has been sent.<br />
              Enter your M-Pesa PIN to complete payment.
            </div>
          </div>

          {amount && (
            <div className="amount-display">
              <span className="currency">KES</span>
              <span className="amount-value">{Number(amount).toLocaleString()}</span>
            </div>
          )}

          <div style={{ width: "100%" }}>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: "var(--mpesa-green)",
                transition: "width 1s linear", borderRadius: 4,
              }} />
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--text-secondary)" }}>
              Waiting for confirmation... {timeLeft}s
            </div>
          </div>
        </div>

        <div className="powered-by" style={{ marginTop: 24 }}>Do NOT close this page</div>
      </div>
    </div>
  );
}
