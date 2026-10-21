import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { Loading, ErrorState } from '../components/States';
import { formatNumber } from '../lib/format';
import './MatchDetailPage.css';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const matchId = Number(id);

  const { data: m, loading, error, reload } = useAsync(() => api.match(matchId), [matchId]);

  if (loading) return <div className="container section"><Loading label="Loading match…" /></div>;
  if (error) return <div className="container section"><ErrorState message={error} onRetry={reload} /></div>;
  if (!m) return null;

  const home = m.lineups.filter((l) => l.side === 'Home');
  const away = m.lineups.filter((l) => l.side === 'Away');

  return (
    <>
      <section className="match-hero">
        <div className="container">
          <p className="eyebrow">
            {m.statusLabel} — {m.competition.toUpperCase()}
          </p>
          <div className="match-hero__scoreboard">
            <div className="match-hero__team">
              <span className="match-hero__name">{m.homeTeam}</span>
              <span className="badge badge--gold">HOME</span>
            </div>
            <span className="match-hero__score">{m.scoreLabel}</span>
            <div className="match-hero__team match-hero__team--away">
              <span className="match-hero__name">{m.awayTeam}</span>
              <span className="badge badge--muted">AWAY</span>
            </div>
          </div>
          <p className="match-hero__meta">
            {m.dateLabel} · {m.venue}
            {m.attendance !== null ? ` · Attendance: ${formatNumber(m.attendance)}` : ''}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container match-grid">
          {/* ---------- Timeline ---------- */}
          <div>
            <h2 className="match-heading">Match Events</h2>
            {m.events.length === 0 ? (
              <p className="dim">No events recorded for this match.</p>
            ) : (
              <ul className="timeline-events">
                {m.events.map((e) => (
                  <li key={`${e.minute}-${e.playerName}`} className={`timeline-events__item timeline-events__item--${e.side.toLowerCase()}`}>
                    <span className="timeline-events__minute">{e.minute}&prime;</span>
                    <div>
                      <span className="timeline-events__player">{e.playerName}</span>
                      <span className="timeline-events__type">{e.eventType}</span>
                    </div>
                    <span className={`badge ${e.side === 'Home' ? 'badge--gold' : 'badge--muted'}`}>
                      {e.side === 'Home' ? m.homeTeam : m.awayTeam}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---------- Stats ---------- */}
          <div>
            <h2 className="match-heading">Match Stats</h2>
            {m.stats.length === 0 ? (
              <p className="dim">No statistics recorded for this match.</p>
            ) : (
              <table className="table match-stats">
                <caption className="visually-hidden">Match statistics</caption>
                <thead>
                  <tr>
                    <th scope="col">{m.homeTeam}</th>
                    <th scope="col" style={{ textAlign: 'center' }}>STAT</th>
                    <th scope="col" style={{ textAlign: 'right' }}>{m.awayTeam}</th>
                  </tr>
                </thead>
                <tbody>
                  {m.stats.map((s) => (
                    <tr key={s.label}>
                      <td className="match-stats__home">{s.home}</td>
                      <td style={{ textAlign: 'center' }} className="dim">{s.label}</td>
                      <td className="match-stats__away">{s.away}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Lineups ---------- */}
      <section className="section section--surface">
        <div className="container">
          <h2 className="match-heading">Starting XI</h2>
          <div className="match-grid">
            <LineupPanel title={m.homeTeam} formation={home[0]?.formation ?? ''} players={home} />
            <LineupPanel title={m.awayTeam} formation={away[0]?.formation ?? ''} players={away} />
          </div>
        </div>
      </section>

      {m.report && (
        <section className="section">
          <div className="container">
            <h2 className="match-heading">Match Report</h2>
            <p className="match-report">{m.report}</p>
            <Link to="/news" className="btn btn--gold-outline">CLUB NEWS</Link>
          </div>
        </section>
      )}
    </>
  );
}

function LineupPanel({
  title, formation, players,
}: {
  title: string;
  formation: string;
  players: { squadNo: string; playerName: string; roleCode: string }[];
}) {
  return (
    <div className="lineup">
      <div className="lineup__head">
        <h3>{title}</h3>
        {formation && <span className="badge badge--gold">{formation}</span>}
      </div>
      {players.length === 0 ? (
        <p className="dim">Lineup not available.</p>
      ) : (
        <ul className="lineup__list">
          {players.map((p) => (
            <li key={`${p.squadNo}-${p.playerName}`}>
              <span className="lineup__no">{p.squadNo}</span>
              <span className="lineup__name">{p.playerName}</span>
              <span className="lineup__role dim">{p.roleCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
