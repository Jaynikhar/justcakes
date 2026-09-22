import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Cake, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/cakes', label: 'Cakes' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isOwner, user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    toast.success('Signed out');
    navigate('/');
  };

  const authLinks = (
    <>
      {isAuthenticated ? (
        <>
          <NavLink to="/profile" onClick={close}>
            My profile
          </NavLink>
          {isOwner ? (
            <NavLink to="/owner" onClick={close}>
              Dashboard
            </NavLink>
          ) : null}
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
            <LogOut size={15} /> Sign out
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" onClick={close}>
            Sign in
          </NavLink>
          <Link to="/register" className="btn btn--primary btn--sm" onClick={close}>
            Create account
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={close}>
          <Cake size={26} aria-hidden="true" />
          <span>
            Just Cakes
            <small>Homemade — just for you!</small>
          </span>
        </Link>

        <nav className="navbar__links" aria-label="Main">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
          {authLinks}
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="container">
          <nav className="navbar__drawer" aria-label="Mobile">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={close}
                className={({ isActive }) => (isActive ? 'is-active' : '')}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? <span className="text-small text-muted">Signed in as {user?.name}</span> : null}
            {authLinks}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
