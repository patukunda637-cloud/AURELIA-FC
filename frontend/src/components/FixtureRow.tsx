import { Link } from 'react-router-dom';
import type { Fixture } from '../api/types';
import './FixtureRow.css';

interface FixtureRowProps {
  fixture: Fixture;
  /** Called when the BUY TICKETS action is used (defaults to navigating). */
  onBuy?: (fixture: Fixture) => void;
  showBuy?: boolean;
}

/** One row of the Matches & Fixtures / Tickets listing. */
export default function FixtureRow({ fixture, onBuy, showBuy = true }: FixtureRowProps) {
  const completed = fixture.status === 'Completed';

  return (
    <article className="fixture-row">
      <div className="fixture-row__date">
        <span className="fixture-row__date-main">{fixture.dateLabel}</span>
        <span className="fixture-row__date-sub">
          {fixture.timeLabel} · {fixture.competition}
        </span>
      </div>

      <div className="fixture-row__teams">
        <span className="fixture-row__team fixture-row__team--home">{fixture.homeTeam}</span>
        <span className={`fixture-row__score${completed ? '' : ' fixture-row__score--vs'}`}>
          {fixture.scoreLabel}
        </span>
        <span className="fixture-row__team fixture-row__team--away">{fixture.awayTeam}</span>
      </div>

      <div className="fixture-row__venue">
        <span>{fixture.venue}</span>
        <span className={`badge ${fixture.isHome ? 'badge--gold' : 'badge--muted'}`}>
          {fixture.isHome ? 'HOME' : 'AWAY'}
        </span>
      </div>

      <div className="fixture-row__actions">
        {completed ? (
          <Link to={`/matches/${fixture.id}`} className="btn btn--ghost">MATCH REPORT</Link>
        ) : (
          <>
            {showBuy && fixture.ticketsAvailable && (
              onBuy ? (
                <button type="button" className="btn btn--primary" onClick={() => onBuy(fixture)}>
                  BUY TICKETS
                </button>
              ) : (
                <Link to="/tickets" className="btn btn--primary">BUY TICKETS</Link>
              )
            )}
            <Link to={`/matches/${fixture.id}`} className="btn btn--ghost">DETAILS</Link>
          </>
        )}
      </div>
    </article>
  );
}
