import React from "react";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectsIntroProps {
  editorPage?: boolean;
}

const ProjectsIntro: React.FC<ProjectsIntroProps> = ({ editorPage = false }) => (
  <section className={`projects-intro ${editorPage ? "projects-intro-editor" : ""}`}>
    <div>
      <p className="projects-kicker">MSOE AI Club</p>
      <h1>{editorPage ? "Ready to share your work?" : "Projects"}</h1>
      <p>{editorPage ? "Export your project as a ZIP package, then send it to the club for review." : "Explore projects built by the MSOE AI Club and share your own work with the community."}</p>
    </div>
    <Link className="projects-intro-action" to={editorPage ? "/projects" : "/projects/editor"}>
      <FolderOpen size={17} aria-hidden="true" />
      {editorPage ? "Back to projects" : "Open project editor"}
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  </section>
);

export default ProjectsIntro;
