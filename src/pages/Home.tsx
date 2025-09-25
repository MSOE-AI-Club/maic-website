import React, { useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import Landing from "../components/home-page/landing/Landing";
import Info from "../components/home-page/info/Info";
import ExploreAIClub from "../components/home-page/explore-ai-club/ExploreAIClub";
import ReadyToJoin from "../components/home-page/ready-to-join/ReadyToJoin";
import "./Home.css";
import { useLocation } from "react-router-dom";
import { performAliasRedirect } from "../hooks/alias-redirect";

const Home: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    const target = performAliasRedirect(location.pathname, location.search);
    if (target) {
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [location.pathname, location.search]);
  return (
    <>
      <Navbar page="Home" />
      <Landing />
      <Info />
      <ExploreAIClub />
      <ReadyToJoin />
      <Footer />
    </>
  );
};

export default Home;
