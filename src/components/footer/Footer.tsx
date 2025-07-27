import React from "react";
import "./Footer.css";
import { FaInstagram, FaLinkedin, FaGraduationCap } from "react-icons/fa";
import MAICLogo from "../../assets/maic_logo.png";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-club-name">
            <img src={MAICLogo} alt="MSOE AI Club" className="footer-logo" />
            <span>
              <h2>MSOE AI CLUB</h2>
            </span>
          </span>
          <p className="footer-description">
            Empowering students of all backgrounds to explore 
            and innovate in artificial intelligence through hands-on 
            workshops, industry insights, and collaborative 
            research.
          </p>
        </div>

        <div className="footer-center">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/library">Library</a></li>
            <li><a href="/learning-tree">Learning Tree</a></li>
            <li><a href="/events">Events</a></li>
          </ul>
        </div>

        <div className="footer-center">
          <h3>&nbsp;</h3>
          <ul>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/merch">Merch</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </div>

        <div className="footer-right">
          <h3>Social Media</h3>
          <div className="social-links">
          <a href="https://www.linkedin.com/company/msoeaiclub/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link">
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>
            <a href="#" className="social-link">
              <FaInstagram />
              <span>Instagram</span>
            </a>
            <a href="https://www.msoe.edu/ai-and-msoe/ai-student-projects-and-clubs/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link">
              <FaGraduationCap />
              <span>MSOE</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} MSOE AI CLUB. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
