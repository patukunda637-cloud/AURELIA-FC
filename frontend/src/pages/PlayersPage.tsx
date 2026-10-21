import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import PlayerCard from '../components/PlayerCard';
import { Loading, ErrorState, EmptyState } from '../components/States';
import './PlayersPage.css';

const FILTERS = ['All', 'Goalkeepers', 'Defenders', 'Midfielders', 'Forwards'] as const;
const SEARCH_DEBOUNCE_MS = 300;

export default function PlayersPage() {
  const [position, setPosition] = useState<string>('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, loading, error, reload } = useAsync(
    () => api.players({ position, search }),
    [position, search],
  );

  // Debounce the free-text search so we don't hit the API on every keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const players = data ?? [];

  return (
    <>
      {/* Figma reference (players.pdf) has no hero image — it opens straight into the
          filter chips and squad grid on the #050918 page background. */}
      <PageHero
        eyebrow="First Team"
        title="Squad"
        subtitle="Meet the players wearing the royal gold this season."
        compact
      />

      <section className="section">
        <div className="container">
          <div className="squad-toolbar">
            <div className="chips" role="group" aria-label="Filter by position">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip${position === f ? ' chip--active' : ''}`}
                  aria-pressed={position === f}
                  onClick={() => setPosition(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="squad-search">
              <label htmlFor="squad-search" className="visually-hidden">Search squad players</label>
              <input
                id="squad-search"
                className="input"
                type="search"
                placeholder="Search squad players..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {loading && <Loading label="Loading squad…" />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && players.length === 0 && (
            <EmptyState title="No players found">
              Try a different position filter or clear your search.
            </EmptyState>
          )}

          {players.length > 0 && (
            <>
              <p className="squad-count dim">
                {players.length} player{players.length === 1 ? '' : 's'}
                {position !== 'All' ? ` · ${position}` : ''}
                {search ? ` · “${search}”` : ''}
              </p>
              <div className="grid grid--4 squad-grid">
                {players.map((p) => <PlayerCard key={p.id} player={p} />)}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
