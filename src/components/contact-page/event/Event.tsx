import React from "react";
import { useNavigate } from "react-router-dom";
import "./Event.css"; // Assume you will create a CSS file for styling

function Event() {
  const navigate = useNavigate();

  return (
    <div className="event-hosting-container">
      <h2 className="event-title">Interested In Hosting An Event?</h2>
      <div className="event-actions">
        <button
          className="event-btn event-btn-primary"
          onClick={() => navigate("/contact")}
        >
          Connect With Us
        </button>
        <button
          className="event-btn event-btn-secondary"
          onClick={() => navigate("/events")}
        >
          View Past Events
        </button>
      </div>
      <div className="event-stats-row">
        <div className="event-stat">
          <div className="event-stat-value">200+</div>
          <div className="event-stat-label">Active Members</div>
        </div>
        <div className="event-stat">
          <div className="event-stat-value">30+</div>
          <div className="event-stat-label">Past Events</div>
        </div>
        <div className="event-stat">
          <div className="event-stat-value">###+</div>
          <div className="event-stat-label">Random Stat</div>
        </div>
      </div>
    </div>
  );
}

export default Event;
