import React, { useEffect } from 'react';
import './Landing.css';
import { startAnimation } from '../../../pages/bg-animation';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { getRawFileUrl } from '../../../hooks/github-hook';

function Landing() {
    const logoUrl = getRawFileUrl('images/general/Logo.png');
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
                        <img src={logoUrl} alt="MAIC Brain Network" className="landing-maic-logo" />
                    </div>
                    <div className="landing-text-section">
                        <h1 className="landing-title">MSOE AI CLUB (MAIC)</h1>
                        <p className="landing-description">
                        Empowering students of all backgrounds to explore and innovate in artificial intelligence through hands-on workshops, industry insights, and collaborative research.
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