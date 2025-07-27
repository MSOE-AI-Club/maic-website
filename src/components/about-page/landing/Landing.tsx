import "./Landing.css";
import SpotlightCard from "../../react-bits/spotlight-card/SpotlightCard";
import { LuBrain } from "react-icons/lu";
import { TbBrackets } from "react-icons/tb";
import { FaLightbulb } from "react-icons/fa";

function Landing() {
  const spotlightCards = [
    {
      title: "Learning Community",
      image: <LuBrain />,
    },
    {
      title: "Workshops & Events",
      image: <TbBrackets />,
    },
    {
      title: "Industry Partners",
      image: <FaLightbulb />,
    },
  ];

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Learn More About MAIC</h1>
        <p className="landing-description">
          We are dedicated to making artificial intelligence accessible and
          engaging for students of all backgrounds, regardless of prior
          experience. Our mission is to foster a collaborative learning
          environment where members can explore AI through hands-on projects,
          inspiring speakers, and impactful research.
        </p>
        <div className="spotlight-cards">
          {spotlightCards.map((card) => (
            <SpotlightCard key={card.title}>
              <div className="spotlight-card-content">
                <p className="spotlight-card-image">{card.image}</p>
                <h2 className="spotlight-card-title">{card.title}</h2>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Landing;
