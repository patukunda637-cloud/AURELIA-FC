import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import NewsCard from '../components/NewsCard';
import { Loading, ErrorState, StatusBanner } from '../components/States';
import './NewsArticlePage.css';

export default function NewsArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: article, loading, error, reload } = useAsync(() => api.article(slug), [slug]);
  const related = useAsync(
    () => (slug ? api.relatedArticles(slug) : Promise.resolve([])),
    [slug],
  );
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (loading) return <div className="container section"><Loading label="Loading article…" /></div>;
  if (error) return <div className="container section"><ErrorState message={error} onRetry={reload} /></div>;
  if (!article) return null;

  const socials = [
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <>
      <article className="container section article">
        <p className="eyebrow">{article.category} · {article.dateLabel}{article.authorName ? ` · By ${article.authorName}` : ''}</p>
        <h1 className="article__title">{article.title}</h1>
        <p className="article__excerpt">{article.excerpt}</p>

        {article.imagePath && (
          <figure className="article__hero">
            <img src={`/${article.imagePath}`} alt="" />
          </figure>
        )}

        <div className="article__body">
          {article.body.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
        </div>

        {article.pullQuote && (
          <blockquote className="article__quote">
            <p>&ldquo;{article.pullQuote}&rdquo;</p>
            {article.pullQuoteBy && <cite>— {article.pullQuoteBy}</cite>}
          </blockquote>
        )}

        <section className="article__share" aria-label="Share this story">
          <h2>Share This Story</h2>
          <div className="article__share-actions">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                {s.label}
              </a>
            ))}
            <button type="button" className="btn btn--gold-outline" onClick={copyLink}>
              {copied ? 'COPIED!' : 'COPY LINK'}
            </button>
          </div>
          {copied && <StatusBanner tone="success">Link copied to your clipboard.</StatusBanner>}
        </section>

        {article.tags.length > 0 && (
          <ul className="article__tags" aria-label="Tags">
            {article.tags.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </article>

      <section className="section section--surface">
        <div className="container">
          <h2 className="article__related-heading">Related Articles</h2>
          {related.loading && <Loading label="Loading related stories…" />}
          {related.data && related.data.length > 0 && (
            <div className="grid grid--4">
              {related.data.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          )}
        </div>
      </section>

      <div className="container section--tight">
        <Link to="/news" className="btn btn--ghost">← BACK TO ALL NEWS</Link>
      </div>
    </>
  );
}
