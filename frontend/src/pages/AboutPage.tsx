import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import { Loading, ErrorState } from '../components/States';
import { formatNumber } from '../lib/format';
import './AboutPage.css';

export default function AboutPage() {
  const club = useAsync(() => api.club(), []);
  const milestones = useAsync(() => api.milestones(), []);
  const values = useAsync(() => api.clubValues(), []);
  const honours = useAsync(() => api.honours(), []);
  const executives = useAsync(() => api.executives(), []);

  const info = club.data;

  return (
    <>
      <PageHero
        eyebrow="The Club"
        title="About Aurelia FC"
        subtitle={info?.description}
        imagePath="/assets/images/hero-about.jpg"
      />

      {/* ---------- History timeline ---------- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Our Journey</p>
          <h2 className="about-heading">Club History Timeline</h2>

          {milestones.loading && <Loading label="Loading club history…" />}
          {milestones.error && <ErrorState message={milestones.error} onRetry={milestones.reload} />}

          {milestones.data && (
            <ol className="timeline">
              {milestones.data.map((m) => (
                <li key={m.yearLabel} className="timeline__item">
                  <span className="timeline__year">{m.yearLabel}</span>
                  <div className="timeline__content">
                    <h3>{m.title}</h3>
                    <p>{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ---------- Mission & values ---------- */}
      <section className="section section--surface">
        <div className="container">
          <p className="eyebrow">Mission &amp; Values</p>
          <h2 className="about-heading">What We Stand For</h2>

          {values.loading && <Loading label="Loading values…" />}
          {values.error && <ErrorState message={values.error} onRetry={values.reload} />}

          {values.data && (
            <div className="grid grid--3">
              {values.data.map((v) => (
                <article key={v.title} className="value-card">
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Arena feature ---------- */}
      <section className="section">
        <div className="container arena">
          <div className="arena__media">
            <img src="/assets/images/arena-aerial.jpg" alt={`${info?.stadiumName ?? 'Aurelia Arena'} aerial view`} loading="lazy" />
          </div>
          <div className="arena__copy">
            <p className="eyebrow">Our Home</p>
            <h2 className="about-heading">{info?.stadiumName ?? 'Aurelia Arena'}</h2>
            <p>
              A cathedral of modern football, {info?.stadiumName ?? 'Aurelia Arena'} has been the proud home of the
              Royals since {info?.builtYear ?? 2003}. Every matchday, the arena comes alive with the passion of our
              supporters.
            </p>
            <dl className="arena__facts">
              <div>
                <dt>CAPACITY</dt>
                <dd>{formatNumber(info?.capacity ?? 45000)} Seats</dd>
              </div>
              <div>
                <dt>RECORD ATTENDANCE</dt>
                <dd>{formatNumber(info?.recordAttendance ?? 45210)} Fans</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- Honours ---------- */}
      <section className="section section--surface">
        <div className="container">
          <p className="eyebrow">Trophy Room</p>
          <h2 className="about-heading">Honours Cabinet</h2>

          {honours.loading && <Loading label="Loading honours…" />}
          {honours.error && <ErrorState message={honours.error} onRetry={honours.reload} />}

          {honours.data && (
            <div className="grid grid--3">
              {honours.data.map((h) => (
                <article key={h.title} className="honour-card">
                  <h3>{h.title}</h3>
                  <p className="honour-card__years">{h.years}</p>
                  <span className="badge badge--gold">{h.countLabel}</span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Executives ---------- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Leadership</p>
          <h2 className="about-heading">Key Executives</h2>

          {executives.loading && <Loading label="Loading leadership…" />}
          {executives.error && <ErrorState message={executives.error} onRetry={executives.reload} />}

          {executives.data && (
            <div className="grid grid--2">
              {executives.data.map((e) => (
                <article key={e.fullName} className="exec-card">
                  <div className="exec-card__media">
                    {e.imagePath && <img src={`/${e.imagePath}`} alt={e.fullName} loading="lazy" />}
                  </div>
                  <div className="exec-card__body">
                    <h3>{e.fullName}</h3>
                    <p className="gold">{e.roleTitle}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
