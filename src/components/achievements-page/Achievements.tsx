import React from "react";
import "./Achievements.css";
import { FaTrophy, FaGraduationCap, FaUsers, FaFlask } from "react-icons/fa";
import CurrentEboard from "../../assets/icons/current_eboard.png";
import OldEboard from "../../assets/icons/old_eboard.png";
import ROSIE2023 from "../../assets/icons/ROSIE2023.png";
import ROSIE2022 from "../../assets/icons/ROSIE2022.png";
import ROSIE2024 from "../../assets/icons/ROSIE2024.png";
import ROSIEPresenter from "../../assets/icons/ROSIE_Presenter.png";
import MICS2023 from "../../assets/icons/2023MICS.png";
import MICS2022 from "../../assets/icons/2022MICS.png";
import MICS2024 from "../../assets/icons/2024MICS.png";
import Researcher2023 from "../../assets/icons/2023Researcher.png";
import Researcher2022 from "../../assets/icons/2022Researcher.png";
import Researcher2024 from "../../assets/icons/2024Researcher.png";
import Researcher2025 from "../../assets/icons/2025Researcher.png";
import Hacksgiving from "../../assets/icons/hacksgiving.png";
import MICSIcon from "../../assets/icons/MICS Icon.png";
import ROSIELogo2025 from "../../assets/icons/ROSIE_Logo_2025.png";
import NVIDIALogo from "../../assets/icons/NVIDIA_Logo.jpg";

const listOfAchievements = [
    {
        icon: <img src={CurrentEboard} alt="Current Eboard" className="achievement-img-icon" />,
        title: "Current Eboard",
        description: "Be a member of the current 2025 MAIC Eboard"
    },
    {
        icon: <img src={OldEboard} alt="Previous Eboard" className="achievement-img-icon" />,
        title: "Previous Eboard", 
        description: "Was previously a member of the MAIC eboard"
    },
    {
        icon: <img src={ROSIELogo2025} alt="ROSIE 2025" className="achievement-img-icon" />,
        title: "ROSIE 2025",
        description: "Was a finalist or winner of the 2025 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={ROSIE2024} alt="ROSIE 2024" className="achievement-img-icon" />,
        title: "ROSIE 2024",
        description: "Was a finalist or winner of the 2024 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={ROSIE2023} alt="ROSIE 2023" className="achievement-img-icon" />,
        title: "ROSIE 2023",
        description: "Was a finalist or winner of the 2023 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={ROSIE2022} alt="ROSIE 2022" className="achievement-img-icon" />,
        title: "ROSIE 2022",
        description: "Was a finalist or winner of the 2022 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={ROSIEPresenter} alt="ROSIE Presenter" className="achievement-img-icon" />,
        title: "ROSIE Presenter",
        description: "Presented their project in the Atrium for the 2023 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={MICSIcon} alt="MICS 2025" className="achievement-img-icon" />,
        title: "MICS 2025",
        description: "Presented at the 2025 MICS Conference at Augsburg University"
    },
    {
        icon: <img src={MICS2024} alt="MICS 2024" className="achievement-img-icon" />,
        title: "MICS 2024",
        description: "Presented at the 2024 MICS Conference at Augsburg University"
    },
    {
        icon: <img src={MICS2023} alt="MICS 2023" className="achievement-img-icon" />,
        title: "MICS 2023",
        description: "Presented at the 2023 MICS Conference at Iowa University"
    },
    {
        icon: <img src={MICS2022} alt="MICS 2022" className="achievement-img-icon" />,
        title: "MICS 2022", 
        description: "Presented at the 2022 MICS Conference at MSOE"
    },
    {
        icon: <img src={Researcher2025} alt="2025 AI Researcher" className="achievement-img-icon" />,
        title: "2025 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2025 school year"
    },
    {
        icon: <img src={Researcher2024} alt="2024 AI Researcher" className="achievement-img-icon" />,
        title: "2024 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2024 school year"
    },
    {
        icon: <img src={Researcher2023} alt="2023 AI Researcher" className="achievement-img-icon" />,
        title: "2023 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2023 school year"
    },
    {
        icon: <img src={Researcher2022} alt="2022 AI Researcher" className="achievement-img-icon" />,
        title: "2022 AI Researcher", 
        description: "Actively pursued AI-research in a MAIC research group throughout the 2022 school year"
    },
    {
        icon: <img src={Hacksgiving} alt="Hacksgiving Participant" className="achievement-img-icon" />,
        title: "Hacksgiving Participant",
        description: "Participated in the Hacksgiving Hackathon"
    },
    {
        icon: <img src={NVIDIALogo} alt="NVIDIA DLI Certified" className="achievement-img-icon" />,
        title: "NVIDIA DLI Certified",
        description: "Completed the NVIDIA Deep Learning Institute (DLI) course on AI and Machine Learning"
    },
];

function Achievements() {
    return (
        <>
            <div className="achievements-intro">
                <h1>How Do The MAIC Achievements Work?</h1>
                <p className="achievements-intro-description">
                    Earn achievements by participating in MAIC activities like workshops, events, and research. Your badges will appear next to your name on the leaderboard, showing others what you've accomplished.

                </p>
            </div>
            
            <div className="line"></div>
            
            <div className="achievements-container">
                {listOfAchievements.map((achievement, index) => (
                    <div className="achievement-card" key={index}>
                        <div className="achievement-icon">
                            {achievement.icon}
                        </div>
                        <div className="achievement-content">
                            <h3 className="achievement-title">{achievement.title}</h3>
                            <p className="achievement-description">{achievement.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="achievements-footer">
                <p className="achievements-footer-text">Missing achievements for your account?</p>
                <button className="achievements-form-btn">
                    Fill Out Achievement Form
                </button>
            </div>
        </>
    );
}

export default Achievements;