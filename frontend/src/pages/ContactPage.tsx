import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import { Loading, ErrorState, StatusBanner } from '../components/States';
import './ContactPage.css';

interface FormState {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = { fullName: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const departments = useAsync(() => api.departments(), []);
  const faqs = useAsync(() => api.faqs(), []);
  const club = useAsync(() => api.club(), []);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const subjects = departments.data?.map((d) => d.name) ?? ['General Enquiries'];

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Please enter your full name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.subject) next.subject = 'Please choose a subject.';
    if (form.message.trim().length < 10) next.message = 'Your message must be at least 10 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResult(null);
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.sendContactMessage({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      setResult(`${res.message} Your reference is ${res.reference}.`);
      setForm(EMPTY);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setSubmitError(Object.keys(err.fieldErrors).length ? null : err.message);
      } else {
        setSubmitError('We could not send your message. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Figma reference (contact.pdf) has no hero image — the title sits on the page
          background. Its only image is the 832x364 stadium map lower down the page. */}
      <PageHero
        eyebrow="Support"
        title="Contact Us"
        subtitle="Questions about tickets, membership or matchday? We're here to help."
        compact
      />

      <section className="section">
        <div className="container contact-grid">
          {/* ---------- Form ---------- */}
          <div>
            <h2 className="contact-heading">Send a Message</h2>

            {result && <StatusBanner tone="success">{result}</StatusBanner>}
            {submitError && <StatusBanner tone="error">{submitError}</StatusBanner>}

            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <div className="field">
                <label className="field__label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  className={`input${errors.fullName ? ' input--invalid' : ''}`}
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  aria-invalid={Boolean(errors.fullName)}
                  autoComplete="name"
                />
                {errors.fullName && <p className="field__error">{errors.fullName}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className={`input${errors.email ? ' input--invalid' : ''}`}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                />
                {errors.email && <p className="field__error">{errors.email}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  className={`select${errors.subject ? ' input--invalid' : ''}`}
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                  aria-invalid={Boolean(errors.subject)}
                >
                  <option value="">Select a subject…</option>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="field__error">{errors.subject}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className={`textarea${errors.message ? ' input--invalid' : ''}`}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <p className="field__error">{errors.message}</p>}
              </div>

              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'SENDING…' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

          {/* ---------- Departments ---------- */}
          <aside>
            <h2 className="contact-heading">Contact Details</h2>
            {departments.loading && <Loading label="Loading contacts…" />}
            {departments.error && <ErrorState message={departments.error} onRetry={departments.reload} />}
            <div className="dept-list">
              {(departments.data ?? []).map((d) => (
                <article key={d.name} className="dept-card">
                  <h3>{d.name}</h3>
                  <a href={`mailto:${d.email}`} className="gold">{d.email}</a>
                  {d.phone && <p>{d.phone}</p>}
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Stadium location ---------- */}
      <section className="section section--surface">
        <div className="container">
          <h2 className="contact-heading">Stadium Location</h2>
          <div className="location">
            <div className="location__copy">
              <h3>{club.data?.stadiumName ?? 'Aurelia Arena'}</h3>
              <p>{club.data?.address ?? '100 Royal Way, Aurelia'}</p>
              <p className="gold">{club.data?.phone ?? '+44 (0) 20 8123 4567'}</p>
            </div>
            <div className="location__map">
              <img src="/assets/images/stadium-map.jpg" alt="Map showing the location of Aurelia Arena" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section">
        <div className="container contact-faq">
          <h2 className="contact-heading">Frequently Asked Questions</h2>
          {faqs.loading && <Loading label="Loading FAQs…" />}
          {faqs.error && <ErrorState message={faqs.error} onRetry={faqs.reload} />}

          <div className="accordion">
            {(faqs.data ?? []).map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.question} className={`accordion__item${open ? ' accordion__item--open' : ''}`}>
                  <h3>
                    <button
                      type="button"
                      className="accordion__trigger"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      <span>{f.question}</span>
                      <span aria-hidden="true" className="accordion__icon">{open ? '−' : '+'}</span>
                    </button>
                  </h3>
                  {open && <div className="accordion__panel"><p>{f.answer}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
