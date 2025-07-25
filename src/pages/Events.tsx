import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent } from '../hooks/github-hook';
import ReactMarkdown from 'react-markdown';
import Aurora from '../components/react-bits/aurora-background/Aurora';
import SpotlightCard from '../components/react-bits/spotlight-card/SpotlightCard';
import './Events.css';

interface EventData {
    title: string;
    type: 'workshop' | 'speaker' | 'competition' | 'intro';
    date: string;
    image: string;
    description: string;
    content: string;
}

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
                    // Remove setTimeout and direct filterAndSortEvents call
                } else {
                    // Fall back to hardcoded data
                    console.warn('Failed to fetch events data, using hardcoded backup');
                    setEvents([]);
                    setFilteredEvents([]);
                }
            } catch (e) {
                // Fall back to hardcoded data on error
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
    }, [events, activeFilter, searchTerm, sortOrder]);

    // Accept parameters to avoid stale closure issues
    const filterAndSortEvents = (
        eventsList: EventData[] = events,
        filter: string = activeFilter,
        search: string = searchTerm,
        order: 'asc' | 'desc' = sortOrder
    ) => {
        let filtered = [...eventsList];

        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(event => event.type === filter);
        }

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchLower) ||
                event.description.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        filtered = filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        setFilteredEvents(filtered);
    };

    const getEventIcon = (eventType: string) => {
        const icons = {
            workshop: { icon: 'construction', color: '#ff6b6b' },
            speaker: { icon: 'campaign', color: '#a991ff' },
            competition: { icon: 'emoji_events', color: '#6ec6ff' },
            intro: { icon: 'lightbulb', color: '#ffe066' },
        };
        const { icon, color } = icons[eventType as keyof typeof icons] || { icon: 'event', color: '#b0b0b0' };
        return (
            <i className="material-icons" style={{ verticalAlign: 'middle', color, marginRight: '8px' }}>
                {icon}
            </i>
        );
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

    // Handle escape key and click outside modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            const modal = document.querySelector('.modal');
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
    }, [isModalOpen]);

    const getUpcomingEvents = () => {
        const now = new Date();
        return events.filter(event => new Date(event.date) >= now);
    };

    const scrollUpcomingEvents = (direction: 'left' | 'right') => {
        const container = document.querySelector('.upcoming-events-row') as HTMLElement;
        if (container) {
            const scrollAmount = container.clientWidth * 0.6; // Scroll by 60% of container width
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

    // Check scroll need when events change or window resizes
    useEffect(() => {
        checkScrollNeeded();
        const handleResize = () => checkScrollNeeded();
        window.addEventListener('resize', handleResize);
        
        // Small delay to ensure DOM is fully rendered
        const timeoutId = setTimeout(checkScrollNeeded, 100);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [events]);

    return (
        <>
            {/* Aurora background for the whole page */}
            <div style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none'
            }}>
                <Aurora
                    colorStops={["#A066FD", "#61EBF3", "#A066FD"]}
                    amplitude={0.5}
                    blend={0.5}
                    speed={0.2}
                />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar page="Events" />
                {loading ? (
                    <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                        <h1>Loading events...</h1>
                    </div>
                ) : (
                    <div style={{ paddingRight: '20px', paddingLeft: '20px' }}>
                        {/* Hero Section */}
                        <div
                            className="liquid-glass"
                            style={{
                                maxWidth: '90vw',
                                margin: '30px auto',
                                marginTop: '75px',
                                padding: '0',
                                overflow: 'hidden',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div style={{
                                padding: '32px 24px 24px 24px',
                                width: '100%',
                                borderRadius: '20px'
                            }}>
                                <h1 style={{
                                    fontSize: '2.5em',
                                    fontWeight: 'bold',
                                    marginBottom: '10px',
                                    color: '#fff',
                                    letterSpacing: '1px',
                                    textAlign: 'center',
                                    width: '100%'
                                }}>
                                    MAIC Events
                                </h1>
                                <div style={{ margin: '12px 0' }}></div>
                                <h3 style={{
                                    fontSize: '1.3em',
                                    fontWeight: '400',
                                    marginBottom: '18px',
                                    color: '#e0e0e0',
                                    width: '100%'
                                }}>
                                    Discover MAIC's diverse range of events, from in-depth{' '}
                                    <span style={{ fontWeight: 'bold', color: '#ffe066' }}>workshops</span>,
                                    insightful <span style={{ fontWeight: 'bold', color: '#a991ff' }}>speaker sessions</span>,
                                    exciting <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>competitions</span>,
                                    and foundational <span style={{ fontWeight: 'bold', color: '#6ec6ff' }}>intro series</span>.
                                </h3>
                                <div style={{ fontSize: '1.08em', color: '#cfcfcf', lineHeight: '1.7', width: '100%' }}>
                                    Our events provide a learning environment for students to hear about the latest AI innovations,
                                    engage with technical details, and connect with industry partners.<br />
                                    <span style={{ display: 'inline-block', margin: '10px 0 5px 0' }}>
                                        Events are typically held <b>bi-weekly on Thursdays, 6:30-7:30pm</b> in the
                                        Great Hall of the ITC (Direct Supply Building), unless otherwise specified.
                                    </span>
                                    <br />
                                    <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUMVNaRkVPUUtNOEsyS1oxMTIwRUpKQkoyNi4u" style={{ fontWeight: 'bold' }}>
                                        📣 If You Wish to Host an Event, Connect With Us Here 📣
                                    </a>
                                    <br />
                                    <span style={{ fontSize: '0.98em', color: '#b0b0b0' }}>
                                        Check individual event details for specific times and locations.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events Section */}
                        <div className="upcoming-events-section" style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <h2>Upcoming Events</h2>
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
                                                        <div className="event-title">
                                                            {getEventIcon(event.type)}
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
                                        <div className="no-events-message" style={{
                                            textAlign: 'center',
                                            color: '#bbb',
                                            fontSize: '1.2em',
                                            padding: '40px 0',
                                            width: '100%'
                                        }}>
                                            No upcoming events right now, come back later!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="liquid-glass" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '10px',
                            border: '0px solid',
                        }}>
                            <div className="event-search-bar" style={{ margin: '0' }}>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '240px',
                                        maxWidth: '90vw',
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: '0px solid #000000',
                                        fontSize: '1.08em',
                                        background: 'rgba(80,80,80,0.50)',
                                        color: '#ffffff',
                                        outline: 'none',
                                        boxShadow: '0 1.5px 8px rgba(80,80,120,0.08)'
                                    }}
                                />
                            </div>
                            
                            {['all', 'workshop', 'speaker', 'competition', 'intro'].map((filter) => (
                                <button
                                    key={filter}
                                    className={`filter-button ${filter} ${activeFilter === filter ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    <i className="material-icons">
                                        {filter === 'all' ? 'apps' : 
                                         filter === 'workshop' ? 'construction' :
                                         filter === 'speaker' ? 'campaign' :
                                         filter === 'competition' ? 'emoji_events' : 'lightbulb'}
                                    </i>
                                    {filter === 'all' ? 'All Events' :
                                     filter === 'workshop' ? 'Workshops' :
                                     filter === 'speaker' ? 'Speaker Events' :
                                     filter === 'competition' ? 'Competitions' : 'Intro Series'}
                                </button>
                            ))}
                            
                            <button
                                className="sort-toggle-button"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                <span className="material-icons" style={{ verticalAlign: 'middle' }}>swap_vert</span>
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
                                                <div className="event-title">
                                                    {getEventIcon(event.type)}
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
                                <div className="no-events-message" style={{
                                    textAlign: 'center',
                                    color: '#bbb',
                                    fontSize: '1.2em',
                                    padding: '40px 0'
                                }}>
                                    Whoops, no matching events found!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && selectedEvent && (
                    <div className="events-modal">
                        <div className="modal-content liquid-glass">
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
                                    borderBottom: '2px solid #444',
                                    paddingBottom: '15px'
                                }}>
                                    <h1 style={{
                                        fontSize: '2.2em',
                                        fontWeight: 'bold',
                                        margin: '0 0 8px 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#fff'
                                    }}>
                                        {getEventIcon(selectedEvent.type)}
                                        {selectedEvent.title}
                                    </h1>
                                    <div style={{
                                        fontSize: '1.1em',
                                        color: '#bbb',
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
        </>
    );
};

export default Events;