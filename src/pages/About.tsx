import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import FAQ from "../components/about-page/faq/FAQ";
import Landing from "../components/about-page/landing/Landing";
import Industry from "../components/about-page/industry/Industry";
import Footer from "../components/footer/Footer";

const About: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "MAIC - About";
    return () => {
      document.title = previousTitle;
    };
  }, []);
  return (
    <div>
      <Navbar page="About" margin-bottom="100px" />
      <div className="about-container">
        <Landing />
        <FAQ />
        <Industry />
      </div>
      <Footer />
    </div>
  );
};

export default About;
