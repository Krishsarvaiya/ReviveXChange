import { useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ExchangePage from "./pages/ExchangePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ComparePage from "./pages/ComparePage";
import RepairPage from "./pages/RepairPage";
import ResellPage from "./pages/ResellPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SignupPage from "./pages/SignupPage";

function ProtectedRoutes({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("vintage_auth") === "true";
  });

  const handleLogin = () => {
    localStorage.setItem("vintage_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("vintage_auth");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/app/marketplace" replace /> : <LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/app/marketplace" replace /> : <SignupPage onSignup={handleLogin} />}
        />

        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route path="/app" element={<AppLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="marketplace" replace />} />
            <Route path="marketplace" element={<HomePage />} />
            <Route path="repair" element={<RepairPage />} />
            <Route path="exchange" element={<ExchangePage />} />
            <Route path="resell" element={<ResellPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="product/:productId" element={<ProductDetailsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
