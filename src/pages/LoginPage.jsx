import { Link } from "react-router-dom";

function LoginPage({ onLogin }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin();
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
        <input type="email" placeholder="Email address" />
        <input type="password" placeholder="Password" />
        <button type="submit" className="btn-primary">
          Login
        </button>
        <small>
          New user? <Link to="/signup">Create an account</Link>
        </small>
      </form>
    </section>
  );
}

export default LoginPage;
