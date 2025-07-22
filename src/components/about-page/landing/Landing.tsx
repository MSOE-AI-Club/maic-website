import "./Landing.css";
import SpotlightCard from "../../react-bits/spotlight-card/SpotlightCard";
import Aurora from "../../react-bits/aurora-background/Aurora";
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
      <div className="aurora-background">
        <Aurora
          colorStops={["#A066FD", "#61EBF3", "#A066FD"]}
          amplitude={0.5}
          blend={0.5}
          speed={0.2}
        />
      </div>
      <div className="landing-content">
        <h1 className="landing-title">About MAIC</h1>
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
