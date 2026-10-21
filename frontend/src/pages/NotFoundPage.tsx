import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <section className="section notfound">
      <div className="container notfound__inner">
        <p className="eyebrow">Error 404</p>
        <h1 className="notfound__code">404</h1>
        <h2 className="notfound__title">This page has left the pitch</h2>
        <p className="notfound__copy">
          The page you were looking for could not be found. It may have been moved, renamed,
          or never existed in the first place.
        </p>
        <div className="notfound__actions">
          <Link to="/" className="btn btn--primary">Back to Home</Link>
          <Link to="/matches" className="btn btn--ghost">View Fixtures</Link>
        </div>
      </div>
    </section>
  );
}
