import React from "react";
import Navbar from "../components/Navbar";
import FAQ from "../components/about-page/faq/FAQ";
import Landing from "../components/about-page/landing/Landing";
import Industry from "../components/about-page/industry/Industry";

const About: React.FC = () => {
  return (
    <div>
      <Navbar page="About" margin-bottom="100px" />
      <div className="about-container">
        <Landing />
        <FAQ />
        <Industry />
      </div>
    </div>
  );
};

export default About;
