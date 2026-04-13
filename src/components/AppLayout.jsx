import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
  { to: "/app/marketplace", label: "Marketplace" },
  { to: "/app/repair", label: "Repair" },
  { to: "/app/exchange", label: "Exchange" },
  { to: "/app/resell", label: "Resell" },
  { to: "/app/compare", label: "Compare" },
];

function AppLayout({ onLogout }) {
  const navigate = useNavigate();

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
            <button type="button" className="ghost-action">
              Explore
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate("/app/resell")}>
              Sell
            </button>
            <button type="button" className="ghost-action">
              Favourites
            </button>
            <button type="button" className="nav-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="header-search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="header-search"
            placeholder="Search products, eras, artisans, and categories"
          />
        </div>

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
        <form className="contact-form">
          <input type="text" placeholder="Your name" />
          <input type="email" placeholder="Your email" />
          <textarea rows={4} placeholder="Write your message..." />
          <button type="button" className="btn-primary">
            Send Message
          </button>
        </form>
      </footer>
    </div>
  );
}

export default AppLayout;
