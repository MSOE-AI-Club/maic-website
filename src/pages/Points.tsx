import Navbar from '../components/Navbar';
import PointsSystem from '../components/points-page/Points';
import Footer from '../components/footer/Footer';

function Points() {
    return (
        <>
            <Navbar page="Points" />
            <PointsSystem />
            <Footer />
        </>
    );
};

export default Points; 