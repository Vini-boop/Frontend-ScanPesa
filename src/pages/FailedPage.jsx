// FailedPage.jsx - Payment failed or cancelled
import { useSearchParams, useNavigate } from "react-router-dom";
import CardHeader from "../components/CardHeader";

const REASON_MAP = {
  cancelled: "You cancelled the M-Pesa request or entered the wrong PIN.",
  timeout: "The payment request timed out. No payment was made.",
  failed: "The payment could not be processed. Please try again.",
};

export default function FailedPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const ref = params.get("ref") || "";
  const reason = params.get("reason") || "failed";
  const message = REASON_MAP[reason] || REASON_MAP.failed;

  function handleRetry() {
    navigate(-2);
  }

  return (
    <div className="page">
      <div className="card">
        <CardHeader />

        <div className="result-icon failure">X</div>

        <div className="result-title failure">Payment Failed</div>
        <div className="result-subtitle">{message}</div>

        {ref && (
          <div style={{ marginBottom: 24 }}>
            <div className="receipt-row">
              <span className="receipt-label">Reference</span>
              <span className="receipt-value">{ref}</span>
            </div>
          </div>
        )}

        <button id="retry-btn" className="btn btn-primary" onClick={handleRetry}>
          Try Again
        </button>

        <div className="powered-by" style={{ marginTop: 16 }}>
          No amount was deducted from your account.
        </div>
      </div>
    </div>
  );
}
