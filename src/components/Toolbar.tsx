import React, { useState, useEffect } from "react";
import { getRawFileUrl } from "../hooks/github-hook";

/**
 * Navigation toolbar component
 * Displays the MAIC logo and navigation links
 */
const Toolbar: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await getRawFileUrl("img/misc/Sticker.png");
        if (url) {
          setLogoUrl(url);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            {logoUrl && (
              <img src={logoUrl} alt="MAIC Logo" className="h-8 w-8 mr-3" />
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("below-splash")}
              className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Home
            </button>
            <a
              href="/library"
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              Library
            </a>
            <a
              href="/learning-tree"
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              Learning Tree
            </a>
            <a
              href="/workshops"
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              Workshops
            </a>
            <a
              href="/merch"
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              Merch
            </a>
            <a
              href="/contact"
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              Contact
            </a>
            <a
              href="/about"
              className="text-white hover:text-purple-300 transition-colors duration-200"
            >
              About
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-white hover:text-purple-300">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
