import { useState } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import FixtureRow from '../components/FixtureRow';
import { Loading, ErrorState, EmptyState } from '../components/States';
import './MatchesPage.css';

type Tab = 'upcoming' | 'results' | 'all';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'results', label: 'Results' },
  { id: 'all', label: 'All' },
];

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('upcoming');
  const { data, loading, error, reload } = useAsync(() => api.matches(tab), [tab]);

  return (
    <>
      {/* Figma reference (matches-fixtures.pdf) contains no hero image — the title
          sits directly on the #050918 page background. */}
      <PageHero
        eyebrow="Fixtures"
        title="Matches & Fixtures"
        subtitle="Every upcoming kick-off and completed result for the 2026/2027 season."
        compact
      />

      <section className="section">
        <div className="container">
          <div className="chips matches-tabs" role="tablist" aria-label="Filter matches">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`chip${tab === t.id ? ' chip--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && <Loading label="Loading fixtures…" />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && (data?.length ?? 0) === 0 && (
            <EmptyState title="No matches in this view">Try another tab.</EmptyState>
          )}

          {data && data.length > 0 && (
            <div className="fixture-list">
              {data.map((f) => <FixtureRow key={f.id} fixture={f} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
