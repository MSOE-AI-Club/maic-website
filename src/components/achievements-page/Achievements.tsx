import React from "react";
import "./Achievements.css";
import { FaTrophy, FaGraduationCap, FaUsers, FaFlask } from "react-icons/fa";
import { getRawFileUrl } from "../../hooks/github-hook";

const listOfAchievements = [
    {
        icon: <img src={getRawFileUrl('images/achievements/current_eboard.png')} alt="Current Eboard" className="achievement-img-icon" />,
        title: "Current Eboard",
        description: "Be a member of the current 2025 MAIC Eboard"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/old_eboard.png')} alt="Previous Eboard" className="achievement-img-icon" />,
        title: "Previous Eboard", 
        description: "Was previously a member of the MAIC eboard"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/ROSIE2025.png')} alt="ROSIE 2025" className="achievement-img-icon" />,
        title: "ROSIE 2025",
        description: "Was a finalist or winner of the 2025 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/ROSIE2024.png')} alt="ROSIE 2024" className="achievement-img-icon" />,
        title: "ROSIE 2024",
        description: "Was a finalist or winner of the 2024 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/ROSIE2023.png')} alt="ROSIE 2023" className="achievement-img-icon" />,
        title: "ROSIE 2023",
        description: "Was a finalist or winner of the 2023 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/ROSIE2022.png')} alt="ROSIE 2022" className="achievement-img-icon" />,
        title: "ROSIE 2022",
        description: "Was a finalist or winner of the 2022 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/ROSIE_Presenter.png')} alt="ROSIE Presenter" className="achievement-img-icon" />,
        title: "ROSIE Presenter",
        description: "Presented their project in the Atrium for the 2023 ROSIE Supercomputer Challenge"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/MICS Icon.png')} alt="MICS 2025" className="achievement-img-icon" />,
        title: "MICS 2025",
        description: "Presented at the 2025 MICS Conference at Augsburg University"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2024MICS.png')} alt="MICS 2024" className="achievement-img-icon" />,
        title: "MICS 2024",
        description: "Presented at the 2024 MICS Conference at Augsburg University"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2023MICS.png')} alt="MICS 2023" className="achievement-img-icon" />,
        title: "MICS 2023",
        description: "Presented at the 2023 MICS Conference at Iowa University"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2022MICS.png')} alt="MICS 2022" className="achievement-img-icon" />,
        title: "MICS 2022", 
        description: "Presented at the 2022 MICS Conference at MSOE"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2025Researcher.png')} alt="2025 AI Researcher" className="achievement-img-icon" />,
        title: "2025 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2025 school year"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2024Researcher.png')} alt="2024 AI Researcher" className="achievement-img-icon" />,
        title: "2024 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2024 school year"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2023Researcher.png')} alt="2023 AI Researcher" className="achievement-img-icon" />,
        title: "2023 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2023 school year"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/2022Researcher.png')} alt="2022 AI Researcher" className="achievement-img-icon" />,
        title: "2022 AI Researcher", 
        description: "Actively pursued AI-research in a MAIC research group throughout the 2022 school year"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/hacksgiving.png')} alt="Hacksgiving Participant" className="achievement-img-icon" />,
        title: "Hacksgiving Participant",
        description: "Participated in the Hacksgiving Hackathon"
    },
    {
        icon: <img src={getRawFileUrl('images/achievements/NVIDIA_DLI.jpg')} alt="NVIDIA DLI Certified" className="achievement-img-icon" />,
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