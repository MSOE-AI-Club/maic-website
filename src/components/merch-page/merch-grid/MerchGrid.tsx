import { useState } from 'react';
import "./MerchGrid.css";
import DummyImage from "../../../assets/merch/tshirt.png"

interface MerchItem {
    name: string;
    images: string[];
    cost: string;
    description: string;
    purchaseInfo: string;
}

const merchItems: MerchItem[] = [
    {
        name: "Researcher Hoodie",
        images: [DummyImage, DummyImage, DummyImage, DummyImage],
        cost: "Research Participation",
        description: "The MAIC Researcher Hoodie is your go-to uniform for experimentation. Designed for deep thinkers and tensor tamers alike, it blends cozy comfort with computational charisma. Whether you're testing models or reflecting on philosophy, this hoodie says you mean innovation.",
        purchaseInfo: "Participate in AI Research"
    },
    {
        name: "MAIC T-Shirt",
        images: [DummyImage, DummyImage, DummyImage],
        cost: "10 Points",
        description: "The MAIC T-Shirt is your casual badge of AI brilliance. Soft, stylish, and packed with personality, it's ideal for team meetings, workshops, or just lounging with a laptop. Show your club pride and code in comfort—this shirt does both.",
        purchaseInfo: "Ask an Eboard Member"
    },  
    {
        name: "MAIC Brain",
        images: [DummyImage, DummyImage],
        cost: "1 point",
        description: "Meet the MAIC Brain: a squeezable stress-relief sidekick for late-night coding marathons. Shaped like a brain and decked in blue, it's more than a toy—it’s a symbol of mental power and club pride, ready to squish your worries away.",
        purchaseInfo: "Ask an Eboard Member"
    },
    {
        name: "MAIC Polo",
        images: [DummyImage, DummyImage, DummyImage, DummyImage],
        cost: "25 Points or Attend MICS",
        description: "The MAIC Polo delivers professionalism with a punch of AI sophistication. Perfect for conferences, presentations, or casual flexing in class, it balances smart design with serious style. It's a clean look for sharp minds.",
        purchaseInfo: "Ask an Eboard Member"
    },
    {
        name: "MAIC Hoodie",
        images: [DummyImage, DummyImage, DummyImage, DummyImage],
        cost: "35 Points",
        description: "The MAIC Hoodie wraps you in a warm layer of machine learning mystique. With subtle tech vibes and standout comfort, it’s your wearable reminder that you live and breathe code—on campus or in the cosmos.",
        purchaseInfo: "Ask an Eboard Member"
    },
    {
        name: "MAIC Quarter Zip",
        images: [DummyImage, DummyImage, DummyImage, DummyImage],
        cost: "40 Points",
        description: "This MAIC Quarter Zip is sleek, smart, and engineered for coder comfort. Whether you're hacking through homework or hosting a workshop, it keeps your flow state stylish. It’s the default layer for default greatness.",
        purchaseInfo: "Ask an Eboard Member"
    },
]

function MerchGrid() {
    const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleOpen = (item: MerchItem) => {
        setSelectedItem(item);
        setCurrentImageIndex(0);
    };

    const handleClose = () => {
        setSelectedItem(null);
        setCurrentImageIndex(0);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handlePrevImage = () => {
        if (selectedItem && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (selectedItem && currentImageIndex < selectedItem.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentImageIndex(index);
    };
    
    return (
        <>
            <div className="merch-grid">
                <div className="merch-grid-item">
                    {merchItems.map((item, index) => (
                        <div 
                            key={index} 
                            className="merch-grid-item-container"
                            onClick={() => handleOpen(item)}
                        >
                            <img className="merch-item-image" src={item.images[0]} alt={item.name} />
                            <div className="merch-item-info">
                                <h3 className="merch-item-name">{item.name}</h3>
                                <p className="merch-item-cost">{item.cost}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <div className="merch-modal-overlay" onClick={handleOverlayClick}>
                    <div className="merch-modal">
                        <button className="merch-modal-close" onClick={handleClose}>
                            ×
                        </button>
                        <div className="merch-modal-content">
                            <div className="merch-modal-left">
                                <div className="merch-modal-image-container">
                                    {selectedItem.images.length > 1 && (
                                        <button 
                                            className="image-nav-button prev"
                                            onClick={handlePrevImage}
                                            disabled={currentImageIndex === 0}
                                        >
                                            &#8249;
                                        </button>
                                    )}
                                    <img 
                                        className="merch-modal-image" 
                                        src={selectedItem.images[currentImageIndex]} 
                                        alt={`${selectedItem.name} - View ${currentImageIndex + 1}`}
                                    />
                                    {selectedItem.images.length > 1 && (
                                        <button 
                                            className="image-nav-button next"
                                            onClick={handleNextImage}
                                            disabled={currentImageIndex === selectedItem.images.length - 1}
                                        >
                                            &#8250;
                                        </button>
                                    )}
                                </div>
                                {selectedItem.images.length > 1 && (
                                    <div className="image-thumbnails">
                                        {selectedItem.images.map((image, index) => (
                                            <img
                                                key={index}
                                                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                                src={image}
                                                alt={`${selectedItem.name} thumbnail ${index + 1}`}
                                                onClick={() => handleThumbnailClick(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="merch-modal-right">
                                <h2 className="merch-modal-title">{selectedItem.name}</h2>
                                <div className="merch-modal-description">
                                    {selectedItem.description.split('\n').map((paragraph: string, index: number) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                    <div className="merch-modal-cost-container">
                                        <p className="merch-modal-cost">{selectedItem.cost}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MerchGrid;