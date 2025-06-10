import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent, getRawFileUrl } from '../hooks/github-hook';
import ReactMarkdown from 'react-markdown';

interface Partner {
    name: string;
    logoUrl: string;
    description: string;
    websiteUrl: string;
}

const About: React.FC = () => {
    const [partnersData, setPartnersData] = useState<Partner[]>([]);
    const [partnerImageUrls, setPartnerImageUrls] = useState<Record<string, string>>({});
    const [backgroundUrl, setBackgroundUrl] = useState<string>('');
    const [faqContent, setFaqContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const partnersJsonData = await getFileContent('data/about/partnersData.json');
                const faqMarkdownData = await getFileContent('data/about/faq.md');

                if (partnersJsonData) {
                    const partners = JSON.parse(partnersJsonData) as Partner[];
                    setPartnersData(partners);

                    const urls: Record<string, string> = {};
                    for (const partner of partners) {
                        const url = await getRawFileUrl(partner.logoUrl);
                        if (url) {
                            urls[partner.logoUrl] = url;
                        }
                    }
                    setPartnerImageUrls(urls);

                    const bgUrl = await getRawFileUrl('images/about/NN_background_pattern_2.png');
                    if (bgUrl) {
                        setBackgroundUrl(bgUrl);
                    }
                } else {
                    setError('Failed to fetch about data.');
                }

                if (faqMarkdownData) {
                    setFaqContent(faqMarkdownData);
                } else {
                    setError((prevError) => prevError ? `${prevError} and failed to fetch FAQ data.` : 'Failed to fetch FAQ data.');
                }
            } catch (e) {
                setError('Error parsing page data.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar page="About" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Loading about page...</h1>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar page="About" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar page="About" />
            <div style={{ paddingLeft: '40px', paddingRight: '40px', marginTop: "5rem" }}>
                <h1>Official Description</h1>
                <p>MSOE AI-Club (MAIC) is built upon a foundation of teaching as many students as possible about the innovative space of artificial intelligence,
                    regardless of their previous experience within the space. We do this through a combination of workshops, speaker events, and research groups.
                </p>
                <p>For workshops, we create AI/ML projects that we walk the club through that provide understanding about certain AI/ML topics.
                    We also provide challenge problems to enable club members to explore these topics deeper in their own time.</p>
                <p>For speaker events, we bring in guests ranging from professors at MSOE to employees from local Wisconsin companies who work in Data Science, Machine Learning,
                    Artificial Intelligence, or some related topic to AI. These talks can provide an idea of what is currently being done in industry and how you can get from being
                    a student at MSOE to working at one of their companies.</p>
                <p>
                    For research groups, we facilitate the time and professional resources for MAIC members to explore AI topics further with their peers,
                    forming a team of students from any background with a mentor who has experience in Artificial Intelligence research. By the end of the project,
                    teams will have gained knowledge about researching current topics, creating effective experiments, and compiling results into a published research paper.
                </p>
                <br />
                <br />
                <h1>Frequently Asked Questions (FAQ)</h1>
                <ReactMarkdown>{faqContent}</ReactMarkdown>
                <br />
                <br />
                <h1>Driven By Industry</h1>
                <p>MAIC is driven by industry, meaning we want to provide students with the skills and knowledge that they need to be successful in industry...</p>
                <p>To accomplish this goal, MAIC hopes to frequently communicate with many industry partners, including local companies,
                    to understand what skills they are looking for in their employees. We also hope to bring in speakers from these companies to talk about what they do.
                    Below is a list of previous industry partners that we have worked with:</p>
            </div>
            <div style={{ marginRight: '40px', marginLeft: '40px' }}>
                {partnersData.map((partner, index) => (
                    <div key={index} id={`About-${partner.name}`} style={{ 
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
                            <h1>{partner.name}</h1>
                        </div>
                        <div className="break"></div>
                        <div style={{ float: 'left', paddingRight: '20px', marginRight: '10px', marginBottom: '10px', display: 'block' }}>
                            {partnerImageUrls[partner.logoUrl] && <img src={partnerImageUrls[partner.logoUrl]} height="170" alt={`${partner.name} logo`} />}
                        </div>
                        <div style={{ marginRight: '10px' }}>
                            <p>{partner.description}</p>
                            <p><strong>Visit Them:</strong> <a href={partner.websiteUrl}>{partner.name} Official Website</a></p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default About; 