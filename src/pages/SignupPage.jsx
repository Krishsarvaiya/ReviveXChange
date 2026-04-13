import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../lib/api";

function SignupPage({ onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({ name, email, password, role });
      onAuthSuccess({ token: data.token, user: data.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-premium">
      <article className="auth-brand">
        <p className="site-name">TimelessTreasures</p>
        <h2>Create Your Vintage Profile</h2>
        <p>
          Join collectors, restorers, and sellers in one premium platform for timeless products.
        </p>
      </article>
      <form className="panel auth-card" onSubmit={handleSubmit}>
        <h2>Signup</h2>
        <p>Create account to buy, sell, exchange, and request repairs.</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
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
          autoComplete="new-password"
          placeholder="Create password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="repair_shop">Repair shop</option>
        </select>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>
        <small>
          Already have account? <Link to="/login">Login</Link>
        </small>
      </form>
    </section>
  );
}

export default SignupPage;
