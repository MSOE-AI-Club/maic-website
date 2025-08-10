import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import MerchGrid from '../components/merch-page/merch-grid/MerchGrid';
import Header from '../components/merch-page/header/Header';
import Footer from '../components/footer/Footer';
import Payment from '../components/merch-page/payment/Payment';

function Merch() {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'MAIC - Merch';
        return () => { document.title = previousTitle; };
    }, []);
    return (
        <>
            <Navbar page="Merch" />
            <Header />
            <MerchGrid />
            <Payment />
            <Footer />
        </>
    );
};

export default Merch; 