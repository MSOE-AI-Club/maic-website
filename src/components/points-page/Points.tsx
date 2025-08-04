import { useNavigate } from "react-router-dom";
import "./Points.css";
import { FaTshirt } from "react-icons/fa";
import { FaTicketAlt } from "react-icons/fa";


const earnPoints = [
  {
    title: "Attend MAIC Meetings",
    description: "Join our bi-weekly workshops, speaker events, etc.",
    points: "+1",
  },
  {
    title: "Participate in Workshops",
    description: "Attend hands-on AI/ML workshops and coding sessions",
    points: "+2",
  },
  {
    title: "Join Research Groups",
    description: "Actively participate in MAIC research initiatives",
    points: "+3",
  },
  {
    title: "Present at Events",
    description: "Share your projects or research with the MAIC community",
    points: "+5",
  },
  {
    title: "Complete NVIDIA DLI Courses",
    description: "Finish certified Deep Learning Institute courses",
    points: "+4",
  },
  {
    title: "Participate in Hackathons",
    description: "Join MAIC-sponsored hackathons like Hacksgiving",
    points: "+6",
  },
  {
    title: "Volunteer at Events",
    description: "Help organize and run MAIC events and activities",
    points: "+3",
  },
  {
    title: "Submit to MICS Conference",
    description: "Present your research at the MICS conference",
    points: "+8",
  },
  {
    title: "ROSIE Challenge Participation",
    description: "Compete in the annual ROSIE Supercomputer Challenge",
    points: "+7",
  },
];

function Points() {
  const navigate = useNavigate();

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
        {earnPoints.map((item, idx) => (
          <div className="points-item" key={idx}>
            <div className="points-item-left">
              <h2 className="points-item-value">
                {item.points}
              </h2>
            </div>
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