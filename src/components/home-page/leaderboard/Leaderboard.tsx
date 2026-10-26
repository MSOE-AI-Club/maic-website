import { useEffect, useState } from "react";
import { getFullLeaderboard, type DashboardLeader } from "../../../hooks/dashboard-hook";
import { BadgeIcon } from "../../badge-icon/BadgeIcon";
import "./Leaderboard.css";

/**
 * Live standings from the ALL dashboard. A check-in updates this list on
 * the next page load. Eboard stay in the ranking with everyone else.
 */
const Leaderboard = () => {
  const [rows, setRows] = useState<DashboardLeader[] | null>(null);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let live = true;
    getFullLeaderboard().then((board) => {
      if (!live) return;
      if (!board) setError(true);
      else setRows(board);
    });
    return () => {
      live = false;
    };
  }, []);

  const trophy = (rank: number) => {
    if (rank === 1) return "🏆 ";
    if (rank === 2) return "🥈 ";
    if (rank === 3) return "🥉 ";
    return "";
  };

  if (error) return <p className="leaderboard-status">Standings are unavailable right now.</p>;
  if (!rows) return <p className="leaderboard-status">Loading standings…</p>;

  const filtered = searchTerm
    ? rows.filter((row) => row.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : rows;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-search">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          aria-label="Search leaderboard by name"
        />
      </div>
      <div className="leaderboard-scroll-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Place</th>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-results">
                  No matching names
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                let rowClass = "leaderboard-row";
                if (row.rank === 1) rowClass += " first-place";
                else if (row.rank === 2) rowClass += " second-place";
                else if (row.rank === 3) rowClass += " third-place";
                return (
                  <tr key={`${row.rank}-${row.name}`} className={rowClass}>
                    <td className="points-cell">{row.rank}</td>
                    <td>
                      {trophy(row.rank)}
                      {row.name}
                      {row.badges?.length > 0 && (
                        <span className="leaderboard-badges">
                          {row.badges.slice(0, 4).map((badge) => (
                            <BadgeIcon
                              key={badge.id}
                              icon={badge.icon}
                              name={badge.name}
                              size={16}
                              imgClassName="leaderboard-badge"
                              emojiClassName="leaderboard-badge leaderboard-badge--emoji"
                            />
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="points-cell">{row.points.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
