import React, { useState, useEffect } from "react";
import { getRawFileUrl } from "../hooks/github-hook";

/**
 * About section component that displays the eboard information
 * Shows transition image, team photo, and description
 */
const AboutSection: React.FC = () => {
  const [transitionUrl, setTransitionUrl] = useState<string>("");
  const [eboardPhotoUrl, setEboardPhotoUrl] = useState<string>("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const [transition, eboard] = await Promise.all([
          getRawFileUrl("img/misc/transition.png"),
          getRawFileUrl("img/misc/maic_eboard_24.jpg"),
        ]);

        if (transition) setTransitionUrl(transition);
        if (eboard) setEboardPhotoUrl(eboard);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div id="below-splash" className="relative">
      {/* Transition Image */}
      {transitionUrl && (
        <img
          src={transitionUrl}
          alt="Transition"
          className="w-full h-auto block"
        />
      )}

      {/* Content Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center text-white">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Meet the Eboard!
            </h1>

            {/* Team Photo */}
            {eboardPhotoUrl && (
              <div className="mb-6">
                <img
                  src={eboardPhotoUrl}
                  alt="MAIC Eboard 2024"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Description */}
            <p className="text-gray-300 leading-relaxed mb-6">
              A passionate team of MSOE university students dedicated to making
              artificial intelligence knowledge accessible to all. By
              strengthening our community partnerships each year, and staying on
              top of current innovations within the field, they create a
              platform for learning and innovation, inspiring a future driven by
              AI's transformative potential.
            </p>

            {/* Contact Link */}
            <a
              href="/contact"
              className="inline-block text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
