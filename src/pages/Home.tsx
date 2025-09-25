import React, { useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import Landing from "../components/home-page/landing/Landing";
import Info from "../components/home-page/info/Info";
import ExploreAIClub from "../components/home-page/explore-ai-club/ExploreAIClub";
import ReadyToJoin from "../components/home-page/ready-to-join/ReadyToJoin";
import "./Home.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getAliasRedirectTarget } from "../hooks/alias-redirect";

const Home: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const target = getAliasRedirectTarget(location.pathname, location.search);
    if (target) navigate(target, { replace: true });
  }, [location.pathname, location.search]);

  const aliasTarget = getAliasRedirectTarget(location.pathname, location.search);
  if (aliasTarget) {
    return (
      <>
        <Navbar page="Home" />
      </>
    );
  }
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
