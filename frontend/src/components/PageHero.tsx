import type { ReactNode } from 'react';
import './PageHero.css';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imagePath?: string | null;
  children?: ReactNode;
  compact?: boolean;
}

/** Dark, gold-lit page banner used at the top of every inner screen. */
export default function PageHero({ eyebrow, title, subtitle, imagePath, children, compact }: PageHeroProps) {
  return (
    <section
      className={`page-hero${compact ? ' page-hero--compact' : ''}`}
      style={imagePath ? { backgroundImage: `linear-gradient(90deg, rgba(5,9,24,0.94) 0%, rgba(5,9,24,0.72) 55%, rgba(5,9,24,0.9) 100%), url(${imagePath})` } : undefined}
    >
      <div className="container page-hero__inner">
        {eyebrow && <p className="eyebrow page-hero__eyebrow">{eyebrow}</p>}
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__sub">{subtitle}</p>}
        {children && <div className="page-hero__actions">{children}</div>}
      </div>
    </section>
  );
}
