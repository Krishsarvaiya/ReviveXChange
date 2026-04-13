import { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../lib/api";

function LoginPage({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      onAuthSuccess({ token: data.token, user: data.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-premium">
      <article className="auth-brand">
        <p className="site-name">TimelessTreasures</p>
        <h2>Welcome Back to Vintage Marketplace</h2>
        <p>
          Buy, sell, repair, and exchange collectible products with confidence and detailed product
          history.
        </p>
      </article>
      <form className="panel auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p>Access your marketplace account.</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
        <small>
          New user? <Link to="/signup">Create an account</Link>
        </small>
      </form>
    </section>
  );
}

export default LoginPage;
