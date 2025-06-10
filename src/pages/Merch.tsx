import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getFileContent, getRawFileUrl } from '../hooks/github-hook';
import ReactMarkdown from 'react-markdown';

interface Merch {
    name: string;
    imageUrl: string;
    cost: string;
    description: string;
    purchaseInfo: string;
}

const Merch: React.FC = () => {
    const [merchData, setMerchData] = useState<Merch[]>([]);
    const [merchImageUrls, setMerchImageUrls] = useState<Record<string, string>>({});
    const [backgroundUrl, setBackgroundUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMerchData = async () => {
            try {
                const merchJsonData = await getFileContent('data/merch/merchData.json');

                if (merchJsonData) {
                    const merchItems = JSON.parse(merchJsonData) as Merch[];
                    setMerchData(merchItems);

                    const urls: Record<string, string> = {};
                    for (const item of merchItems) {
                        const url = await getRawFileUrl(item.imageUrl);
                        if (url) {
                            urls[item.imageUrl] = url;
                        }
                    }
                    setMerchImageUrls(urls);

                    const bgUrl = await getRawFileUrl('images/about/NN_background_pattern_2.png');
                    if (bgUrl) {
                        setBackgroundUrl(bgUrl);
                    }
                } else {
                    setError('Failed to fetch merch data.');
                }
            } catch (e) {
                setError('Error parsing page data.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchMerchData();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar page="Merch" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Loading merch page...</h1>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar page="Merch" />
                <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                    <h1>Error</h1>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar page="Merch" />
            <div style={{ paddingLeft: '40px', paddingRight: '40px', marginTop: "5rem" }}>
                <h1>Merch</h1>
                <div>
                    MAIC merchandise is a way for you to show off your dedication to learning about artificial intelligence! All merchandise can be acquired by completing MAIC activities, either through the acquirement of enough points or being awarded the merch when an achievement is reached!
                </div>
                <br />
                <div style={{ paddingBottom: '20px' }}>
                    If you're wondering how to acquire points, please <a href='/points'>refer to this page</a>
                </div>
            </div>
            <div style={{ marginRight: '40px', marginLeft: '40px' }}>
                {merchData.map((item, index) => (
                    <div key={index} id={`Merch-${item.name.replace(/\s+/g, '')}`} style={{ 
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
                            <h1>{item.name}</h1>
                        </div>
                        <div className="break"></div>
                        <div style={{ float: 'left', paddingRight: '20px', marginRight: '10px', marginBottom: '10px', display: 'block' }}>
                            {merchImageUrls[item.imageUrl] && <img src={merchImageUrls[item.imageUrl]} height="170" alt={`${item.name} logo`} />}
                        </div>
                        <div style={{ marginRight: '10px' }}>
                            <p><strong>{item.cost}</strong></p>
                            <ReactMarkdown>{item.description}</ReactMarkdown>
                            {item.purchaseInfo && <p style={{color: 'yellow', fontWeight: 'bold'}}>{item.purchaseInfo}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Merch; 