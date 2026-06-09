import React, { useEffect, useMemo, useState } from "react";
import ProjectEditor from "../components/projects/ProjectEditor";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { getFileContent, getRawFileUrl } from "../hooks/github-hook";
import ProjectPreview, { type ProjectDocument } from "../components/projects/ProjectPreview";
import SpotlightCard from "../components/react-bits/spotlight-card/SpotlightCard";
import "./Projects.css";

interface ProjectListFile {
  projects: string[];
}

interface ProjectListItem {
  id: string;
  document: ProjectDocument | null;
}

function normalizeProjectDocument(raw: unknown): ProjectDocument | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<ProjectDocument>;

  return {
    title: candidate.title ?? "",
    members: candidate.members ?? "",
    description: candidate.description ?? "",
    date: candidate.date ?? "",
    tags: candidate.tags ?? [],
    type: candidate.type ?? "Project",
    content: candidate.content ?? "",
    images: candidate.images ?? [],
    thumbnail: candidate.thumbnail ?? null,
  };
}

function getThumbnailPath(document: ProjectDocument | null): string | null {
  if (!document?.thumbnail) {
    return null;
  }

  if (typeof document.thumbnail === "string") {
    return document.thumbnail;
  }

  if (document.thumbnail.path) {
    return document.thumbnail.path;
  }

  if (document.thumbnail.filename) {
    return `images/${document.thumbnail.filename}`;
  }

  return null;
}

function resolveProjectAsset(projectId: string, src: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(src) || src.startsWith("/")) {
    return src;
  }

  const normalized = src.replace(/^\.\//, "");
  return getRawFileUrl(`projects/${projectId}/${normalized}`);
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showEditor, setShowEditor] = useState<boolean>(false);

  useEffect(() => {
    document.title = "MAIC - Projects";
  }, []);

  useEffect(() => {
    let canceled = false;

    const loadProjects = async () => {
      setIsLoading(true);
      setError("");

      const indexRaw = await getFileContent("projects/projects.json");

      if (!indexRaw) {
        if (!canceled) {
          setError("Could not load projects/projects.json from the content repository.");
          setIsLoading(false);
        }
        return;
      }

      let parsedIndex: ProjectListFile;
      try {
        parsedIndex = JSON.parse(indexRaw) as ProjectListFile;
      } catch {
        if (!canceled) {
          setError("projects/projects.json is not valid JSON.");
          setIsLoading(false);
        }
        return;
      }

      if (!Array.isArray(parsedIndex.projects)) {
        if (!canceled) {
          setError("projects/projects.json must contain a projects array.");
          setIsLoading(false);
        }
        return;
      }

      const loaded = await Promise.all(
        parsedIndex.projects.map(async (projectId): Promise<ProjectListItem> => {
          const metadataRaw = await getFileContent(`projects/${projectId}/metadata.json`);
          if (!metadataRaw) {
            return { id: projectId, document: null };
          }

          try {
            const parsed = JSON.parse(metadataRaw);
            return { id: projectId, document: normalizeProjectDocument(parsed) };
          } catch {
            return { id: projectId, document: null };
          }
        })
      );

      if (canceled) {
        return;
      }

      setProjects(loaded);
      setIsLoading(false);
    };

    void loadProjects();

    return () => {
      canceled = true;
    };
  }, []);

  const activeProject = useMemo(() => {
    if (!activeProjectId) {
      return null;
    }

    return projects.find((project) => project.id === activeProjectId) ?? null;
  }, [projects, activeProjectId]);

  return (
    <div>
      <NavBar page="Projects" />
      <main className="projects-page-wrap">
        <section className="projects-page-toolbar">
          <h1 className="projects-page-title">Projects</h1>
          <button className="projects-page-btn" onClick={() => setShowEditor((current) => !current)}>
            {showEditor ? "Close Editor" : "Open Editor"}
          </button>
        </section>

        {!showEditor && (
          <section className="projects-grid-panel">
            <h2 className="projects-section-title">Project Gallery</h2>
            {isLoading && <p className="projects-message">Loading projects...</p>}
            {!isLoading && error && <p className="projects-message projects-error">{error}</p>}
            {!isLoading && !error && projects.length === 0 && (
              <p className="projects-message">No projects found in projects/projects.json.</p>
            )}

            {!isLoading && !error && projects.length > 0 && (
              <div className="projects-tile-grid">
                {projects.map((project) => {
                  const thumbnailPath = getThumbnailPath(project.document);
                  const thumbnailSrc = thumbnailPath ? resolveProjectAsset(project.id, thumbnailPath) : null;
                  const title = project.document?.title?.trim() || "Untitled Project";
                  const description = project.document?.description?.trim() || "No description available.";
                  const canOpen = Boolean(project.document);

                  return (
                    <SpotlightCard
                      key={project.id}
                      className={`projects-tile ${canOpen ? "is-clickable" : "is-disabled"}`}
                      onClick={canOpen ? () => setActiveProjectId(project.id) : undefined}
                    >
                      {thumbnailSrc ? (
                        <img className="projects-tile-image" src={thumbnailSrc} alt={`${title} thumbnail`} />
                      ) : (
                        <div className="projects-tile-image projects-tile-image-placeholder">No image</div>
                      )}
                      <div className="projects-tile-body">
                        <div className="projects-tile-title">{title}</div>
                        <div className="projects-tile-description">{description}</div>
                        {!canOpen && <div className="projects-tile-note">Missing metadata.json for this entry.</div>}
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeProject?.document && (
          <div className="projects-modal-overlay" onClick={() => setActiveProjectId(null)}>
            <div className="projects-modal" onClick={(e) => e.stopPropagation()}>
              <div className="projects-modal-header">
                <h2 className="projects-modal-title">{activeProject.document.title || "Project Preview"}</h2>
                <button className="projects-page-btn" onClick={() => setActiveProjectId(null)}>
                  Close
                </button>
              </div>
              <div className="projects-modal-content">
                <ProjectPreview
                  project={activeProject.document}
                  resolveImageSrc={(src) => resolveProjectAsset(activeProject.id, src)}
                />
              </div>
            </div>
          </div>
        )}

        {showEditor && (
          <section className="projects-editor-panel">
            <h2 className="projects-section-title">Project Editor</h2>
            <ProjectEditor embedded />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
