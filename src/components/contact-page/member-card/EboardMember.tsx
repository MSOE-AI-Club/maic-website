import React, { useState } from "react";
import "./EboardMember.css";
import { FaEnvelope } from "react-icons/fa";
import Brett from "../../../assets/contact/brett_s.png";
import AdamHaile from "../../../assets/contact/Adam Haile Portrait.png";
import TygePlater from "../../../assets/contact/Tyge Plater Portrait.jpg";
import MazenHamid from "../../../assets/contact/Mazen Hamid Portrait.jpg";
import AdamSwedlund from "../../../assets/contact/AdamS.png";
import MadisonEngebose from "../../../assets/contact/Madison Engebose Portrait.jpg";
import TravisJankowski from "../../../assets/contact/Travis Jankowski Portrait.png";
import LeighGoetsch from "../../../assets/contact/Leigh_Goetsch.png";
import ReaganBurkemper from "../../../assets/contact/Reagan Burkemper Portrait.jpg";
import AndrewNeedham from "../../../assets/contact/Andrew Needham Portrait.jpg";
import DrRiley from "../../../assets/contact/Dr Riley.png";

interface EboardMemberInfo {
  name: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  email: string;
}

const members: EboardMemberInfo[] = [
  {
    name: "Brett Storoe",
    title: "President",
    subtitle: "Overall Management of Events & Wider-Community Outreach",
    imageSrc: Brett,
    email: "storoeb@msoe.edu",
  },
  {
    name: "Adam Haile",
    title: "Vice President",
    subtitle: "Internal Organizational Maintenance & Lead Workshop Developer",
    imageSrc: AdamHaile,
    email: "hailea@msoe.edu",
  },
  {
    name: "Tyge Plater",
    title: "Head of Research",
    subtitle: "Lead Researcher & Research Coordinator",
    imageSrc: TygePlater,
    email: "platert@msoe.edu",
  },
  {
    name: "Mazen Hamid",
    title: "Treasurer",
    subtitle: "Campus-Life Relations & Finances",
    imageSrc: MazenHamid,
    email: "hamidm@msoe.edu",
  },
  {
    name: "Adam Swedlund",
    title: "Campus Outreach",
    subtitle: "Campus-Community Outreach & Marketing",
    imageSrc: AdamSwedlund,
    email: "swedlunda@msoe.edu",
  },
  {
    name: "Madison Engebose",
    title: "K 12 Outreach",
    subtitle: "Head of K-12 Communications",
    imageSrc: MadisonEngebose,
    email: "engebosem@msoe.edu",
  },
  {
    name: "Travis Jankowski",
    title: "Web Master",
    subtitle: "Lead Website Developer & Maintainer",
    imageSrc: TravisJankowski,
    email: "jankowskit@msoe.edu",
  },
  {
    name: "Leigh Goetsch",
    title: "Technical Strategist",
    subtitle: "Workshop Developer Strategist",
    imageSrc: LeighGoetsch,
    email: "goetschm@msoe.edu",
  },
  {
    name: "Reagan Burkemper",
    title: "Technical Strategist",
    subtitle: "Workshop Developer Strategist",
    imageSrc: ReaganBurkemper,
    email: "burkemperr@msoe.edu",
  },
  {
    name: "Andrew Needham",
    title: "Technical Strategist",
    subtitle: "Workshop Developer Strategist",
    imageSrc: AndrewNeedham,
    email: "needhama@msoe.edu",
  },
  {
    name: "Dr. Riley",
    title: "Faculty Advisor",
    subtitle:
      "Expert in Machine/Deep Learning, AI, Simulation, and High-Performance Computing.",
    imageSrc: DrRiley,
    email: "riley@msoe.edu",
  },
];

function EboardMember() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  return (
    <>
      <div className="eboard-intro">
        <h1>Meet the E-Board</h1>
      </div>
      <div className="line"></div>
      <div className="eboard-members-container">
        {members.map((member) => (
          <div className="eboard-member-card" key={member.email}>
            <div className="eboard-member-image-wrapper">
              <img
                className="eboard-member-image"
                src={member.imageSrc}
                alt={`${member.name} picture`}
              />
            </div>
            <div className="eboard-member-info">
              <div className="eboard-member-name">{member.name}</div>
              <div className="eboard-member-title">{member.title}</div>
              <div className="eboard-member-subtitle">{member.subtitle}</div>
              <div className="eboard-member-email-row">
                <span className="eboard-member-email-icon" aria-hidden="true">
                  <FaEnvelope />
                </span>
                <button
                  className={`eboard-member-email ${
                    copiedEmail === member.email ? "copied" : ""
                  }`}
                  onClick={() => handleCopy(member.email)}
                  type="button"
                >
                  {copiedEmail === member.email ? "Copied!" : member.email}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default EboardMember;
