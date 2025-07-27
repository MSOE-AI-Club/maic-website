import "./MerchGrid.css";


const merchItems = [
    {
        name: "Researcher Hoodie",
        imageUrl: "https://via.placeholder.com/150",
        cost: "",
        description: "Introducing the MAIC Researcher Hoodie – the quintessential cloak for those who dance with data and tango with tensors!\n\nStep into the realm of wearable experimentation, where pockets are perfect for stashing extra code snippets and hoods serve as cocoons of contemplation. With this hoodie, you're not just embracing warmth; you're enveloping yourself in the very essence of innovation. Whether you're decoding the cryptic language of machine learning or simply seeking enlightenment through lines of Python, the MAIC Researcher Hoodie is the attire that turns heads and sparks \"aha\" moments in equal measure. It's not just clothing; it's the dress code for decoding the future.",
        purchaseInfo: "Participate in AI Research"
    },
    {
        name: "MAIC T-Shirt",
        imageUrl: "https://via.placeholder.com/150",
        cost: "10 Points",
        description: "Introducing the AI Club T-Shirt – the cotton canvas that turns your torso into a tech-savvy masterpiece! This isn't just a shirt; it's a byte-sized billboard broadcasting your passion for all things AI.\n\nWhether you're relaxing with regression analysis or mingling with deep learning, the AI Club T-Shirt is your statement piece.",
        purchaseInfo: "Ask an Eboard Member"
    },  
    {
        name: "MAIC Brain",
        imageUrl: "https://via.placeholder.com/150",
        cost: "1 point",
        description: "Introducing the MAIC-Squeezer: Your brain's new best friend! This squishy plastic blue brain stress toy proudly rocks the MAIC logo, and boy, does it know how to de-stress with style! Give it a ~~gentle~~ squeeze, and you'll unleash the genius within 💙",
        purchaseInfo: "Ask an Eboard Member"
    },
    {
        name: "MAIC Polo",
        imageUrl: "https://via.placeholder.com/150",
        cost: "25 Points or Attend MICS",
        description: "Introducing the MAIC Polo – where business meets a digital flair! This isn't just fashion; it's intellectual elegance. Whether you're engaging in a heated debate about neural network architectures or on a coding break, the MAIC Polo is attire for boardrooms and server rooms alike.",
        purchaseInfo: "Ask an Eboard Member"
    },
    {
        name: "MAIC Hoodie",
        imageUrl: "https://via.placeholder.com/150",
        cost: "35 Points",
        description: "Introducing the MAIC Hoodie – a cosmic collision of code and comfort! Imagine wrapping yourself in the enigmatic embrace of deep space, where the constellations are constellations of code and the stars are binary bits. Whether you're pondering perplexing problems or simply plotting your next coding escapade, our MAIC Hoodie is the attire that turns heads and sparks discussions in all dimensions – both artificial and natural!",
        purchaseInfo: "Ask an Eboard Member"
    },
    {
        name: "MAIC Quarter Zip",
        imageUrl: "https://via.placeholder.com/150",
        cost: "40 Points",
        description: "Introducing the MAIC Quarter Zip Sweatshirt – the digital drapery that zips up your zest for code, one pixel at a time! This isn't your run-of-the-mill sweatshirt; it's a byte-sized burst of brilliance that's all about keeping you cozy while you compute.\n\nImagine wrapping yourself in a cocoon of computational charm, where every zip is a reminder that life is but a series of ones and zeros waiting to be embraced. It's like wearing a hug from a robot with impeccable fashion sense – snug, stylish, and algorithmically aligned.\n\nWhether you're debugging dilemmas or dreaming up neural networks, the MAIC Quarter Zip Sweatshirt is your trusty companion. It's not just a sweatshirt; it's a symphony of style for the AI aficionado, a wearable wink to the future you're helping shape, one line of code at a time.",
        purchaseInfo: "Ask an Eboard Member"
    },
]



function MerchGrid() {
    return (
        <div className="merch-grid">
            <div className="merch-grid-item">
                {merchItems.map((item) => (
                    <div className="merch-grid-item-container">
                        <img src={item.imageUrl} alt={item.name} />
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MerchGrid;