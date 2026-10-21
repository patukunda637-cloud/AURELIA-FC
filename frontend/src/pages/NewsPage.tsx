import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import NewsCard from '../components/NewsCard';
import { Loading, ErrorState, EmptyState } from '../components/States';
import './NewsPage.css';

const FILTERS = ['All', 'Match Report', 'Transfer', 'Club News', 'Youth Academy'] as const;

export default function NewsPage() {
  const [category, setCategory] = useState<string>('All');
  const featured = useAsync(() => api.featuredArticle(), []);
  const list = useAsync(() => api.news(category), [category]);

  const cards = list.data ?? [];
  const featuredArticle = featured.data;

  return (
    <>
      {/* Figma reference (news.pdf) has no hero image — the title sits on the page
          background, followed by the 770x440 featured-article card. */}
      <PageHero
        eyebrow="Media"
        title="News & Updates"
        subtitle="Club announcements, match reports, transfer news and academy stories."
        compact
      />

      <section className="section">
        <div className="container">
          {/* ---------- Featured ---------- */}
          {featured.loading && <Loading label="Loading featured story…" />}
          {featured.error && <ErrorState message={featured.error} onRetry={featured.reload} />}

          {featuredArticle && (
            <article className="featured-article">
              <div className="featured-article__media">
                {featuredArticle.imagePath && <img src={`/${featuredArticle.imagePath}`} alt="" />}
              </div>
              <div className="featured-article__body">
                <p className="eyebrow">FEATURED CLUB NEWS · {featuredArticle.dateLabel}</p>
                <h2>{featuredArticle.title}</h2>
                <p>{featuredArticle.excerpt}</p>
                <Link to={`/news/${featuredArticle.slug}`} className="btn btn--primary">READ FULL ARTICLE</Link>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <div className="chips news-filters" role="group" aria-label="Filter news">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip${category === f ? ' chip--active' : ''}`}
                aria-pressed={category === f}
                onClick={() => setCategory(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {list.loading && <Loading label="Loading articles…" />}
          {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
          {!list.loading && !list.error && cards.length === 0 && (
            <EmptyState title="No articles in this category">Try a different filter.</EmptyState>
          )}

          {cards.length > 0 && (
            <div className="grid grid--3">
              {cards.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
