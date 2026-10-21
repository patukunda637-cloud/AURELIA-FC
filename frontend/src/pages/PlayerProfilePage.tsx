import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Loading, ErrorState } from '../components/States';
import './PlayerProfilePage.css';

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const playerId = Number(id);

  const { data: p, loading, error, reload } = useAsync(
    () => api.player(playerId),
    [playerId],
  );

  if (loading) return <div className="container section"><Loading label="Loading player…" /></div>;
  if (error) return <div className="container section"><ErrorState message={error} onRetry={reload} /></div>;
  if (!p) return null;

  return (
    <>
      <section className="profile-hero">
        <div className="container profile-hero__inner">
          <div className="profile-hero__media">
            {p.imagePath ? (
              <img src={`/${p.imagePath}`} alt={p.fullName} />
            ) : (
              <div className="profile-hero__placeholder" aria-hidden="true" />
            )}
          </div>

          <div className="profile-hero__copy">
            <p className="eyebrow">{p.position.toUpperCase()} · SQUAD NO. {p.squadNumber}</p>
            <h1>{p.fullName}</h1>
            <p className="profile-hero__bio">{p.bio}</p>

            <dl className="profile-hero__meta">
              <div>
                <dt>NATIONALITY</dt>
                <dd>{p.nationality}</dd>
              </div>
              <div>
                <dt>HEIGHT</dt>
                <dd>{p.heightCm ? `${p.heightCm} cm` : '—'}</dd>
              </div>
              <div>
                <dt>DATE OF BIRTH</dt>
                <dd>{p.dateOfBirth ?? '—'}</dd>
              </div>
              <div>
                <dt>SQUAD</dt>
                <dd>
                  <Link to="/teams">{p.teamName}</Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <div className="grid grid--4">
            <div className="stat-tile">
              <p className="stat-tile__value">{p.goals}</p>
              <p className="stat-tile__label">GOALS SCORED</p>
            </div>
            <div className="stat-tile">
              <p className="stat-tile__value">{p.assists}</p>
              <p className="stat-tile__label">ASSISTS DELIVERED</p>
            </div>
            <div className="stat-tile">
              <p className="stat-tile__value">{p.appearances}</p>
              <p className="stat-tile__label">APPEARANCES</p>
            </div>
            <div className="stat-tile">
              <p className="stat-tile__value">{p.avgRating.toFixed(1)}</p>
              <p className="stat-tile__label">AVERAGE MATCH RATING</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container profile-panels">
          <div>
            <h2 className="profile-heading">Season Statistics</h2>
            <p className="dim profile-season">{p.season}</p>
            {p.seasonStats.length === 0 ? (
              <p className="dim">No monthly statistics recorded for this season.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">MONTH</th>
                    <th scope="col">APPS</th>
                    <th scope="col">GOALS</th>
                    <th scope="col">ASSISTS</th>
                  </tr>
                </thead>
                <tbody>
                  {p.seasonStats.map((s) => (
                    <tr key={s.month}>
                      <td className="standings__club">{s.month}</td>
                      <td>{s.apps}</td>
                      <td>{s.goals}</td>
                      <td>{s.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h2 className="profile-heading">Career History</h2>
            <ul className="career">
              <li className="career__current">
                <div>
                  <span className="career__club">{p.teamName}</span>
                  <span className="dim career__period">2023 – Present</span>
                </div>
                <div className="career__stats">
                  <span><strong>{p.appearances}</strong> Matches</span>
                  <span><strong>{p.goals}</strong> Goals</span>
                </div>
              </li>
              {p.careerHistory.map((c) => (
                <li key={`${c.clubName}-${c.period}`}>
                  <div>
                    <span className="career__club">{c.clubName}</span>
                    <span className="dim career__period">{c.period}</span>
                  </div>
                  <div className="career__stats">
                    {c.appearances !== null && <span><strong>{c.appearances}</strong> Matches</span>}
                    {c.goals !== null && <span><strong>{c.goals}</strong> Goals</span>}
                    {c.note && <span className="gold">{c.note}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
