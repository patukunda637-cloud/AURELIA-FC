import { Link } from 'react-router-dom';
import type { ArticleCard as ArticleCardModel } from '../api/types';
import './NewsCard.css';

export default function NewsCard({ article }: { article: ArticleCardModel }) {
  return (
    <article className="news-card">
      <Link to={`/news/${article.slug}`} className="news-card__media" aria-label={article.title}>
        {article.imagePath ? (
          <img src={`/${article.imagePath}`} alt="" loading="lazy" />
        ) : (
          <div className="news-card__placeholder" aria-hidden="true" />
        )}
        <span className="badge badge--gold news-card__badge">{article.category}</span>
      </Link>
      <div className="news-card__body">
        <p className="news-card__date">{article.dateLabel}</p>
        <h3 className="news-card__title">
          <Link to={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="news-card__excerpt">{article.excerpt}</p>
        <Link to={`/news/${article.slug}`} className="news-card__more">READ MORE →</Link>
      </div>
    </article>
  );
}
