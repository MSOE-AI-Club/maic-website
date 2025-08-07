import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import PointsSystem from "../components/points-page/Points";
import Footer from "../components/footer/Footer";

function Points() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar page="Points" />
      <PointsSystem />
      <Footer />
    </>
  );
}

export default Points;
