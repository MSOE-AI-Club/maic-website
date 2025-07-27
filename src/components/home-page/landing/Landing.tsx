import React, { useEffect } from 'react';
import './Landing.css';
import { startAnimation } from '../../../pages/bg-animation';
import { MdKeyboardArrowDown } from 'react-icons/md';
import MAICLogo from '../../../assets/maic_logo.png';

function Landing() {
    useEffect(() => {
        const cleanup = startAnimation('landing-bg');
        if (cleanup) {
            return cleanup;
        }
    }, []);

    return (
        <div className="landing-hero-section">
            <canvas id="landing-bg" className="landing-bg-canvas"></canvas>
            <div className="landing-container">
                <div className="landing-content-wrapper">
                    <div className="landing-logo-section">
                        <img src={MAICLogo} alt="MAIC Brain Network" className="landing-maic-logo" />
                    </div>
                    <div className="landing-text-section">
                        <h1 className="landing-title">MSOE AI CLUB (MAIC)</h1>
                        <p className="landing-description">
                            We are built upon a foundation of teaching as many people as possible about the innovative space of artificial intelligence, regardless of their previous experience. We do this through a combination of Speaker Events, Innovation Labs, and Research Groups.
                        </p>
                        <div className="landing-button-container">
                            <a href="/about" className="landing-learn-more-link">
                                <button className="landing-learn-more-btn btn-glass btn-purple">
                                    Learn More
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="landing-scroll-btn-container">
                    <div className="landing-scroll-text">
                        Scroll Down!
                    </div>
                    <div className="landing-scroll-arrow">
                        <MdKeyboardArrowDown />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;