import { Link } from 'react-router-dom';
import type { PlayerCard as PlayerCardModel } from '../api/types';
import './PlayerCard.css';

const POSITION_ABBR: Record<string, string> = {
  Goalkeeper: 'GK',
  Defender: 'DEF',
  Midfielder: 'MID',
  Forward: 'FWD',
};

export default function PlayerCard({ player }: { player: PlayerCardModel }) {
  const abbrev = POSITION_ABBR[player.position] ?? player.position.slice(0, 3).toUpperCase();

  return (
    <article className="player-card">
      <Link to={`/players/${player.id}`} className="player-card__media" aria-label={`View ${player.fullName}`}>
        {player.imagePath ? (
          <img src={`/${player.imagePath}`} alt={player.fullName} loading="lazy" />
        ) : (
          <div className="player-card__placeholder" aria-hidden="true">
            {player.firstName[0]}
            {player.lastName[0]}
          </div>
        )}
        <span className="player-card__number">#{player.squadNumber}</span>
      </Link>
      <div className="player-card__body">
        <h3 className="player-card__name">
          <Link to={`/players/${player.id}`}>{player.fullName}</Link>
        </h3>
        <p className="player-card__meta">
          <span className="player-card__position">{abbrev}</span>
          <span className="player-card__dot" aria-hidden="true">·</span>
          <span>{player.nationality}</span>
        </p>
      </div>
    </article>
  );
}
