import React from "react";
import { useNavigate } from "react-router-dom";
import "./Event.css";

function Event() {
  const navigate = useNavigate();

  return (
    <div className="event-hosting-container">
      <div className="event-line"></div>
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
    </div>
  );
}

export default Event;
