import React from "react";
import "./Footer.css";
import MAICLogo from "../../assets/maic_logo.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-club-name">
            <img src={MAICLogo} alt="MSOE AI Club" className="footer-logo" />
            <span className="footer-club-text">
              <h2>MSOE AI CLUB</h2>
            </span>
          </span>
          <p className="footer-description">
            Empowering students of all backgrounds to explore and innovate in
            artificial intelligence through hands-on workshops, industry
            insights, and collaborative research.
          </p>
        </div>

        <div className="footer-center">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/library">Library</a>
            </li>
            <li>
              <a href="/learning-tree">Learning Tree</a>
            </li>
            <li>
              <a href="/events">Events</a>
            </li>
          </ul>
        </div>

        <div className="footer-center">
          <h3>&nbsp;</h3>
          <ul>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/merch">Merch</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
          </ul>
        </div>

        <div className="footer-right">
          <h3>Social Media</h3>
          <div className="social-links">
            <a
              href="https://www.linkedin.com/company/msoeaiclub/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <span>LinkedIn</span>
            </a>
            <a
              href="https://www.instagram.com/msoe_ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
