import React from 'react';
import Navbar from '../components/Navbar';

const Achievements: React.FC = () => {
    return (
        <>
            <Navbar page="Achievements" />
            <div style={{ paddingLeft: '50px', paddingRight: '50px', marginTop: "5rem" }}>
                <h1>
                    How Do The MAIC Achievements Work?
                </h1>
                <div>
                    <span style={{ color: 'rgb(var(--hl-2))', fontWeight: 'bold' }}>MAIC achievements are a way for you to show off your status as a student dedicated to learning about AI!</span><br />
                    Your achievements are visible next to your name on the leaderboard as icons -- you can view the purpose of each icon by hovering over them. You can earn these achievements by participating in MAIC activities.<br /><br /> Below is a legend of each achievements icon, along with how you achieve it:
                </div>
                <div style={{ marginTop: '20px', marginRight: '60px', marginLeft: '60px', backgroundColor: 'rgb(58, 58, 58)', borderRadius: '10px', padding: '10px', marginBottom: '20px' }}>
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/current_eboard.png" title="2023 Eboard" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="Current Eboard" />Current Eboard</span>: Be a member of the current 2023 MAIC Eboard<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/old_eboard.png" title="2023 Eboard" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="Previous Eboard" />Previous Eboard</span>: Was previously a member of the MAIC eboard<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/ROSIE2023.png" title="ROSIE 2023" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="ROSIE 2023" />ROSIE 2023</span>: Was a finalist or winner of the 2023 ROSIE Supercomputer Challenge<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/ROSIE2022.png" title="ROSIE 2022" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="ROSIE 2022" />ROSIE 2022</span>: Was a finalist or winner of the 2022 ROSIE Supercomputer Challenge<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/ROSIE_Presenter.png" title="ROSIE Presenter" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="ROSIE Presenter" />ROSIE Presenter</span>: Presented their project in the Atrium for the 2023 ROSIE Supercomputer Challenge<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/2023MICS.png" title="MICS 2023" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="MICS 2023" />MICS 2023</span>: Presented at the 2023 MICS Conference at Iowa University<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/2022MICS.png" title="MICS 2022" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="MICS 2022" />MICS 2022</span>: Presented at the 2022 MICS Conference at MSOE<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/2023Researcher.png" title="2023 AI Researcher" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="2023 AI Researcher" />2023 AI Researcher</span>: Actively pursued AI-research in a MAIC research group throughout the 2023 school year<br />
                    <span style={{ fontWeight: 'bold', marginBottom: '3px', marginTop: '3px' }}><img src="https://maic-fastapi-lambda.s3.amazonaws.com/data/custom_icons/2022Researcher.png" title="2023 AI Researcher" className="custom-emoji" height="25px" width="25px" style={{ marginRight: '5px' }} alt="2022 AI Researcher" />2022 AI Researcher</span>: Actively pursued AI-research in a MAIC research group throughout the 2022 school year<br />
                </div>

                <div style={{ marginBottom: '40px' }}> {/* Corrected 'stlye' to 'style' */}
                    If you're missing achievements for your account, please fill out <a href='https://forms.office.com/Pages/ResponsePage.aspx?id=rM5GQNP9yUasgLfEpJurcGAyFplwhXJCtqB2wsxmGVlUREY4Szc0NUw0TkZTQlNaWFNZODdURFcxQy4u' style={{ fontWeight: 'bold' }}>the following form</a><br /><br />
                </div>
            </div>
        </>
    );
};

export default Achievements;
