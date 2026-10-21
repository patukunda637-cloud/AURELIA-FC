import { Link, Outlet } from 'react-router-dom';
import './AuthLayout.css';

/** Centred, chrome-free shell used by the Sign In / Sign Up screens. */
export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <header className="auth-shell__header">
        <Link to="/" className="auth-shell__brand">
          <span className="brand__name">AURELIA FC</span>
        </Link>
        <p className="auth-shell__eyebrow">AURELIA FOOTBALL CLUB</p>
      </header>
      <main className="auth-shell__main">
        <Outlet />
      </main>
      <footer className="auth-shell__footer">
        <Link to="/">© {new Date().getFullYear()} Aurelia Football Club</Link>
      </footer>
    </div>
  );
}
