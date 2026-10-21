import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Teams', to: '/teams' },
  { label: 'Players', to: '/players' },
  { label: 'Matches', to: '/matches' },
  { label: 'News', to: '/news' },
  { label: 'Shop', to: '/shop' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const { isAuthenticated, user, signOut } = useAuth();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <div className="site-header__inner container">
        <Link to="/" className="brand" aria-label="Aurelia FC home">
          <span className="brand__name">AURELIA FC</span>
          <span className="brand__est">EST. 1987</span>
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>

        <nav
          id="primary-navigation"
          className={`site-nav${open ? ' site-nav--open' : ''}`}
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="site-nav__actions">
            <Link to="/shop" className="site-nav__cart" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
              Cart{count > 0 ? ` (${count})` : ''}
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/account" className="site-nav__link">
                  {user?.firstName ?? 'Account'}
                </Link>
                <button type="button" className="site-nav__link site-nav__signout" onClick={signOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/signin" className="site-nav__link">Sign In</Link>
            )}

            <Link to="/tickets" className="btn btn--primary site-nav__cta">GET TICKETS</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
