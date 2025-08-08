import "./Landing.css";
import SpotlightCard from "../../react-bits/spotlight-card/SpotlightCard";
import { Brain, Brackets, Lightbulb } from "lucide-react";  

function Landing() {
  const spotlightCards = [
    {
      title: "Learning Community",
      image: <Brain size={36} />,
    },
    {
      title: "Workshops & Events",
      image: <Brackets size={36} />,
    },
    {
      title: "Industry Partners",
      image: <Lightbulb size={36} />,
    },
  ];

  return (
    <div className="about-landing-container">
      <div className="about-landing-content">
        <h1 className="about-landing-title">About MAIC</h1>
        <p className="about-landing-description">
          We are dedicated to making artificial intelligence accessible and
          engaging for students of all backgrounds, regardless of prior
          experience. Our mission is to foster a collaborative learning
          environment where members can explore AI through hands-on projects,
          inspiring speakers, and impactful research.
        </p>

        {/* Mobile-only Ready to Join section */}
        <div className="mobile-ready-to-join">
          <div className="mobile-ready-to-join-line"></div>
          <div className="mobile-ready-to-join-section">
            <h2 className="mobile-ready-to-join-title">Ready to Join?</h2>
            <div className="mobile-ready-to-join-button-container">
              <a
                href="https://teams.microsoft.com/l/team/19%3A1910afef1d1d4e3b9bfd5f7938182f0b%40thread.tacv2/conversations?groupId=8f7bf1ac-c9b6-4bf0-b74a-407f088e74cc&tenantId=4046ceac-fdd3-46c9-ac80-b7c4a49bab70"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn-glass btn-purple mobile-ready-to-join-btn">
                  Join Our Teams
                </button>
              </a>
            </div>
          </div>
        </div>

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
