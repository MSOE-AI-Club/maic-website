import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent } from '../hooks/github-hook';

interface Point {
  points: string;
  description: string;
}

const Points: React.FC = () => {
    const [pointsData, setPointsData] = useState<Point[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const jsonData = await getFileContent('data/points/pointsData.json');
                if (jsonData) {
                    setPointsData(JSON.parse(jsonData));
                } else {
                    setError('Failed to fetch points data.');
                }
            } catch (e) {
                setError('Error parsing points data.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar page="Points" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Loading points system...</h1>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar page="Points" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar page="Points" />
            <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                <h1>
                    How Do The MAIC Points Work?
                </h1>
                <div>
                    <span style={{ color: 'rgb(var(--hl-2))', fontWeight: 'bold' }}>Earn points by completing MAIC activities and use them to purchase some of our merch!</span><br />
                    To keep track of your points, you can reference the leaderboard on the landing page of this website. These points are gained through a variety of MAIC activities, with some providing you more points than others:
                </div>
                <div style={{ marginTop: '20px', marginRight: '60px', marginLeft: '60px', backgroundColor: 'rgb(58, 58, 58)', borderRadius: '10px', padding: '10px', marginBottom: '20px' }}>
                    {pointsData.map((point, index) => (
                        <div key={index} style={{ marginBottom: '5px' }}>
                            <span style={{ color: 'yellow', fontWeight: 'bold', marginLeft: '20px' }}>
                                ⭐ {point.points}
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: ` ${point.description}` }} />
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '40px' }}>
                    You can spend these points in our <a href='/merch' style={{ fontWeight: 'bold' }}>Merch Shop!</a> Just tell <a href='/contact' style={{ fontWeight: 'bold' }}>one of the eboard members</a> what you want to buy and they will deduct the points from your account. You can also use these points to buy a ticket to the end-of-semester raffle, where we will be giving out awards to a few lucky winners!<br /><br />
                </div>
            </div>
        </>
    );
};

export default Points; 