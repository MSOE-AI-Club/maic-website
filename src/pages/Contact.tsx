import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import EboardMember from '../components/contact-page/member-card/EboardMember';
import Event from '../components/contact-page/event/Event';
import Footer from '../components/footer/Footer';

function Contact() {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'MAIC - Contact';
        return () => { document.title = previousTitle; };
    }, []);
    return (
        <>
            <Navbar page="Contact" />
            <EboardMember />
            <Event />
            <Footer />
        </>

    );
}

export default Contact;



