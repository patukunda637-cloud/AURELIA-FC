import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './SignUpPage.css';

type Strength = 0 | 1 | 2 | 3;

/**
 * Mirrors the server-side password policy verbatim
 * (`Validation.StrongPasswordRegex` = `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$`):
 * at least 8 characters with a lower-case letter, an upper-case letter and a digit.
 * The strength meter is purely advisory on top of that hard requirement.
 */
function scorePassword(value: string): { score: Strength; label: string; meetsPolicy: boolean } {
  const meetsPolicy = value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
  if (!meetsPolicy) {
    return { score: value.length === 0 ? 0 : 1, label: value.length < 8 ? 'Too short' : 'Needs upper, lower & a number', meetsPolicy: false };
  }
  let classes = 3;
  if (/[^A-Za-z0-9]/.test(value)) classes += 1;
  if (value.length >= 12 && classes >= 4) return { score: 3, label: 'Strong', meetsPolicy: true };
  if (value.length >= 10) return { score: 2, label: 'Good', meetsPolicy: true };
  return { score: 1, label: 'Acceptable', meetsPolicy: true };
}

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const next: Record<string, string> = {};
    if (firstName.trim().length < 2) next.firstName = 'Please enter your first name.';
    if (lastName.trim().length < 2) next.lastName = 'Please enter your last name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!strength.meetsPolicy) {
      next.password = password.length < 8
        ? 'Use at least 8 characters.'
        : 'Include an upper-case letter and a number.';
    }
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    if (!agreed) next.agreed = 'Please accept the Terms & Conditions to continue.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      navigate('/account', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length ? null : err.message);
      } else {
        setFormError('We could not create your account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Create Your Account</h1>
      <p className="auth-card__sub">
        Join Aurelia FC today to buy tickets, unlock membership tiers, and store secure purchase histories.
      </p>

      {formError && <div role="alert" className="auth-alert">{formError}</div>}

      <form onSubmit={onSubmit} noValidate>
        <div className="auth-card__pair">
          <div className="field">
            <label className="field__label" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              className={`input${errors.firstName ? ' input--invalid' : ''}`}
              placeholder="Arthur"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: '' })); }}
              aria-invalid={Boolean(errors.firstName)}
              autoComplete="given-name"
            />
            {errors.firstName && <p className="field__error">{errors.firstName}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              className={`input${errors.lastName ? ' input--invalid' : ''}`}
              placeholder="Sterling"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: '' })); }}
              aria-invalid={Boolean(errors.lastName)}
              autoComplete="family-name"
            />
            {errors.lastName && <p className="field__error">{errors.lastName}</p>}
          </div>
        </div>

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
              autoComplete="new-password"
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
          {password.length > 0 && (
            <>
              <div className="password-strength" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`password-strength__bar${i < strength.score ? ' password-strength__bar--on' : ''}`} />
                ))}
              </div>
              <p className="password-strength__label">Strength: {strength.label}</p>
            </>
          )}
          {errors.password && <p className="field__error">{errors.password}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className={`input${errors.confirmPassword ? ' input--invalid' : ''}`}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
            aria-invalid={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="field__error">{errors.confirmPassword}</p>}
        </div>

        <div className="field">
          <label className="auth-card__check auth-card__check--terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: '' })); }}
              aria-invalid={Boolean(errors.agreed)}
            />
            <span>I agree to the Terms &amp; Conditions and Privacy Policy.</span>
          </label>
          {errors.agreed && <p className="field__error">{errors.agreed}</p>}
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p className="auth-card__divider">or continue with</p>

      <div className="auth-card__oauth">
        <button type="button" className="btn btn--outline" disabled>Google</button>
        <button type="button" className="btn btn--outline" disabled>Apple</button>
      </div>

      <p className="auth-card__foot">
        Already have an account? <Link to="/signin" className="auth-card__link">Sign In</Link>
      </p>
    </div>
  );
}
