import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/footer/Footer";
import Landing from "../components/home-page/landing/Landing";
import Info from "../components/home-page/info/Info";
import ExploreAIClub from "../components/home-page/explore-ai-club/ExploreAIClub";
import ReadyToJoin from "../components/home-page/ready-to-join/ReadyToJoin";
import "./Home.css";
import { startAnimation } from "./bg-animation";

interface User {
  User: string;
  "All-Time Points": string;
  "Current Points": string;
  Awards: string;
}

interface Achievement {
  name: string;
  imageUrl: string;
  title: string;
}

interface Card {
  title: string;
  subtitle: string;
  description: string;
  sub_description: string;
  imageUrl: string;
  borderColor: string;
  imageOnLeft: boolean;
}

const Home: React.FC = () => {
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
