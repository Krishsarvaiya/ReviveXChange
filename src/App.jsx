import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ExchangePage from "./pages/ExchangePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ComparePage from "./pages/ComparePage";
import CheckoutPage from "./pages/CheckoutPage";
import RepairPage from "./pages/RepairPage";
import ResellPage from "./pages/ResellPage";
import SellPage from "./pages/SellPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SignupPage from "./pages/SignupPage";
import { clearSession, getMe, getStoredToken, persistSession } from "./lib/api";

function ProtectedRoutes({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(() => !getStoredToken());

  useEffect(() => {
    const legacy = localStorage.getItem("vintage_auth") === "true";
    const token = getStoredToken();
    if (!token) {
      if (legacy) {
        clearSession();
      }
      return;
    }

    let cancelled = false;
    getMe()
      .then((data) => {
        if (cancelled) return;
        persistSession({ token, user: data.user });
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthSuccess = (session) => {
    persistSession(session);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
  };

  if (!authReady) {
    return (
      <div className="auth-premium" style={{ minHeight: "100vh", placeItems: "center", display: "grid" }}>
        <p className="panel" style={{ padding: "1.5rem 2rem" }}>
          Loading session…
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/app/marketplace" replace /> : <LoginPage onAuthSuccess={handleAuthSuccess} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/app/marketplace" replace /> : <SignupPage onAuthSuccess={handleAuthSuccess} />
          }
        />

        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route path="/app" element={<AppLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="marketplace" replace />} />
            <Route path="marketplace" element={<HomePage />} />
            <Route path="repair" element={<RepairPage />} />
            <Route path="exchange" element={<ExchangePage />} />
            <Route path="sell" element={<SellPage />} />
            <Route path="resell" element={<ResellPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="product/:productId" element={<ProductDetailsPage />} />
            <Route path="checkout/:productId" element={<CheckoutPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
