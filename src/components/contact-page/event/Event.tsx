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
        <a
          className="event-btn event-btn-primary"
          href="https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUMVNaRkVPUUtNOEsyS1oxMTIwRUpKQkoyNi4u"
          target="_blank"
          rel="noopener noreferrer"
        >
          Connect With Us
        </a>
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
