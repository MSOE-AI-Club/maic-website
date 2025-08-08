import React, { useEffect } from "react";
import Achievements from "../components/achievements-page/Achievements";
import Navbar from "../components/Navbar";
import Footer from "../components/footer/Footer";

function AchievementsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Navbar page="achievements" />
      <Achievements />
      <Footer />
    </div>
  );
}

export default AchievementsPage;
