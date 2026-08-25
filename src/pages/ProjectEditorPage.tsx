import React, { useEffect } from "react";
import ProjectEditor from "../components/projects/ProjectEditor";
import BackToProjects from "../components/projects/BackToProjects";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import ProjectsIntro from "../components/projects/ProjectsIntro";
import "./Projects.css";

const ProjectEditorPage: React.FC = () => {
  useEffect(() => {
    document.title = "MAIC - Project Editor";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <NavBar page="Projects" />
      <main className="projects-page-wrap projects-editor-page">
        <BackToProjects />
        <ProjectEditor />
        <ProjectsIntro editorPage />
      </main>
      <Footer />
    </div>
  );
};

export default ProjectEditorPage;
