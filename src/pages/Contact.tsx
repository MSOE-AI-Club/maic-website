import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent, getRawFileUrl } from '../hooks/github-hook';

interface EboardMember {
    name: string;
    title: string;
    imageUrl: string;
    role: string;
    bio: string;
    email: string;
}

const Contact: React.FC = () => {
    const [eboardData, setEboardData] = useState<EboardMember[]>([]);
    const [eboardImageUrls, setEboardImageUrls] = useState<Record<string, string>>({});
    const [backgroundUrl, setBackgroundUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                const eboardJsonData = await getFileContent('data/contact/eboard.json');

                if (eboardJsonData) {
                    const members = JSON.parse(eboardJsonData) as EboardMember[];
                    setEboardData(members);

                    const urls: Record<string, string> = {};
                    for (const member of members) {
                        const url = await getRawFileUrl(member.imageUrl);
                        if (url) {
                            urls[member.imageUrl] = url;
                        }
                    }
                    setEboardImageUrls(urls);

                    const bgUrl = await getRawFileUrl('images/about/NN_background_pattern_2.png');
                    if (bgUrl) {
                        setBackgroundUrl(bgUrl);
                    }
                } else {
                    setError('Failed to fetch contact data.');
                }
            } catch (e) {
                setError('Error parsing page data.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar page="Contact" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Loading contact page...</h1>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar page="Contact" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar page="Contact" />
            <div style={{ paddingLeft: '40px', paddingRight: '40px', marginTop: "5rem" }}>
                <h1>Contacting the MAIC Eboard</h1>
                <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUMVNaRkVPUUtNOEsyS1oxMTIwRUpKQkoyNi4u" style={{fontWeight: 'bold'}}>📣 If You Wish to Host an Event, Connect With Us Here 📣</a>
                <p>Below is a list of each eboard member; if you have a specific question, feel free to contact them directly!</p>
                <hr />
                <br />
            </div>
            <div style={{ marginRight: '40px', marginLeft: '40px' }}>
                {eboardData.map((member, index) => (
                    <div key={index} id={`Contact-${member.name}`} style={{ 
                        backgroundImage: `url(${backgroundUrl})`, 
                        backgroundSize: 'cover', 
                        borderRadius: '30px', 
                        border: '3px solid gray', 
                        paddingBottom: '35px', 
                        paddingRight: '5%', 
                        paddingLeft: '5%', 
                        overflow: 'auto', 
                        marginBottom: '20px' 
                    }}>
                        <div>
                            <h1>{member.name} ({member.title})</h1>
                        </div>
                        <div className="break"></div>
                        <div style={{ float: 'left', paddingRight: '20px', marginRight: '10px', marginBottom: '10px', display: 'block' }}>
                            {eboardImageUrls[member.imageUrl] && <img src={eboardImageUrls[member.imageUrl]} height="170" alt={`${member.name} portrait`} />}
                        </div>
                        <div style={{ marginRight: '10px' }}>
                            <h3>{member.role}</h3>
                            <p>{member.bio}</p>
                            <p><b>Contact Me Here:</b> <a href={`mailto:${member.email}`}>{member.email}</a></p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Contact; 