import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Points.css";
import { FaTshirt } from "react-icons/fa";
import { FaTicketAlt } from "react-icons/fa";
import { getDashboardBundle, type DashboardLeader } from "../../hooks/dashboard-hook";
import { BadgeIcon } from "../badge-icon/BadgeIcon";


const activities = [
  {
    title: "Attend Our Meetings",
    description: "Join our bi-weekly workshops, speaker events, and club activities",
  },
  {
    title: "Participate in Research Groups",
    description: "Get involved in our MAIC research groups to provide Novel AI Research!",
  },
  {
    title: "Participate in Innovation Labs",
    description: "Work on multi-month hackathons with a team to compete for prizes and recommendations!",
  },
  {
    title: "Compete in Hacksgiving",
    description: "Join our annual Thansgiving themed hackathon with non-profit sponsors!",
  },
  {
    title: "Compete in the Rosie Super Computer Challenge",
    description: "NVIDIA's annual super computer challenge with the largest prizes on campus!",
  },
  {
    title: "Other Opportunities",
    description: "Various other ways to get involved with MAIC",
  },
];

function Points() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<DashboardLeader[] | null>(null);

  useEffect(() => {
    let live = true;
    getDashboardBundle().then((bundle) => {
      if (live && bundle?.leaderboard?.length) setLeaders(bundle.leaderboard);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <div className="points-intro">
        <h1>How Do The MAIC Points Work?</h1>
        <p className="points-intro-description">
          Earn points by participating in MAIC events like workshops, hackathons, research groups, and more. Climb the leaderboard and redeem your points for exclusive merch or end-of-semester raffles!
        </p>
      </div>
      <div className="line"></div>
      <div className="points-container">
        {activities.map((item, idx) => (
          <div className="points-item" key={idx}>
            <div className="points-item-right">
              <h2 className="points-item-title">
                {item.title}
              </h2>
              <p className="points-item-description">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Live leaderboard. The copy above has always promised one ("climb the
          leaderboard") without ever showing it — the standings live in the ALL
          dashboard, so this is now the real thing rather than a screenshot
          someone has to remember to update. Hidden entirely if unreachable. */}
      {leaders && leaders.length > 0 && (
        <div className="points-leaderboard">
          <h1 className="points-leaderboard-title">Current Standings</h1>
          <ol className="points-leaderboard-list">
            {leaders.map((m) => (
              <li
                className={`points-leader${m.rank <= 3 ? ` points-leader--top points-leader--${m.rank}` : ""}`}
                key={`${m.rank}-${m.name}`}
              >
                <span className="points-leader-rank">{m.rank}</span>
                <span className="points-leader-name">
                  {m.name}
                  {m.badges?.length > 0 && (
                    <span className="points-leader-badges">
                      {m.badges.slice(0, 4).map((b) => (
                        <BadgeIcon
                          key={b.id}
                          icon={b.icon}
                          name={b.name}
                          size={16}
                          imgClassName="points-leader-badge"
                          emojiClassName="points-leader-badge points-leader-badge--emoji"
                        />
                      ))}
                    </span>
                  )}
                </span>
                <span className="points-leader-points">
                  {m.points.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="points-spend-container">
        <h1 className="points-spend-title">What Can You Do With Points?</h1>
        <div className="points-spend-options">
          <div className="points-spend-option">
            <FaTshirt size={80} color="rgb(255, 255, 255)" />
            <h2 className="points-spend-option-title">
              MAIC Merch
            </h2>
            <p className="points-spend-option-description">
              Redeem points for exclusive club swag and gear
            </p>
          </div>
          <div className="points-spend-option">
            <FaTicketAlt size={80} color="rgb(255, 255, 255)" />
            <h2 className="points-spend-option-title">
              Raffles
            </h2>
            <p className="points-spend-option-description">
              Enter end-of-semester raffles for special prizes
            </p>
          </div>
        </div>  
      </div>
      <div className="points-spend-cta">
        <h1>Ready to Spend Your Points?</h1>
        <button
          className="points-spend-cta-button"
          onClick={() => navigate("/merch")}
        >
          Visit Merch Page
        </button>
      </div>
    </>
  );
}

export default Points;