import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackToProjects: React.FC = () => (
  <Link className="projects-back-button" to="/projects">
    <ArrowLeft size={16} aria-hidden="true" />
    Back to Projects
  </Link>
);

export default BackToProjects;
