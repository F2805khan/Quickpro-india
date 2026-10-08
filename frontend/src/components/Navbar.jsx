import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Bell,
  Headset,
  History,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  Settings,
  X,
  ShoppingBag,
  BrainCircuit
} from "lucide-react";


const baseLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/services", label: "Services", icon: Settings },
  { to: "/ai-vision", label: "AI Vision", icon: BrainCircuit },
  { to: "/support", label: "Customer Support", icon: Headset }
];

function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  const handleCartClick = () => {
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 300);
  };

  const closeMenus = () => {
    setOpen(false);
    setProfileOpen(false);
  };

  const logout = () => {
    onLogout();
    closeMenus();
  };

  return (
    <header className="navbar-shell">
      <nav className="navbar container">
        <Link to="/" className="brand" onClick={closeMenus}>
          <span className="brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/images/site/logo.png" alt="Quickpro India" style={{ height: '34px', objectFit: 'contain' }} />
          </span>
          <span>
            <small>All Services. One Click.</small>
          </span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${open ? "is-open" : ""}`}>
          {baseLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={closeMenus}>
              <Icon size={22} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <button className="icon-button" aria-label="Notifications" title="Notifications">
            <Bell size={20} />
            <span className="notification-dot" />
          </button>

          <button 
            className={`icon-button cart-icon ${animateCart ? 'pop-animation' : ''}`} 
            aria-label="Cart" 
            title="Cart"
            onClick={handleCartClick}
          >
            <ShoppingBag size={20} />
            <span className="cart-badge">2</span>
          </button>
          
          {user ? (
            <>
              <div className="profile-menu-wrap">
                <button
                  className={`session-pill ${user.role === "admin" ? "admin" : ""}`}
                  onClick={() => {
                    setProfileOpen((value) => !value);
                    setOpen(false);
                  }}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  {user.role === "admin" ? <ShieldCheck size={15} /> : <UserRound size={15} />}
                  {user.name || user.userId || "Account"}
                </button>
                {profileOpen && (
                  <div className="profile-menu" role="menu">
                    <Link to="/profile?tab=history" onClick={closeMenus} role="menuitem">
                      <History size={16} /> History
                    </Link>

                    <button type="button" onClick={logout} role="menuitem">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link className="btn btn-primary compact" to="/login">
              Login / Signup
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
