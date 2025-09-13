import React, { useState, useRef } from "react";
import "./EventCard.css";

interface EventCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  spotlightColor?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const EventCard: React.FC<EventCardProps> = ({
  children,
  className = "",
  style = {},
  spotlightColor = "rgba(255, 255, 255, 0.15)",
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  console.log(className);

  return (
    <div
      ref={cardRef}
      className={`event-card ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="event-card-content">{children}</div>
      {isHovered && (
        <div
          className="spotlight"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            background: `radial-gradient(
              circle,
              ${spotlightColor} 0%,
              ${spotlightColor.replace(/[\d.]+\)$/g, '0.08)')} 40%,
              transparent 70%
            )`,
          }}
        />
      )}
    </div>
  );
};

export default EventCard;
