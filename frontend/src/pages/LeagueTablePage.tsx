import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import { Loading, ErrorState } from '../components/States';
import './LeagueTablePage.css';

export default function LeagueTablePage() {
  const { data, loading, error, reload } = useAsync(() => api.standings(), []);

  return (
    <>
      {/* Figma reference (league-table.pdf) contains no hero image — the title sits
          directly on the #050918 page background. */}
      <PageHero
        eyebrow="Standings"
        title="League Table"
        subtitle={data ? `${data.competition} · ${data.season}` : 'Premier Division · 2026/2027'}
        compact
      />

      <section className="section">
        <div className="container">
          {loading && <Loading label="Loading league table…" />}
          {error && <ErrorState message={error} onRetry={reload} />}

          {data && (
            <>
              <div className="table-wrap">
                <table className="table league-table">
                  <caption className="visually-hidden">{data.competition} {data.season} table</caption>
                  <thead>
                    <tr>
                      <th scope="col">POS</th>
                      <th scope="col">CLUB</th>
                      <th scope="col">P</th>
                      <th scope="col">W</th>
                      <th scope="col">D</th>
                      <th scope="col">L</th>
                      <th scope="col">GF</th>
                      <th scope="col">GA</th>
                      <th scope="col">GD</th>
                      <th scope="col">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr
                        key={r.clubName}
                        className={[
                          r.clubName === 'Aurelia FC' ? 'league-table__row--ours' : '',
                          r.position <= 4 ? 'league-table__row--ucl' : '',
                          r.position >= 11 ? 'league-table__row--relegation' : '',
                        ].join(' ').trim() || undefined}
                      >
                        <td className="league-table__pos">{r.position}</td>
                        <td className="league-table__club">{r.clubName}</td>
                        <td>{r.played}</td>
                        <td>{r.won}</td>
                        <td>{r.drawn}</td>
                        <td>{r.lost}</td>
                        <td>{r.goalsFor}</td>
                        <td>{r.goalsAgainst}</td>
                        <td>{r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}</td>
                        <td className="league-table__pts">{r.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="legend">
                <span className="legend__item"><i className="legend__swatch legend__swatch--ucl" /> UEFA Champions League Spots</span>
                <span className="legend__item"><i className="legend__swatch legend__swatch--rel" /> Relegation Zone</span>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
