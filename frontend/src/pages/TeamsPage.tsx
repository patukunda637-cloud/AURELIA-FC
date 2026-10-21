import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import { Loading, ErrorState } from '../components/States';
import './TeamsPage.css';

export default function TeamsPage() {
  const { data, loading, error, reload } = useAsync(() => api.teams(), []);
  const [openTeam, setOpenTeam] = useState<number | null>(null);
  const roster = useAsync(
    () => (openTeam ? api.teamPlayers(openTeam) : Promise.resolve([])),
    [openTeam],
  );

  return (
    <>
      {/* Figma reference (teams.pdf) has no hero image — it opens straight into the
          team card grid on the #050918 page background. */}
      <PageHero
        eyebrow="Squads"
        title="Our Teams"
        subtitle="From the first team to the academy, every Aurelia FC squad shares one identity."
        compact
      />

      <section className="section">
        <div className="container">
          {loading && <Loading label="Loading teams…" />}
          {error && <ErrorState message={error} onRetry={reload} />}

          {data && (
            <div className="grid grid--3">
              {data.map((team) => (
                <article key={team.id} className="team-card">
                  <div className="team-card__media">
                    {team.imagePath && <img src={`/${team.imagePath}`} alt={team.name} loading="lazy" />}
                  </div>
                  <div className="team-card__body">
                    <h3>{team.name}</h3>
                    <p className="team-card__desc">{team.description}</p>
                    <dl className="team-card__facts">
                      <div>
                        <dt>COACH</dt>
                        <dd>{team.coach}</dd>
                      </div>
                      <div>
                        <dt>PLAYERS</dt>
                        <dd>{team.playerCount}</dd>
                      </div>
                    </dl>
                    <div className="team-card__actions">
                      <button
                        type="button"
                        className="btn btn--gold-outline"
                        aria-expanded={openTeam === team.id}
                        onClick={() => setOpenTeam((cur) => (cur === team.id ? null : team.id))}
                      >
                        {openTeam === team.id ? 'HIDE SQUAD' : 'VIEW SQUAD'}
                      </button>
                      <Link to="/players" className="btn btn--ghost">ALL PLAYERS</Link>
                    </div>

                    {openTeam === team.id && (
                      <div className="team-card__roster">
                        {roster.loading && <p className="dim">Loading squad…</p>}
                        {roster.error && <p className="field__error">{roster.error}</p>}
                        {roster.data && roster.data.length === 0 && <p className="dim">No players listed.</p>}
                        {roster.data && roster.data.length > 0 && (
                          <ul>
                            {roster.data.map((p) => (
                              <li key={p.id}>
                                <Link to={`/players/${p.id}`}>
                                  <span className="gold">#{p.squadNumber}</span>
                                  <span>{p.fullName}</span>
                                  <span className="dim">{p.position}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
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
