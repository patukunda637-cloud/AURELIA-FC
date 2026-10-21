import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './SignInPage.css';

export default function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const next: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length === 0) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate('/account', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length ? null : err.message);
      } else {
        setFormError('We could not sign you in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Sign In to Aurelia FC</h1>
      <p className="auth-card__sub">Access your tickets, order history and membership portal.</p>

      {formError && (
        <div role="alert" className="auth-alert">{formError}</div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className={`input${errors.email ? ' input--invalid' : ''}`}
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
          {errors.email && <p className="field__error">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">Password</label>
          <div className="auth-password">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input${errors.password ? ' input--invalid' : ''}`}
              placeholder="RoyalPassword123"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          {errors.password && <p className="field__error">{errors.password}</p>}
        </div>

        <div className="auth-card__row">
          <label className="auth-card__check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link to="/contact" className="auth-card__link">Forgot Password?</Link>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>

      <p className="auth-card__divider">or continue with</p>

      <div className="auth-card__oauth">
        <button type="button" className="btn btn--outline" disabled>Google</button>
        <button type="button" className="btn btn--outline" disabled>Apple</button>
      </div>

      <p className="auth-card__foot">
        Don&apos;t have an account? <Link to="/signup" className="auth-card__link">Sign Up</Link>
      </p>
    </div>
  );
}
