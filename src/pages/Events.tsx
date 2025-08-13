import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { getFileContent, getRawFileUrl } from "../hooks/github-hook";
import SpotlightCard from "../components/react-bits/spotlight-card/SpotlightCard";
import Footer from "../components/footer/Footer";
import "./Events.css";
import {
  Megaphone,
  Trophy,
  Lightbulb,
  Grip,
  Funnel,
  BrainCircuit,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

interface EventData {
  title: string;
  type: "workshop" | "speaker" | "competition" | "intro";
  date: string;
  image: string;
  description: string;
}

interface IconProps extends LucideProps {
  size?: number;
  color?: string;
}

const EVENT_TYPE_META: Record<
  EventData["type"],
  { icon: React.ComponentType<IconProps>; label: string }
> = {
  workshop: {
    icon: (props: IconProps) => <BrainCircuit color="#fff" {...props} />,
    label: "Workshops",
  },
  speaker: {
    icon: (props: IconProps) => <Megaphone color="#fff" {...props} />,
    label: "Speaker Sessions",
  },
  competition: {
    icon: (props: IconProps) => <Trophy color="#fff" {...props} />,
    label: "Competitions",
  },
  intro: {
    icon: (props: IconProps) => <Lightbulb color="#fff" {...props} />,
    label: "Intro Series",
  },
};

const FILTERS = [
  {
    key: "all",
    label: "All Events",
    icon: (props: IconProps) => <Grip color="#fff" {...props} />,
  },
  {
    key: "workshop",
    label: "Workshops",
    icon: (props: IconProps) => <BrainCircuit color="#fff" {...props} />,
  },
  {
    key: "speaker",
    label: "Speaker Events",
    icon: (props: IconProps) => <Megaphone color="#fff" {...props} />,
  },
  {
    key: "competition",
    label: "Competitions",
    icon: (props: IconProps) => <Trophy color="#fff" {...props} />,
  },
  {
    key: "intro",
    label: "Intro Series",
    icon: (props: IconProps) => <Lightbulb color="#fff" {...props} />,
  },
];

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set page title on mount
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "MAIC - Events";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const jsonData = await getFileContent("data/events/events.json");
        if (jsonData) {
          const data: EventData[] = JSON.parse(jsonData);
          setEvents(data);
        } else {
          console.warn("Failed to fetch events data, using hardcoded backup");
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (e) {
        console.warn("Error parsing events data, using hardcoded backup:", e);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents(events, activeFilter, searchTerm);
    // eslint-disable-next-line
  }, [events, activeFilter, searchTerm]);

  const filterAndSortEvents = (
    eventsList: EventData[] = events,
    filter: string = activeFilter,
    search: string = searchTerm
  ) => {
    let filtered = [...eventsList];

    if (filter !== "all") {
      filtered = filtered.filter((event) => event.type === filter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
      );
    }

    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredEvents(filtered);
  };

  // Returns a lucide icon for the event type, for use in event cards and modal
  const getEventIcon = (eventType: string, props: IconProps = {}) => {
    switch (eventType) {
      case "workshop":
        return <BrainCircuit color="#fff" size={28} {...props} />;
      case "speaker":
        return <Megaphone color="#fff" size={28} {...props} />;
      case "competition":
        return <Trophy color="#fff" size={28} {...props} />;
      case "intro":
        return <Lightbulb color="#fff" size={28} {...props} />;
      default:
        return <Grip color="#fff" size={28} {...props} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="events-page-container">
        <Navbar page="Events" />

        {loading ? (
          <div className="events-hero-section">
            <div className="events-hero-content">
              <h1 className="events-hero-title">Loading events...</h1>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="events-hero-section">
              <div className="events-hero-content">
                <h1 className="events-hero-title">MAIC Events</h1>
                <div className="events-hero-description">
                  Our events empower students to explore cutting edge AI,
                  sharpen technical skills, and engage directly with industry
                  leaders. From hands on learning to real world networking, it's
                  all about growing, connecting, and staying ahead.
                </div>
                <div className="events-item-container">
                  {Object.entries(EVENT_TYPE_META).map(
                    ([type, { icon: Icon, label }]) => (
                      <SpotlightCard className="header-event-item" key={type} onClick={() => setActiveFilter(type)}>
                        <div
                          className="header-event-header"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Icon size={36} style={{ marginBottom: 8 }} />
                          <div
                            className="header-event-title"
                            style={{ textAlign: "center" }}
                          >
                            {label}
                          </div>
                        </div>
                      </SpotlightCard>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="events-controls-section">
              <div className="events-filter-bar">
                <div className="events-search-container">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="events-search-input"
                  />
                </div>

                <button
                  className="mobile-filter-toggle"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                  <Funnel size={20} style={{ marginRight: 8 }} />
                  {isMobileFilterOpen ? "Hide" : "Filters"}
                </button>

                <div
                  className={`filter-buttons-container ${
                    isMobileFilterOpen ? "mobile-open" : ""
                  }`}
                >
                  {FILTERS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      className={`filter-button ${key} ${
                        activeFilter === key ? "active" : ""
                      }`}
                      onClick={() => setActiveFilter(key)}
                    >
                      <Icon
                        size={20}
                        style={{ marginRight: 8, verticalAlign: "middle" }}
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="events-grid-section">
              <div className="events-grid">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event, index) => (
                    <SpotlightCard
                      key={index}
                      className="event-item"
                      style={{
                        textAlign: "left",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                          className="event-card-content"
                      >
                        <div className="event-header">
                          <div
                            className="event-title"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {event.title}
                          </div>
                        </div>
                        <div className="event-preview-content-row">
                          <div className="event-left">
                            <div className="event-image-box">
                              <img
                                src={getRawFileUrl(event.image)}
                                alt={`${event.title} event image`}
                                className="event-preview-image"
                              />
                              <div className="event-image-spacer" />
                            </div>
                            <div className="event-bottom-left">
                              {getEventIcon(event.type, { size: 32 })}
                              <div className="event-date">{formatDate(event.date)}</div>
                            </div>
                          </div>
                          <div className="event-preview-description-container">
                            <div className="event-preview-description">
                              {event.description}
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </SpotlightCard>
                  ))
                ) : (
                  <div className="no-events-message">
                    Whoops, no matching events found!
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Events;
