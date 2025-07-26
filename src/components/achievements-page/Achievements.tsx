import React from "react";
import "./Achievements.css";
import { FaTrophy, FaGraduationCap, FaUsers, FaFlask } from "react-icons/fa";

const listOfAchievements = [
    {
        icon: <FaTrophy />,
        title: "Current Eboard",
        description: "Be a member of the current 2025 MAIC Eboard",
        color: "#D4AF37"
    },
    {
        icon: <FaGraduationCap />,
        title: "Previous Eboard", 
        description: "Was previously a member of the MAIC eboard",
        color: "#8B7355"
    },
    {
        icon: <FaTrophy />,
        title: "ROSIE 2025",
        description: "Was a finalist or winner of the 2025 ROSIE Supercomputer Challenge",
        color: "#FF69B4"
    },
    {
        icon: <FaTrophy />,
        title: "ROSIE 2024",
        description: "Was a finalist or winner of the 2024 ROSIE Supercomputer Challenge",
        color: "#FF69B4"
    },
    {
        icon: <FaTrophy />,
        title: "ROSIE 2023",
        description: "Was a finalist or winner of the 2023 ROSIE Supercomputer Challenge",
        color: "#FF69B4"
    },
    {
        icon: <FaTrophy />,
        title: "ROSIE 2022",
        description: "Was a finalist or winner of the 2022 ROSIE Supercomputer Challenge", 
        color: "#FF1493"
    },
    {
        icon: <FaUsers />,
        title: "ROSIE Presenter",
        description: "Presented their project in the Atrium for the 2023 ROSIE Supercomputer Challenge",
        color: "#4169E1"
    },
    {
        icon: <FaGraduationCap />,
        title: "MICS 2025",
        description: "Presented at the 2025 MICS Conference at Augsburg University",
        color: "#32CD32"
    },
    {
        icon: <FaGraduationCap />,
        title: "MICS 2024",
        description: "Presented at the 2024 MICS Conference at Augsburg University",
        color: "#32CD32"
    },
    {
        icon: <FaGraduationCap />,
        title: "MICS 2023",
        description: "Presented at the 2023 MICS Conference at Iowa University",
        color: "#32CD32"
    },
    {
        icon: <FaGraduationCap />,
        title: "MICS 2023",
        description: "Presented at the 2023 MICS Conference at Iowa University",
        color: "#32CD32"
    },
    {
        icon: <FaGraduationCap />,
        title: "MICS 2022", 
        description: "Presented at the 2022 MICS Conference at MSOE",
        color: "#32CD32"
    },
    {
        icon: <FaFlask />,
        title: "2025 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2025 school year",
        color: "#00CED1"
    },
    {
        icon: <FaFlask />,
        title: "2024 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2024 school year",
        color: "#FFD700"
    },
    {
        icon: <FaFlask />,
        title: "2023 AI Researcher",
        description: "Actively pursued AI-research in a MAIC research group throughout the 2023 school year",
        color: "#9370DB"
    },
    {
        icon: <FaFlask />,
        title: "2022 AI Researcher", 
        description: "Actively pursued AI-research in a MAIC research group throughout the 2022 school year",
        color: "#FF4500"
    }
];

function Achievements() {
    return (
        <>
            <div className="achievements-intro">
                <h1>How Do The MAIC Achievements Work?</h1>
                <p className="achievements-description">
                    <span className="highlight">
                        MAIC achievements are a way for you to show off your status as a student dedicated to learning about AI!
                        <br/><br/>
                        Your achievements are visible next to your name on the leaderboard as icons — you can view the purpose of each icon by hovering over them. You can earn these achievements by participating in MAIC activities.
                    </span>
                    <br/><br/>
                    Below is a legend of each achievements icon, along with how you achieve it:
                </p>
            </div>
            
            <div className="line"></div>
            
            <div className="achievements-container">
                {listOfAchievements.map((achievement, index) => (
                    <div className="achievement-card" key={index}>
                        <div className="achievement-icon" style={{color: achievement.color}}>
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
                <p>If you're missing achievements for your account, please fill out <a href="#" className="form-link">the following form</a></p>
            </div>
        </>
    );
}

export default Achievements;