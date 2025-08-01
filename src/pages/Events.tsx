import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent } from '../hooks/github-hook';
import ReactMarkdown from 'react-markdown';
import Aurora from '../components/react-bits/aurora-background/Aurora';
import SpotlightCard from '../components/react-bits/spotlight-card/SpotlightCard';
import Footer from '../components/footer/Footer';
import './Events.css';
import { Brackets, Megaphone, Trophy, Lightbulb, Grip, ArrowUpDown } from 'lucide-react';

interface EventData {
    title: string;
    type: 'workshop' | 'speaker' | 'competition' | 'intro';
    date: string;
    image: string;
    description: string;
    content: string;
}

const EVENT_TYPE_META: Record<
    EventData['type'],
    { icon: React.ElementType; label: string }
> = {
    workshop: { icon: (props: any) => <Brackets color="#fff" {...props} />, label: 'Workshops' },
    speaker: { icon: (props: any) => <Megaphone color="#fff" {...props} />, label: 'Speaker Sessions' },
    competition: { icon: (props: any) => <Trophy color="#fff" {...props} />, label: 'Competitions' },
    intro: { icon: (props: any) => <Lightbulb color="#fff" {...props} />, label: 'Intro Series' },
};

const FILTERS = [
    { key: 'all', label: 'All Events', icon: (props: any) => <Grip color="#fff" {...props} /> },
    { key: 'workshop', label: 'Workshops', icon: (props: any) => <Brackets color="#fff" {...props} /> },
    { key: 'speaker', label: 'Speaker Events', icon: (props: any) => <Megaphone color="#fff" {...props} /> },
    { key: 'competition', label: 'Competitions', icon: (props: any) => <Trophy color="#fff" {...props} /> },
    { key: 'intro', label: 'Intro Series', icon: (props: any) => <Lightbulb color="#fff" {...props} /> },
];

const Events: React.FC = () => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [showScrollArrows, setShowScrollArrows] = useState<boolean>(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const jsonData = await getFileContent('data/events/events.json');
                if (jsonData) {
                    const data: EventData[] = JSON.parse(jsonData);
                    setEvents(data);
                } else {
                    console.warn('Failed to fetch events data, using hardcoded backup');
                    setEvents([]);
                    setFilteredEvents([]);
                }
            } catch (e) {
                console.warn('Error parsing events data, using hardcoded backup:', e);
                setEvents([]);
                setFilteredEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        filterAndSortEvents(events, activeFilter, searchTerm, sortOrder);
        // eslint-disable-next-line
    }, [events, activeFilter, searchTerm, sortOrder]);

    const filterAndSortEvents = (
        eventsList: EventData[] = events,
        filter: string = activeFilter,
        search: string = searchTerm,
        order: 'asc' | 'desc' = sortOrder
    ) => {
        let filtered = [...eventsList];

        if (filter !== 'all') {
            filtered = filtered.filter(event => event.type === filter);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchLower) ||
                event.description.toLowerCase().includes(searchLower)
            );
        }

        filtered = filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        setFilteredEvents(filtered);
    };

    // Returns a lucide icon for the event type, for use in event cards and modal
    const getEventIcon = (eventType: string, props: any = {}) => {
        switch (eventType) {
            case 'workshop':
                return <Brackets color="#fff" size={28} {...props} />;
            case 'speaker':
                return <Megaphone color="#fff" size={28} {...props} />;
            case 'competition':
                return <Trophy color="#fff" size={28} {...props} />;
            case 'intro':
                return <Lightbulb color="#fff" size={28} {...props} />;
            default:
                return <Grip color="#fff" size={28} {...props} />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const openModal = (event: EventData) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
        document.body.classList.add('no-scroll');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        document.body.classList.remove('no-scroll');
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            const modal = document.querySelector('.events-modal');
            if (e.target === modal && isModalOpen) {
                closeModal();
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClickOutside);
        };
        // eslint-disable-next-line
    }, [isModalOpen]);

    const getUpcomingEvents = () => {
        const now = new Date();
        return events.filter(event => new Date(event.date) >= now);
    };

    const scrollUpcomingEvents = (direction: 'left' | 'right') => {
        const container = document.querySelector('.upcoming-events-row') as HTMLElement;
        if (container) {
            const scrollAmount = container.clientWidth * 0.6;
            const newScrollLeft = direction === 'left' 
                ? container.scrollLeft - scrollAmount 
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const checkScrollNeeded = () => {
        const container = document.querySelector('.upcoming-events-row') as HTMLElement;
        if (container) {
            const needsScroll = container.scrollWidth > container.clientWidth;
            setShowScrollArrows(needsScroll);
        }
    };

    useEffect(() => {
        checkScrollNeeded();
        const handleResize = () => checkScrollNeeded();
        window.addEventListener('resize', handleResize);
        
        const timeoutId = setTimeout(checkScrollNeeded, 100);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
        // eslint-disable-next-line
    }, [events]);

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
                                <div className="gradient-line"></div>
                                <div className="events-item-container">
                                    {Object.entries(EVENT_TYPE_META).map(([type, { icon: Icon, label }]) => (
                                        <SpotlightCard className="header-event-item" key={type}>
                                            <div className="header-event-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                <Icon size={36} style={{ marginBottom: 8 }} />
                                                <div className="header-event-title" style={{ textAlign: 'center' }}>
                                                    {label}
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                                <div className="events-hero-description">
                                    Our events provide a learning environment for students to hear about the latest AI innovations,
                                    engage with technical details, and connect with industry partners.<br />
                                    <button className="event-btn event-btn-primary">
                                    Connect With Us
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events Section */}
                        <div className="upcoming-events-section">
                            <div className="events-section-header">
                                <h2 className="events-section-title">Upcoming Events</h2>
                                <div className="gradient-line"></div>
                            </div>
                            
                            <div className="upcoming-events-row-wrapper">
                                {showScrollArrows && (
                                    <>
                                        <button 
                                            className="upcoming-events-arrow left"
                                            onClick={() => scrollUpcomingEvents('left')}
                                            aria-label="Scroll left"
                                        >
                                            <i className="material-icons">chevron_left</i>
                                        </button>
                                        <button 
                                            className="upcoming-events-arrow right"
                                            onClick={() => scrollUpcomingEvents('right')}
                                            aria-label="Scroll right"
                                        >
                                            <i className="material-icons">chevron_right</i>
                                        </button>
                                    </>
                                )}
                                <div className="upcoming-events-row">
                                    {getUpcomingEvents().length > 0 ? (
                                        getUpcomingEvents().map((event, index) => (
                                            <SpotlightCard
                                                key={index}
                                                className="event-item featured-event"
                                                style={{ 
                                                    minWidth: 320, 
                                                    margin: '0 12px',
                                                    textAlign: "left",
                                                    alignItems: "flex-start",
                                                    justifyContent: "flex-start", 
                                                }}
                                            >
                                                <div
                                                    style={{ cursor: 'pointer' }}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={`View details for ${event.title}`}
                                                    onClick={() => openModal(event)}
                                                    onKeyDown={(e: React.KeyboardEvent) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            openModal(event);
                                                        }
                                                    }}
                                                >
                                                    <div className="event-header">
                                                        <div className="event-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {getEventIcon(event.type, { style: { marginRight: 0 } })}
                                                            {event.title}
                                                        </div>
                                                        <div className="event-date">{formatDate(event.date)}</div>
                                                    </div>
                                                    <div className="event-preview-content-row">
                                                        <img 
                                                            src={event.image} 
                                                            alt={`${event.title} event image`} 
                                                            className="event-preview-image"
                                                        />
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
                                            No upcoming events right now, come back later!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="events-filter-bar">
                            <div className="events-search-bar">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="events-search-input"
                                />
                            </div>
                            
                            {FILTERS.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    className={`filter-button ${key} ${activeFilter === key ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(key)}
                                >
                                    <Icon size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                    {label}
                                </button>
                            ))}
                            
                            <button
                                className="sort-toggle-button"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                <ArrowUpDown size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} color="#fff" />
                                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                            </button>
                        </div>

                        {/* Events Grid */}
                        <div className="events-grid">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, index) => (
                                    <SpotlightCard
                                        key={index}
                                        className="event-item"
                                        style={{ 
                                            minWidth: 320, 
                                            margin: '0 12px',
                                            textAlign: "left",
                                            alignItems: "flex-start",
                                            justifyContent: "flex-start",
                                        }}
                                    >
                                        <div
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => openModal(event)}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`View details for ${event.title}`}
                                            onKeyDown={(e: React.KeyboardEvent) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    openModal(event);
                                                }
                                            }}
                                        >
                                            <div className="event-header">
                                                <div className="event-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {getEventIcon(event.type, { style: { marginRight: 0 } })}
                                                    {event.title}
                                                </div>
                                                <div className="event-date">{formatDate(event.date)}</div>
                                            </div>
                                            <div className="event-preview-content-row">
                                                <img 
                                                    src={event.image} 
                                                    alt={`${event.title} event image`} 
                                                    className="event-preview-image"
                                                />
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
                    </>
                )}

                {/* Modal */}
                {isModalOpen && selectedEvent && (
                    <div className="events-modal">
                        <div className="modal-content">
                            <span 
                                className="close-button" 
                                onClick={closeModal}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        closeModal();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label="Close modal"
                            >
                                &times;
                            </span>
                            <div className="modal-content-body">
                                <div className="modal-header" style={{
                                    marginBottom: '20px',
                                    borderBottom: '2px solid rgba(var(--text-2), 0.3)',
                                    paddingBottom: '15px'
                                }}>
                                    <h1 style={{
                                        fontSize: '2.2em',
                                        fontWeight: 'bold',
                                        margin: '0 0 8px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'rgb(var(--text-1))'
                                    }}>
                                        {getEventIcon(selectedEvent.type, { style: { marginRight: 12 } })}
                                        {selectedEvent.title}
                                    </h1>
                                    <div style={{
                                        fontSize: '1.1em',
                                        color: 'rgba(var(--text-2), 0.8)',
                                        fontWeight: '500'
                                    }}>
                                        {formatDate(selectedEvent.date)}
                                    </div>
                                </div>
                                <ReactMarkdown>{selectedEvent.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Events;