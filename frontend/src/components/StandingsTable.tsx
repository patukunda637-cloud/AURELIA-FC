import { Link } from 'react-router-dom';
import type { LeagueTable } from '../api/types';
import './StandingsTable.css';

/**
 * Compact standings table used on the home page (POS/CLUB/P/GD/PTS).
 * The full 12-club table lives on the League Table page.
 */
export default function StandingsTable({ table, limit = 5 }: { table: LeagueTable; limit?: number }) {
  const rows = table.rows.slice(0, limit);

  return (
    <div className="standings">
      <table className="table standings__table">
        <caption className="visually-hidden">{table.competition} {table.season} standings</caption>
        <thead>
          <tr>
            <th scope="col">POS</th>
            <th scope="col">CLUB</th>
            <th scope="col">P</th>
            <th scope="col">GD</th>
            <th scope="col">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.clubName} className={row.clubName === 'Aurelia FC' ? 'standings__row--highlight' : undefined}>
              <td className="standings__pos">{row.position}</td>
              <td className="standings__club">
                {row.clubName === 'Aurelia FC' ? (
                  <Link to="/league-table">{row.clubName}</Link>
                ) : (
                  row.clubName
                )}
              </td>
              <td>{row.played}</td>
              <td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td className="standings__pts">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
