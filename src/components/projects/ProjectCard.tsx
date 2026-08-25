import React from "react";
import SpotlightCard from "../react-bits/spotlight-card/SpotlightCard";
import type { ProjectDocument } from "./ProjectPreview";

interface ProjectCardProps {
  id: string;
  document: ProjectDocument | null;
  featured?: boolean;
  onOpen?: (id: string) => void;
  resolveImageSrc: (projectId: string, src: string) => string;
  className?: string;
  showMissingMetadata?: boolean;
}

function getThumbnailPath(document: ProjectDocument): string | null {
  if (!document.thumbnail) return null;
  if (typeof document.thumbnail === "string") return document.thumbnail;
  if (document.thumbnail.path) return document.thumbnail.path;
  return document.thumbnail.filename ? `images/${document.thumbnail.filename}` : null;
}

function getMemberNames(members: ProjectDocument["members"]): string[] {
  return Array.isArray(members) ? members : members.split(",").map((member) => member.trim()).filter(Boolean);
}

const ProjectCard: React.FC<ProjectCardProps> = ({ id, document, featured = false, onOpen, resolveImageSrc, className = "", showMissingMetadata = true }) => {
  const title = document?.title?.trim() || "Untitled Project";
  const description = document?.description?.trim() || "No description available.";
  const thumbnailPath = document ? getThumbnailPath(document) : null;
  const thumbnailSrc = thumbnailPath ? resolveImageSrc(id, thumbnailPath) : null;
  const members = document ? getMemberNames(document.members) : [];
  const canOpen = Boolean(document && onOpen);

  return (
    <SpotlightCard
      className={`projects-tile ${className} ${canOpen ? "is-clickable" : "is-disabled"} ${featured ? "is-featured" : ""}`}
      onClick={canOpen ? () => onOpen?.(id) : undefined}
    >
      {thumbnailSrc ? (
        <img className="projects-tile-image" src={thumbnailSrc} alt={`${title} thumbnail`} />
      ) : (
        <div className="projects-tile-image projects-tile-image-placeholder">No image</div>
      )}
      <div className="projects-tile-body">
        <div className="projects-tile-heading">
          <div className="projects-tile-title">{title}</div>
        </div>
        <div className="projects-tile-description">{description}</div>
        {document && (
          <div className="projects-tile-meta">
            <span>{document.type || "Project"}</span>
            <span aria-hidden="true">·</span>
            <span>{members.length || "No"} {members.length === 1 ? "member" : "members"}</span>
            {document.date && <><span aria-hidden="true">·</span><span>{document.date}</span></>}
          </div>
        )}
        {!canOpen && showMissingMetadata && <div className="projects-tile-note">Missing metadata.json for this entry.</div>}
      </div>
    </SpotlightCard>
  );
};

export default ProjectCard;
