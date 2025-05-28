import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent } from '../hooks/github-hook';

interface Achievement {
  imageUrl: string;
  title: string;
  altText: string;
  name: string;
  description: string;
}

const Achievements: React.FC = () => {
    const [achievementsData, setAchievementsData] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const jsonData = await getFileContent('data/achievements/achievementsData.json');
                if (jsonData) {
                    setAchievementsData(JSON.parse(jsonData));
                } else {
                    setError('Failed to fetch achievements data.');
                }
            } catch (e) {
                setError('Error parsing achievements data.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar page="Achievements" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Loading achievements...</h1>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar page="Achievements" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar page="Achievements" />
            <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                <h1>
                    How Do The MAIC Achievements Work?
                </h1>
                <div>
                    <span style={{ color: 'rgb(var(--hl-2))', fontWeight: 'bold' }}>MAIC achievements are a way for you to show off your status as a student dedicated to learning about AI!</span><br />
                    Your achievements are visible next to your name on the leaderboard as icons -- you can view the purpose of each icon by hovering over them. You can earn these achievements by participating in MAIC activities.<br /><br /> Below is a legend of each achievements icon, along with how you achieve it:
                </div>
                <div style={{ marginTop: '20px', marginRight: '60px', marginLeft: '60px', backgroundColor: 'rgb(58, 58, 58)', borderRadius: '10px', padding: '10px', marginBottom: '20px' }}>
                    {achievementsData.map((achievement, index) => (
                        <React.Fragment key={index}>
                            <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}>
                                <img src={achievement.imageUrl} title={achievement.title} className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt={achievement.altText} />
                                {achievement.name}
                            </span>: {achievement.description}<br />
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ marginBottom: '40px' }}> {/* Corrected 'stlye' to 'style' */}
                    If you're missing achievements for your account, please fill out <a href='https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUREY4Szc0NUw0TkZTQlNaWFNZODdURFcxQy4u' style={{ fontWeight: 'bold' }}>the following form</a><br /><br />
                </div>
            </div>
        </>
    );
};

export default Achievements;
