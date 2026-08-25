import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import ProjectPreview, { type ProjectDocument } from "../components/projects/ProjectPreview";
import BackToProjects from "../components/projects/BackToProjects";
import { getFileContent, getRawFileUrl } from "../hooks/github-hook";
import "./Projects.css";

function resolveProjectAsset(projectId: string, src: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(src) || src.startsWith("/")) return src;
  return getRawFileUrl(`projects/${projectId}/${src.replace(/^\.\//, "")}`);
}

const ProjectView: React.FC = () => {
  const { projectId = "" } = useParams();
  const [project, setProject] = useState<ProjectDocument | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "MAIC - Project";
    window.scrollTo(0, 0);
    setProject(null);
    setError("");
    let canceled = false;

    const loadProject = async () => {
      const raw = await getFileContent(`projects/${projectId}/metadata.json`);
      if (!raw) {
        if (!canceled) setError("This project could not be found.");
        return;
      }
      try {
        const parsed = JSON.parse(raw) as ProjectDocument;
        if (!canceled) setProject(parsed);
      } catch {
        if (!canceled) setError("This project's metadata is not valid JSON.");
      }
    };

    void loadProject();
    return () => { canceled = true; };
  }, [projectId]);

  return (
    <div>
      <NavBar page="Projects" />
      <main className="projects-page-wrap projects-view-page">
        <BackToProjects />
        {error && <p className="projects-message projects-error">{error}</p>}
        {!error && !project && <p className="projects-message">Loading project...</p>}
        {project && <ProjectPreview project={project} resolveImageSrc={(src) => resolveProjectAsset(projectId, src)} />}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectView;
