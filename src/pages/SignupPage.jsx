import { Link } from "react-router-dom";

function SignupPage({ onSignup }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSignup();
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
        <input type="text" placeholder="Full name" />
        <input type="email" placeholder="Email address" />
        <input type="password" placeholder="Create password" />
        <select defaultValue="customer">
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="repair_shop">Repair shop</option>
        </select>
        <button type="submit" className="btn-primary">
          Create Account
        </button>
        <small>
          Already have account? <Link to="/login">Login</Link>
        </small>
      </form>
    </section>
  );
}

export default SignupPage;
