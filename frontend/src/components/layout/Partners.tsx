import { api } from '../../api/client';
import { useAsync } from '../../hooks/useAsync';
import './Partners.css';

/** The "OFFICIAL PARTNERS" wordmark strip shown above the footer. */
export default function Partners() {
  const { data } = useAsync(() => api.partners(), []);

  if (!data || data.length === 0) return null;

  return (
    <section className="partners" aria-label="Official partners">
      <div className="container">
        <p className="eyebrow partners__label">OFFICIAL PARTNERS</p>
        <ul className="partners__list">
          {data.map((p) => (
            <li key={p.name} className="partners__item">{p.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
