import React from 'react';
import './Payment.css';
import { useNavigate } from 'react-router-dom';

function Payment() {
    const navigate = useNavigate();
    return (
        <>
        <div className="earn-points-cta-line"></div>
        <div className="earn-points-cta">
        <h1>How Do You Earn Points?</h1>
        <button
          className="earn-points-cta-button"
          onClick={() => navigate("/points")}
        >
          Visit Points Page
        </button>
      </div>
      </>
    );
}

export default Payment;