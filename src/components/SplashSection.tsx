import React, { useState, useEffect } from "react";
import { getRawFileUrl } from "../hooks/github-hook";
import { ChevronDown } from "lucide-react";

/**
 * Splash section component for the hero area
 * Displays the main logo, about text, and call-to-action links
 */
const SplashSection: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await getRawFileUrl("img/misc/logo.png");
        if (url) {
          setLogoUrl(url);
        }
      } catch (error) {
        console.error("Error fetching main logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const scrollToContent = () => {
    const element = document.getElementById("below-splash");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
      {/* Logo */}
      <div className="mb-8 animate-fade-in-down">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="MAIC Logo"
            className="max-w-md w-full h-auto"
          />
        )}
      </div>

      {/* About Section */}
      <div className="max-w-2xl mx-auto px-6 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          About Us
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-6"></div>
        <p className="text-lg md:text-xl leading-relaxed mb-8">
          <span className="font-bold text-purple-300">MSOE AI Club (MAIC)</span>{" "}
          is built upon a foundation of teaching as many people as possible
          about the innovative space of artificial intelligence, regardless of
          their previous experience. We do this through a combination of Speaker
          Events, Innovation Labs, and Research Groups.
        </p>

        {/* Call to Action Links */}
        <div className="space-y-4">
          <a
            href="/about"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
          >
            💡 <span className="ml-2">Learn More</span>
          </a>
          <br />
          <a
            href="https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUMVNaRkVPUUtNOEsyS1oxMTIwRUpKQkoyNi4u"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
          >
            📣 <span className="ml-2">Speak At An Upcoming Event</span>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center text-white/70 hover:text-white transition-colors duration-200"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SplashSection;
