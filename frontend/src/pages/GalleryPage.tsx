import { useState } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHero from '../components/PageHero';
import { Loading, ErrorState, EmptyState } from '../components/States';
import './GalleryPage.css';

const FILTERS = ['All', 'Match Day', 'Training', 'Events', 'Stadium'] as const;
const PAGE_SIZE = 6;

export default function GalleryPage() {
  const [category, setCategory] = useState<string>('All');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data, loading, error, reload } = useAsync(() => api.gallery(category), [category]);

  const images = data ?? [];
  const shown = images.slice(0, visible);

  const changeFilter = (next: string) => {
    setCategory(next);
    setVisible(PAGE_SIZE);
  };

  return (
    <>
      {/* Figma reference (gallery.pdf) has no hero image — the title sits on the page
          background, followed by the filter chips and masonry grid. */}
      <PageHero
        eyebrow="Media"
        title="Media Gallery"
        subtitle="Matchdays, training sessions and unforgettable moments from Aurelia Arena."
        compact
      />

      <section className="section">
        <div className="container">
          <div className="chips gallery-filters" role="group" aria-label="Filter gallery">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip${category === f ? ' chip--active' : ''}`}
                aria-pressed={category === f}
                onClick={() => changeFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {loading && <Loading label="Loading gallery…" />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && images.length === 0 && (
            <EmptyState title="No images in this collection">Try a different filter.</EmptyState>
          )}

          {shown.length > 0 && (
            <div className="gallery-grid">
              {shown.map((img, i) => (
                <figure
                  key={img.id}
                  className={`gallery-item${i % 5 === 0 ? ' gallery-item--wide' : ''}`}
                >
                  <img
                    src={`/${img.imagePath}`}
                    alt={img.caption}
                    loading="lazy"
                    style={{ aspectRatio: `${img.width} / ${img.height}` }}
                  />
                  <figcaption>
                    <span>{img.caption}</span>
                    <span className="badge badge--muted">{img.category}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {visible < images.length && (
            <p className="gallery-more">
              <button
                type="button"
                className="btn btn--gold-outline"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                LOAD MORE IMAGES
              </button>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
