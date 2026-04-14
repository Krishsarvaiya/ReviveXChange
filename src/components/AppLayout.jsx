import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { createContactMessage } from "../lib/api";

const links = [
  { to: "/app/marketplace", label: "Marketplace" },
  { to: "/app/repair", label: "Repair" },
  { to: "/app/exchange", label: "Exchange" },
  { to: "/app/sell", label: "Sell" },
  { to: "/app/resell", label: "Resell" },
  { to: "/app/compare", label: "Compare" },
];

function AppLayout({ onLogout }) {
  const navigate = useNavigate();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");
    setContactLoading(true);
    try {
      const data = await createContactMessage({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      });
      setContactSuccess(`Message sent successfully (ticket #${data.id}).`);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const q = headerSearch.trim();
    navigate(q ? `/app/marketplace?search=${encodeURIComponent(q)}` : "/app/marketplace");
  };

  return (
    <div className="app-shell">
      <header className="market-header">
        <p className="header-note">
          Trusted vintage marketplace for collectibles, repairs, exchange deals, and secure checkout.
        </p>

        <div className="market-header-main">
          <div className="brand-block">
            <p className="site-name">TimelessTreasures</p>
            <span className="brand-dot" />
          </div>

          <nav className="market-links">
            <a href="#!">Cars</a>
            <a href="#!">Watches</a>
            <a href="#!">Clocks</a>
            <a href="#!">Rugs</a>
            <a href="#!">Showpieces</a>
          </nav>

          <div className="header-actions">
            <button type="button" className="nav-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <form className="header-search-wrap" onSubmit={handleHeaderSearch}>
          <span className="search-icon">⌕</span>
          <input
            className="header-search"
            placeholder="Search products, eras, artisans, and categories"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
          />
        </form>

        <div className="topbar-heading">
          <p className="brand-kicker">Vintage Platform</p>
          <h1>Buy, Sell, Exchange, and Repair Hassle Free</h1>
        </div>

        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="panel contact-footer">
        <h3>Contact Us</h3>
        <p>Share your query, partnership request, or support issue.</p>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          {contactError ? (
            <p className="auth-error" role="alert">
              {contactError}
            </p>
          ) : null}
          {contactSuccess ? (
            <p className="form-success" role="status">
              {contactSuccess}
            </p>
          ) : null}
          <input
            type="text"
            placeholder="Your name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            minLength={2}
          />
          <input
            type="email"
            placeholder="Your email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Subject (optional)"
            value={contactSubject}
            onChange={(e) => setContactSubject(e.target.value)}
          />
          <textarea
            rows={4}
            placeholder="Write your message..."
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            required
            minLength={10}
          />
          <button type="submit" className="btn-primary" disabled={contactLoading}>
            {contactLoading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </footer>
    </div>
  );
}

export default AppLayout;
