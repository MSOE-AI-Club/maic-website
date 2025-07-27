import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import MerchGrid from '../components/merch-page/merch-grid/MerchGrid';
import Header from '../components/merch-page/header/Header';
import Footer from '../components/footer/Footer';

function Merch() {
    return (
        <>
            <Navbar page="Merch" />
            <Header />
            <MerchGrid />
            <Footer />
        </>
    );
};

export default Merch; 