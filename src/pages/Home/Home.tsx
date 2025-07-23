import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getFileContent, getRawFileUrl } from '../../hooks/github-hook';
import { Link } from 'react-router-dom';
import './Home.css';
import { startAnimation } from './bg-animation';

interface User {
    User: string;
    'All-Time Points': string;
    'Current Points': string;
    Awards: string;
}

interface Achievement {
    name: string;
    imageUrl: string;
    title: string;
}

interface Card {
    title: string;
    subtitle: string;
    description: string;
    sub_description: string;
    imageUrl: string;
    borderColor: string;
    imageOnLeft: boolean;
}

const Home: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [images, setImages] = useState<{[key: string]: string}>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const [leaderboardCsv, achievementsJson, cardsJson, eboardJson] = await Promise.all([
                    getFileContent('data/points/user_data.csv'),
                    getFileContent('data/achievements/achievementsData.json'),
                    getFileContent('data/home/cards.json'),
                    getFileContent('data/contact/eboard.json')
                ]);

                if (leaderboardCsv && eboardJson) {
                    const eboardData: { name: string }[] = JSON.parse(eboardJson);
                    const eboardNames = new Set(eboardData.map(member => member.name));

                    const lines = leaderboardCsv.split('\n');
                    const headers = lines[0].split(',');
                    const users: User[] = lines.slice(1)
                        .filter(line => line.trim() !== '')
                        .map(line => {
                            const values = line.split(',');
                            const obj = headers.reduce((acc, header, index) => {
                                (acc as any)[header.trim()] = (values[index] || '').trim();
                                return acc;
                            }, {} as User);
                            return obj as User;
                        });

                    users.forEach(user => {
                        if (eboardNames.has(user.User)) {
                            user['All-Time Points'] = 'EBOARD';
                            user['Current Points'] = 'EBOARD';
                        }
                    });

                    users.sort((a, b) => {
                        const isEboardA = a['All-Time Points'] === 'EBOARD';
                        const isEboardB = b['All-Time Points'] === 'EBOARD';

                        if (isEboardA && !isEboardB) {
                            return 1; // A (eboard) goes to the bottom
                        }
                        if (!isEboardA && isEboardB) {
                            return -1; // B (eboard) goes to the bottom
                        }
                        if (isEboardA && isEboardB) {
                            return a.User.localeCompare(b.User); // Sort eboard members alphabetically
                        }
                        
                        const pointsA = parseInt(a['All-Time Points'], 10);
                        const pointsB = parseInt(b['All-Time Points'], 10);

                        if (isNaN(pointsA)) return 1;
                        if (isNaN(pointsB)) return -1;

                        return pointsB - pointsA; // Sort others by points
                    });

                    setLeaderboardData(users);
                } else {
                    if (!leaderboardCsv) setError(prev => prev ? prev + ' Failed to fetch leaderboard data.' : 'Failed to fetch leaderboard data.');
                    if (!eboardJson) setError(prev => prev ? prev + ' Failed to fetch eboard data.' : 'Failed to fetch eboard data.');
                }

                if (achievementsJson) {
                    const achievementData: Achievement[] = JSON.parse(achievementsJson);
                    setAchievements(achievementData);
                } else {
                    setError(prev => prev ? prev + ' Failed to fetch achievements data.' : 'Failed to fetch achievements data.');
                }

                if (cardsJson && achievementsJson) {
                    const cardData: Card[] = JSON.parse(cardsJson);
                    setCards(cardData);
                    const achievementData: Achievement[] = JSON.parse(achievementsJson);

                    const imagePaths = cardData.map(card => card.imageUrl);
                    imagePaths.push('images/home/maic_eboard_25.jpg');
                    imagePaths.push('images/home/logo.png');
                    imagePaths.push('images/about/NN_background_pattern_2.png');
                    const achievementImagePaths = achievementData.map(a => a.imageUrl);
                    const allImagePaths = [...imagePaths, ...achievementImagePaths];
                    
                    const imageUrls = await Promise.all(
                        allImagePaths.map(path => getRawFileUrl(path))
                    );

                    const imageMap = allImagePaths.reduce((acc, path, index) => {
                        if(imageUrls[index]) {
                            acc[path] = imageUrls[index] as string;
                        }
                        return acc;
                    }, {} as {[key: string]: string});
                    setImages(imageMap);
                } else {
                    if (!cardsJson) setError(prev => prev ? prev + ' Failed to fetch cards data.' : 'Failed to fetch cards data.');
                    if (!achievementsJson) setError(prev => prev ? prev + ' Failed to fetch achievements data.' : 'Failed to fetch achievements data.');
                }

            } catch (e) {
                setError('Error fetching or parsing data.');
                console.error(e);
            }
        };

        fetchContent();
    }, []);

    useEffect(() => {
        const cleanup = startAnimation('splash-bg');
        if (cleanup) {
            return cleanup;
        }
    }, []);

    const getTrophy = (index: number) => {
        if (index === 0) return '🏆 ';
        if (index === 1) return '🥈 ';
        if (index === 2) return '🥉 ';
        return '';
    };

    const renderAwards = (userAwards: string) => {
        if (!userAwards || !achievements.length) return null;
        const awardsList = userAwards.split('|').map(a => a.trim()).filter(Boolean);
        const uniqueAwards = [...new Set(awardsList)];

        return uniqueAwards.map(awardName => {
            let achievement = achievements.find(a => a.title === awardName || a.name === awardName);

            if (!achievement) {
                const eboardYearMatch = awardName.match(/^eboard(\d{4})$/);
                if (eboardYearMatch) {
                    achievement = achievements.find(a => a.name === 'Eboard');
                }
            }
            
            if (achievement && images[achievement.imageUrl]) {
                return <img key={awardName} src={images[achievement.imageUrl]} title={achievement.name} className="custom-emoji" height="20px" width="20px" alt={achievement.title} loading="lazy" style={{ marginRight: '4px' }} />;
            }
            return null;
        });
    };
    
    if (error) {
        return (
            <>
                <Navbar page="Home" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar page="Home" />
            
            <div style={{position: 'relative', width: '100%', height: '100vh'}}>
                <canvas id="splash-bg"></canvas>
                <div id="splash-logo">
                    <img className="appear" src={images['images/home/logo.png']} style={{animation: 'AppearFromTop 0.7s ease-out 0s 1'}}/>
                </div>

                <div id="splash-abt">
                    <h1>About Us</h1>
                    <hr/>
                    <p>
                        <b style={{color: 'rgb(var(--hl-2))'}}>MSOE AI Club (MAIC) </b>
                        is built upon a foundation of teaching as many people as possible about the innovative space of artificial intelligence, regardless of their previous experience. We do this through a combination of Speaker Events, Innovation Labs, and Research Groups.
                    </p>
                    <Link to="/about" style={{textDecoration: 'none'}}>
                        💡
                        <span style={{color: '#0099ff', fontWeight: 'bold'}}> Learn More</span>
                    </Link>
                    <br/>
                    <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUMVNaRkVPUUtNOEsyS1oxMTIwRUpKQkoyNi4u" style={{textDecoration: 'none'}}>
                        📣
                        <span style={{color: '#0099ff', fontWeight: 'bold'}}> Speak At An Upcoming Event</span>
                    </a>
                </div>

                <div id="splash-scroll" style={{position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: 'white'}}>
                    <h3>↓ Scroll Down ↓</h3>
                </div>
            </div>

            <div id="below-splash" style={{backgroundColor: "rgb(25, 25, 30)", padding: "2rem", paddingTop: "0"}}>
                <img src="https://maic-fastapi-lambda.s3.amazonaws.com/img/misc/transition.png" className="transition" style={{width: '100%', display: 'block'}}/>
                <div id="below-splash-content" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5rem', paddingTop: "2rem", width: '100%'}}>
                    
                    {images['images/home/maic_eboard_25.jpg'] && (
                        <div style={{maxWidth: '400px', textAlign: 'left'}}>
                            <h1>Meet the Eboard!</h1>
                            <img src={images['images/home/maic_eboard_25.jpg']} style={{width: '100%'}} alt="MAIC Eboard" loading="lazy"/>
                            <p>A passionate team of MSOE university students dedicated to making artificial intelligence knowledge accessible to all. By strengthening our community partnerships each year, and staying on top of current innovations within the field, they create a platform for learning and innovation, inspiring a future driven by AI's transformative potential.</p>
                            <Link to="/contact" style={{color: '#0099ff', fontWeight: 'bold'}}>Contact Us</Link>
                        </div>
                    )}

                    {leaderboardData.length > 0 && (
                        <div style={{marginTop: '20px', marginBottom: '5px', color: 'white', width: '40%'}}>
                            <h1 style={{display: 'inline'}}>Leaderboard</h1>
                            <Link to="/points" style={{fontWeight: 'bold', marginLeft: '10px'}}>What Are Points?</Link>
                            <Link to="/achievements" style={{fontWeight: 'bold', marginLeft: '10px'}}>Where Are My Achievements?</Link>
                            <br/>
                            <div style={{maxHeight: '550px', overflowY: 'auto', marginTop: '10px', border: '1px solid white'}}>
                                <table className="leaderboard-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{textAlign: 'left', background: '#333', position: 'sticky', top: 0, zIndex: 1}}>
                                            <th style={{padding: '8px'}}>User</th>
                                            <th style={{padding: '8px'}}>All-Time</th>
                                            <th style={{padding: '8px'}}>Current</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboardData.map((user, index) => {
                                            const rowStyle: React.CSSProperties = {
                                                background: index % 2 === 0 ? '#121619' : '#19191e',
                                                fontWeight: 'bold',
                                                fontSize: '1em'
                                            };
                                            if (index === 0) {
                                                rowStyle.background = 'gold';
                                                rowStyle.color = 'rgb(103, 88, 4)';
                                            }
                                            if (index === 1) {
                                                rowStyle.background = 'silver';
                                                rowStyle.color = 'rgb(76, 75, 75)';
                                            }
                                            if (index === 2) {
                                                rowStyle.background = '#cd7f32';
                                                rowStyle.color = '#5c340c';
                                            }
                                            return (
                                                <tr key={index} style={rowStyle}>
                                                    <td style={{padding: '4px', paddingLeft: '16px', border: '2px solid #121619'}}>{getTrophy(index)}{user.User} {renderAwards(user.Awards)}</td>
                                                    <td style={{padding: '4px', paddingLeft: '16px', border: '2px solid #121619'}}>{user['All-Time Points']}</td>
                                                    <td style={{padding: '4px', paddingLeft: '16px', border: '2px solid #121619'}}>{user['Current Points']}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
                <div className="break" style={{flexBasis: '100%', height: '0'}}></div>
                {cards.length > 0 && (
                    <div style={{width: '65%', margin: 'auto', paddingTop: "2rem"}}>
                        <h1>Explore MAIC</h1>
                        {cards.map((card, index) => {
                            const cardContent = (
                                <>
                                    <div style={{flex: 1}}>
                                        <a>
                                            <h1 style={{color: '#ffffff', fontWeight: 'bold', marginBottom: '7px'}}>{card.title}</h1>
                                            <p style={{color: card.borderColor, fontWeight: 'bold', marginTop: '5px'}}>{card.subtitle}</p>
                                        </a>
                                        <p dangerouslySetInnerHTML={{ __html: card.description }} />
                                        <br/>
                                        <p dangerouslySetInnerHTML={{ __html: card.sub_description }} />
                                    </div>
                                </>
                            );

                            const imageContent = (
                                <img 
                                    src={images[card.imageUrl]} 
                                    style={{
                                        width: '30%', 
                                        aspectRatio: '1 / 1', 
                                        objectFit: 'cover', 
                                        marginLeft: card.imageOnLeft ? '0' : '3%', 
                                        marginRight: card.imageOnLeft ? '3%' : '0px', 
                                        borderRadius: '15px', 
                                        border: `2px solid ${card.borderColor}`
                                    }} 
                                    alt={card.title}
                                    loading="lazy"
                                />
                            );

                            return (
                                <div key={index} style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: '20px', 
                                    backgroundImage: 'url(' + images['images/about/NN_background_pattern_2.png'] + ')',
                                    backgroundSize: 'cover', 
                                    borderRadius: '30px', 
                                    border: `3px solid ${card.borderColor}`, 
                                    padding: '10px',
                                    color: 'white'
                                }}>
                                    {card.imageOnLeft ? [imageContent, cardContent] : [cardContent, imageContent]}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home; 