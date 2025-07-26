import React from "react";
import Achievements from "../components/achievements-page/Achievements";
import Navbar from "../components/Navbar";
import Footer from "../components/footer/Footer";
import { Route } from "react-router-dom";

function AchievementsPage() {
    return (

            <div>
                <Navbar page="achievements" />
                <Achievements />
                <Footer />
            </div>
        
    );
}

export default AchievementsPage;