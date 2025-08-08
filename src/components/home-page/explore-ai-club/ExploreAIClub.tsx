import React from "react";
import "./ExploreAIClub.css";
import { getRawFileUrl } from "../../../hooks/github-hook";

const events = [
  {
    img: getRawFileUrl("images/home/speaker_events.png"),
    title: "Speaker Events",
    subtitle: 'Learning About the "WHY" of AI',
    description: `MAIC regularly hosts speaker sessions featuring industry professionals and thought leaders who share insights into cutting-edge AI technologies and their real-world applications. These events build community, keep members up to date with the latest trends, and emphasize the value of a tech-forward education.<br><br>Join us bi-weekly from 6:30–7:30 PM for valuable industry insights — and yes, there’s free food!`,
  },
  {
    img: getRawFileUrl("images/home/innovation_labs.png"),
    title: "Innovation Labs",
    subtitle: "Getting Hands-on With Industry",
    description: `The Innovation Lab gives members a hands-on opportunity to work with real companies on real challenges. These 2-month, hackathon-style projects emphasize practical AI applications and include direct mentorship, large cash prizes, and feedback from industry sponsors.<br><br>Teams meet for one hour of collaboration and one hour of development each week. It’s the perfect way to grow your portfolio, gain industry experience, and work alongside mentors. <a href="${getRawFileUrl(
      "images/home/Innovation_Labs_Proposal.pdf"
    )}" target="_blank" rel="noopener noreferrer">Learn more about our Innovation Lab overview.</a>`,
  },
  {
    img: getRawFileUrl("images/home/research_groups.png"),
    title: "Research Groups",
    subtitle: "Publishing Novel AI Applications",
    description: `MAIC Research Groups are collaborative, mentor-guided teams focused on advanced AI topics — often resulting in publishable research. Over six months, students gain deep expertise, develop solutions with real-world relevance, and even earn academic credit.<br><br>Teams meet weekly to build research papers often presented at conferences. Want to make an impact? <a href="/library">Explore our past research projects.</a>`,
  },
  {
    img: getRawFileUrl("images/home/learning_tree.png"),
    title: "Learning Tree",
    subtitle: "Your Pathway Through AI",
    description: `The Learning Tree is MAIC’s structured roadmap for self-paced learning in AI — from beginner topics to advanced areas like computer vision and natural language processing. Curated by our team and often used by project mentors, it’s your go-to guide for mastering AI.<br><br>Whether you're just starting or expanding your skills, the Learning Tree helps you take control of your learning journey. <a href="/learning-tree">Jump into the Learning Tree.</a>`,
  },
];

function ExploreAIClub() {
  return (
    <div className="explore-ai-club-section">
      <div className="explore-intro">
        <h1 className="explore-title">Explore AI Club</h1>
        <div className="line" />
      </div>
      <div className="explore-item-container">
        {events.map((item, index) => (
          <div
            key={index}
            className={`explore-item ${
              index % 2 === 1 ? "explore-item-reverse" : ""
            }`}
          >
            <div className="item-image-section">
              <img
                src={item.img}
                alt={item.title}
                className="explore-item-image"
              />
            </div>
            <div className="item-content-section">
              <h2 className="item-title">{item.title}</h2>
              <h3 className="item-subtitle">{item.subtitle}</h3>
              <p
                className="item-description"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreAIClub;
