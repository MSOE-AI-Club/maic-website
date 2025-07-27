import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer/Footer';
import Landing from '../components/home-page/landing/Landing';
import Info from '../components/home-page/info/Info';
import ExploreAIClub from '../components/home-page/explore-ai-club/ExploreAIClub';
import ReadyToJoin from '../components/home-page/ready-to-join/ReadyToJoin';
import './Home.css';

const Home: React.FC = () => {
    return (
        <>
            <Navbar page="Home" />
            <Landing />
            <Info />
            <ExploreAIClub />
            <ReadyToJoin />
            <Footer />
        </>
    );
}

export default Home; 