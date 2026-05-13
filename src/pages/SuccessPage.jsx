// SuccessPage.jsx - Payment confirmed
import { useSearchParams, useNavigate } from "react-router-dom";
import CardHeader from "../components/CardHeader";

export default function SuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const receipt = params.get("receipt") || "N/A";
  const amount = params.get("amount") || "";
  const merchant = params.get("merchant") || "Merchant";
  const ref = params.get("ref") || "";
  const now = new Date().toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="page">
      <div className="card">
        <CardHeader />

        <div className="result-icon success">✓</div>

        <div className="result-title success">Payment Successful!</div>
        <div className="result-subtitle">
          Your M-Pesa payment has been confirmed.
        </div>

        <div style={{ marginBottom: 24 }}>
          {amount && (
            <div className="receipt-row">
              <span className="receipt-label">Amount Paid</span>
              <span className="receipt-value green">
                KES {Number(amount).toLocaleString()}
              </span>
            </div>
          )}
          <div className="receipt-row">
            <span className="receipt-label">Merchant</span>
            <span className="receipt-value">{merchant}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">M-Pesa Receipt</span>
            <span className="receipt-value green">{receipt}</span>
          </div>
          {ref && (
            <div className="receipt-row">
              <span className="receipt-label">Order Ref</span>
              <span className="receipt-value">{ref}</span>
            </div>
          )}
          <div className="receipt-row">
            <span className="receipt-label">Date and Time</span>
            <span className="receipt-value">{now}</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/")} id="done-btn">
          Done
        </button>

        <div className="powered-by" style={{ marginTop: 16 }}>
          Secured by Safaricom M-Pesa
        </div>
      </div>
    </div>
  );
}
