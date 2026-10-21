import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import NewsCard from '../components/NewsCard';
import StandingsTable from '../components/StandingsTable';
import { Loading, ErrorState, EmptyState } from '../components/States';
import { formatNumber } from '../lib/format';
import './HomePage.css';

export default function HomePage() {
  const club = useAsync(() => api.club(), []);
  const standings = useAsync(() => api.standings(), []);
  const upcoming = useAsync(() => api.matches('upcoming'), []);
  const results = useAsync(() => api.matches('results'), []);
  const players = useAsync(() => api.players({ teamId: 1 }), []);
  const news = useAsync(() => api.news(), []);

  const nextMatch = upcoming.data?.slice().sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso))[0] ?? null;
  const recentResults = results.data?.slice(0, 3) ?? [];
  const featuredPlayers = (players.data ?? []).filter((p) => [9, 7, 4].includes(p.squadNumber)).slice(0, 3);
  const latestNews = news.data?.slice(0, 3) ?? [];

  const heroImage = '/assets/images/hero-home.jpg';
  const info = club.data;

  return (
    <>
      <PageHero
        eyebrow="THE ROYALS · EST. 1987"
        title={info?.clubName ?? 'Aurelia FC'}
        subtitle={info?.motto ?? 'Rise. Unite. Conquer.'}
        imagePath={heroImage}
      >
        <Link to="/players" className="btn btn--primary">EXPLORE SQUAD</Link>
        <Link to="/matches" className="btn btn--ghost">LATEST FIXTURES</Link>
      </PageHero>

      {/* ---------- Next match + standings ---------- */}
      <section className="section">
        <div className="container home-next">
          <div>
            <p className="eyebrow">Matchday</p>
            <h2 className="home-heading">Next Match</h2>

            {upcoming.loading && <Loading label="Loading next match…" />}
            {upcoming.error && <ErrorState message={upcoming.error} onRetry={upcoming.reload} />}
            {!upcoming.loading && !upcoming.error && !nextMatch && (
              <EmptyState title="No fixtures scheduled">Check back soon for the next match announcement.</EmptyState>
            )}

            {nextMatch && (
              <article className="next-match">
                <p className="next-match__meta">
                  {nextMatch.dateLabel.toUpperCase()} · {nextMatch.competition.toUpperCase()}
                  <span className="badge badge--gold next-match__badge">
                    {nextMatch.isHome ? 'HOME GAME' : 'AWAY GAME'}
                  </span>
                </p>
                <div className="next-match__teams">
                  <span className="next-match__team">{nextMatch.homeTeam}</span>
                  <span className="next-match__vs">VS</span>
                  <span className="next-match__team">{nextMatch.awayTeam}</span>
                </div>
                <dl className="next-match__facts">
                  <div>
                    <dt>STADIUM</dt>
                    <dd>{nextMatch.venue}</dd>
                  </div>
                  <div>
                    <dt>KICK OFF</dt>
                    <dd>{nextMatch.timeLabel} BST</dd>
                  </div>
                </dl>
                <Link to="/tickets" className="btn btn--primary next-match__cta">PURCHASE MATCH TICKETS</Link>
              </article>
            )}
          </div>

          <div>
            <p className="eyebrow">Table</p>
            <h2 className="home-heading">League Standings</h2>
            {standings.loading && <Loading label="Loading table…" />}
            {standings.error && <ErrorState message={standings.error} onRetry={standings.reload} />}
            {standings.data && <StandingsTable table={standings.data} limit={5} />}
            {standings.data && (
              <p className="home-table-link">
                <Link to="/league-table" className="gold">VIEW FULL TABLE →</Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Stats band ---------- */}
      <section className="section section--surface stats-band">
        <div className="container stats-band__grid">
          <div className="stat">
            <p className="stat__value">{info ? new Date().getFullYear() - info.foundedYear : 37} YEARS</p>
            <p className="stat__label">CLUB HISTORY (EST. {info?.foundedYear ?? 1987})</p>
          </div>
          <div className="stat">
            <p className="stat__value">12 TROPHIES</p>
            <p className="stat__label">CHAMPIONSHIPS &amp; CUPS WON</p>
          </div>
          <div className="stat">
            <p className="stat__value">{formatNumber(info?.capacity ?? 45000)} Seats</p>
            <p className="stat__label">{info?.stadiumName?.toUpperCase() ?? 'AURELIA ARENA'} CAPACITY</p>
          </div>
        </div>
      </section>

      {/* ---------- Recent results ---------- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Competitions</p>
          <h2 className="home-heading home-heading--lg">Recent Results</h2>

          {results.loading && <Loading label="Loading results…" />}
          {results.error && <ErrorState message={results.error} onRetry={results.reload} />}
          {!results.loading && !results.error && recentResults.length === 0 && (
            <EmptyState>No completed matches yet this season.</EmptyState>
          )}

          {recentResults.length > 0 && (
            <div className="grid grid--3">
              {recentResults.map((r) => (
                <Link key={r.id} to={`/matches/${r.id}`} className="result-card">
                  <p className="result-card__meta">{r.dateLabel} · {r.competition} · {outcome(r)}</p>
                  <p className="result-card__score">{r.scoreLabel}</p>
                  <div className="result-card__teams">
                    <span>{r.homeTeam}</span>
                    <span className="dim">{r.awayTeam}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Featured players ---------- */}
      <section className="section section--surface">
        <div className="container">
          <p className="eyebrow">Squad Highlight</p>
          <h2 className="home-heading home-heading--lg">Featured Players</h2>

          {players.loading && <Loading label="Loading squad…" />}
          {players.error && <ErrorState message={players.error} onRetry={players.reload} />}
          {players.data && featuredPlayers.length === 0 && <EmptyState>No featured players available.</EmptyState>}

          {featuredPlayers.length > 0 && (
            <div className="grid grid--3">
              {featuredPlayers.map((p) => (
                <article key={p.id} className="featured-player">
                  <div className="featured-player__media">
                    {p.imagePath && <img src={`/${p.imagePath}`} alt={p.fullName} loading="lazy" />}
                  </div>
                  <div className="featured-player__body">
                    <h3>{p.fullName}</h3>
                    <p className="featured-player__meta">
                      <span className="gold">{p.position}</span>
                      <span className="muted">#{p.squadNumber}</span>
                      <Link to={`/players/${p.id}`} className="featured-player__link">VIEW PROFILE</Link>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Latest news ---------- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Media</p>
          <h2 className="home-heading home-heading--lg">Latest News</h2>

          {news.loading && <Loading label="Loading news…" />}
          {news.error && <ErrorState message={news.error} onRetry={news.reload} />}
          {news.data && latestNews.length === 0 && <EmptyState>No news published yet.</EmptyState>}

          {latestNews.length > 0 && (
            <div className="grid grid--3">
              {latestNews.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}

          {news.data && news.data.length > 0 && (
            <p className="home-more">
              <Link to="/news" className="btn btn--gold-outline">ALL NEWS</Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}

function outcome(fixture: { isHome: boolean; homeScore: number | null; awayScore: number | null }): string {
  if (fixture.homeScore === null || fixture.awayScore === null) return '';
  const us = fixture.isHome ? fixture.homeScore : fixture.awayScore;
  const them = fixture.isHome ? fixture.awayScore : fixture.homeScore;
  if (us > them) return 'W';
  if (us < them) return 'L';
  return 'D';
}
