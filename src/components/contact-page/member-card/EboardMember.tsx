import React, { useEffect, useState } from "react";
import "./EboardMember.css";
import { FaEnvelope } from "react-icons/fa";
import { getFileContent, getRawFileUrl } from "../../../hooks/github-hook";

interface EboardMemberInfo {
  name: string;
  title: string;
  imageUrl: string;
  role: string;
  bio: string;
  email: string;
}

function EboardMember() {
  const [members, setMembers] = useState<EboardMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    getFileContent("data/contact/eboard.json")
      .then((raw) => {
        if (!raw) {
          setError(true);
          return;
        }
        const parsed: EboardMemberInfo[] = JSON.parse(raw);
        setMembers(parsed);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <>
      <div className="eboard-intro">
        <h1>Meet the E-Board</h1>
      </div>
      <div className="line"></div>
      {loading && <p className="eboard-status">Loading members...</p>}
      {error && (
        <p className="eboard-status">Failed to load e-board members.</p>
      )}
      <div className="eboard-members-container">
        {members.map((member) => (
          <div className="eboard-member-card" key={member.email}>
            <div className="eboard-member-image-wrapper">
              <img
                className="eboard-member-image"
                src={getRawFileUrl(member.imageUrl)}
                alt={`${member.name} picture`}
              />
            </div>
            <div className="eboard-member-info">
              <div className="eboard-member-name">{member.name}</div>
              <div className="eboard-member-title">{member.title}</div>
              <div className="eboard-member-subtitle">{member.role}</div>
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
