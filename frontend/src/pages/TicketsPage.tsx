import { useState } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useCart } from '../context/CartContext';
import PageHero from '../components/PageHero';
import { Loading, ErrorState, StatusBanner } from '../components/States';
import { formatMoney, formatMoneyRange, formatNumber } from '../lib/format';
import type { SeasonTier, TicketFixture, Hospitality } from '../api/types';
import './TicketsPage.css';

export default function TicketsPage() {
  const fixtures = useAsync(() => api.ticketFixtures(), []);
  const tiers = useAsync(() => api.seasonTiers(), []);
  const hospitality = useAsync(() => api.hospitality(), []);
  const { add } = useCart();

  const [notice, setNotice] = useState<string | null>(null);

  const addMatchTicket = (f: TicketFixture) => {
    add({
      itemType: 'MatchTicket',
      itemRefId: f.matchId,
      description: `${f.matchLabel} · ${f.dateLabel}`,
      quantity: 1,
      unitPrice: f.priceMin,
    });
    announce(`Added ${f.matchLabel} ticket to your basket.`);
  };

  const addSeasonTier = (t: SeasonTier) => {
    add({ itemType: 'SeasonTicket', itemRefId: null, description: `${t.name} Season Ticket`, quantity: 1, unitPrice: t.price });
    announce(`${t.name} season ticket added to your basket.`);
  };

  const addHospitality = (h: Hospitality) => {
    add({ itemType: 'Hospitality', itemRefId: null, description: h.name, quantity: 1, unitPrice: h.price });
    announce(`${h.name} added to your basket.`);
  };

  const announce = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4000);
  };

  return (
    <>
      <PageHero
        eyebrow="Box Office"
        title="Match Tickets"
        subtitle="Secure your seat at Aurelia Arena for every home fixture this season."
        imagePath="/assets/images/hero-tickets.jpg"
        compact
      />

      {notice && (
        <div className="container" style={{ paddingTop: 24 }}>
          <StatusBanner tone="success">{notice}</StatusBanner>
        </div>
      )}

      {/* ---------- Match tickets ---------- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Upcoming Fixtures</p>
          <h2 className="tickets-heading">Match Tickets</h2>

          {fixtures.loading && <Loading label="Loading fixtures…" />}
          {fixtures.error && <ErrorState message={fixtures.error} onRetry={fixtures.reload} />}

          {fixtures.data && (
            <div className="ticket-list">
              {fixtures.data.map((f) => (
                <article key={f.id} className="ticket-row">
                  <div className="ticket-row__date">
                    <span className="ticket-row__day">{f.dayLabel}</span>
                    <span className="ticket-row__month">{f.monthLabel.slice(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="ticket-row__main">
                    <p className="ticket-row__tournament">{f.tournament}</p>
                    <h3>{f.matchLabel}</h3>
                    <p className="dim">{f.venue} · {f.kickoffLabel}</p>
                    <div className="ticket-row__seats">
                      <span>{formatNumber(f.availableSeats)} seats available</span>
                      <span className={`badge ${f.statusLabel === 'Selling Fast' ? 'badge--solid' : 'badge--gold'}`}>
                        {f.statusLabel}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-row__action">
                    <p className="ticket-row__price">{formatMoneyRange(f.priceMin, f.priceMax)}</p>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => addMatchTicket(f)}
                      disabled={f.availableSeats <= 0}
                    >
                      {f.availableSeats > 0 ? 'BUY TICKETS' : 'SOLD OUT'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Season tickets ---------- */}
      <section className="section section--surface">
        <div className="container">
          <p className="eyebrow">Membership</p>
          <h2 className="tickets-heading">Season Tickets</h2>

          {tiers.loading && <Loading label="Loading tiers…" />}
          {tiers.error && <ErrorState message={tiers.error} onRetry={tiers.reload} />}

          {tiers.data && (
            <div className="grid grid--3">
              {tiers.data.map((t) => (
                <article key={t.name} className="tier-card">
                  <h3>{t.name}</h3>
                  <p className="tier-card__price">
                    {formatMoney(t.price)}<span className="tier-card__unit">/season</span>
                  </p>
                  <p className="tier-card__desc">{t.description}</p>
                  <ul className="tier-card__features">
                    {t.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <button type="button" className="btn btn--gold-outline btn--block" onClick={() => addSeasonTier(t)}>
                    SELECT TIER
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Hospitality ---------- */}
      <section className="section" id="hospitality">
        <div className="container">
          <p className="eyebrow">Premium</p>
          <h2 className="tickets-heading">Hospitality</h2>

          {hospitality.loading && <Loading label="Loading packages…" />}
          {hospitality.error && <ErrorState message={hospitality.error} onRetry={hospitality.reload} />}

          {hospitality.data && (
            <div className="grid grid--2">
              {hospitality.data.map((h) => (
                <article key={h.name} className="hosp-card">
                  {h.imagePath && (
                    <div className="hosp-card__media">
                      <img src={`/${h.imagePath}`} alt={h.name} loading="lazy" />
                    </div>
                  )}
                  <div className="hosp-card__body">
                    <h3>{h.name}</h3>
                    <p className="hosp-card__price">{formatMoney(h.price)}<span className="tier-card__unit">{h.priceUnit}</span></p>
                    <p>{h.description}</p>
                    <button type="button" className="btn btn--primary" onClick={() => addHospitality(h)}>
                      ENQUIRE NOW
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
