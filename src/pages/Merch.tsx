import Navbar from '../components/Navbar';
import MerchGrid from '../components/merch-page/merch-grid/MerchGrid';
import Header from '../components/merch-page/header/Header';
import Footer from '../components/footer/Footer';
import Payment from '../components/merch-page/payment/Payment';

function Merch() {
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