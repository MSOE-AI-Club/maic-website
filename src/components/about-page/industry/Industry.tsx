import "./Industry.css";
import SpotlightCard from "../spotlight-card/SpotlightCard";
import DirectSupply from "../../../assets/direct_supply_logo.png";
import NVIDIA from "../../../assets/nvidia_logo.png";
import MSOE from "../../../assets/msoe_logo.png";

function Industry() {
  const industryList = [
    {
      name: "Milwaukee School of Engineering (MSOE)",
      description:
        "At the heart of Milwaukee School of Engineering's (MSOE) progress lies a thriving community ethos. Embracing hands-on education, MSOE nurtures an environment where growth is not just a goal but a shared journey. This ethos fuels MSOE AI-Club (MAIC) with workshops, research, and events that mirror the institution's commitment to practical learning. As MSOE evolves, so does MAIC, embodying the power of collaboration and experiential education in the realm of AI.",
      image: MSOE,
    },
    {
      name: "Direct Supply",
      description:
        "At the core of MSOE AI-Club's (MAIC) practical learning approach thrives a dynamic partnership with its main sponsor, Direct Supply. This collaboration fuels the growth of MAIC, where hands-on education meets real-world applications. Direct Supply's support amplifies MAIC's impact, bridging theory and practice to shape future AI innovators.",
      image: DirectSupply,
    },
    {
      name: "NVIDIA",
      description:
        "In the realm of practical education at Milwaukee School of Engineering (MSOE), NVIDIA stands as a vital ally. Powering the MSOE AI-Club (MAIC), this partnership blends theory with practice through workshops, research, and events. NVIDIA's global student network and Dierck's Hall, a cutting-edge hub, amplify MAIC's impact, demonstrating the fusion of education and technology. This synergy propels both MSOE and MAIC towards a future defined by AI innovation.",
      image: NVIDIA,
    },
  ];

  return (
    <div className="industry-container">
      <h1>Driven By Industry</h1>
      <p>
        MAIC is driven by industry, meaning we want to provide students with the
        skills and knowledge that they need to be successful in industry.
        <br />
        <br />
        To accomplish this goal, MAIC hopes to frequently communicate with many
        industry partners, including local companies, to understand what skills
        they are looking for in their employees. We also hope to bring in
        speakers from these companies to talk about what they do.
      </p>
      <div className="industry-list">
        {industryList.map((industry) => (
          <SpotlightCard key={industry.name} className="dark">
            <div className="industry-card-content">
              <div className="industry-logo-section">
                <img
                  className="industry-image"
                  src={industry.image}
                  alt={industry.name}
                />
              </div>
              <div className="industry-text-section">
                <h2 className="industry-name">{industry.name}</h2>
                <p className="industry-description">{industry.description}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}

export default Industry;
