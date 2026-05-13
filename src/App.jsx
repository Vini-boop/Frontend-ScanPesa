// App.jsx — Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PayPage from "./pages/PayPage";
import WaitingPage from "./pages/WaitingPage";
import SuccessPage from "./pages/SuccessPage";
import FailedPage from "./pages/FailedPage";
import QRTypePage from "./pages/QRTypePage";
import QRDetailsPage from "./pages/QRDetailsPage";
import QRDisplayPage from "./pages/QRDisplayPage";
import MerchantRegisterPage from "./pages/MerchantRegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<MerchantRegisterPage />} />
        <Route path="/generate" element={<QRTypePage />} />
        <Route path="/generate/details" element={<QRDetailsPage />} />
        <Route path="/generate/qr" element={<QRDisplayPage />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failed" element={<FailedPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
