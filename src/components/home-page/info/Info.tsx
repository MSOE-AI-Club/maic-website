import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Info.css";

import EBOARD from "../../../assets/home-page/maic_eboard_25.jpg";
import MOCK from "../../../assets/home-page/mock_leaderboard.png";

function Info() {
  const navigate = useNavigate();

  return (
    <div className="info-section">
      <div className="info-main-content">
        <div className="eboard-section">
          <h1 className="eboard-title">Meet the Eboard</h1>
          <div className="eboard-image-container">
            <img
              src={EBOARD}
              alt="MAIC Eboard"
              className="eboard-image"
              loading="lazy"
            />
          </div>
          <p className="eboard-description">
            A passionate team of MSOE university students
            dedicated to making artificial intelligence
            knowledge accessible to all. By strengthening
            our community partnerships each year, and
            staying on top of current innovations within the
            field, they create a platform for learning and
            innovation, inspiring a future driven by AI's
            transformative potential.
          </p>
          <button
            className="btn-glass contact-btn"
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </button>
        </div>

        <div className="leaderboard-section">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <div className="leaderboard-mock-container">
            <img
              src={MOCK}
              alt="MAIC Leaderboard Mock"
              className="leaderboard-mock-image"
              loading="lazy"
            />
          </div>
          <div className="info-buttons">
            <div className="info-link-card">
              <button onClick={() => navigate("/points")}>
                <h3>What Are Points?</h3>
              </button>
              <button onClick={() => navigate("/achievements")}>
                <h3>What Are Achievements?</h3>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;
