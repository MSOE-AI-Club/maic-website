import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { getFileContent, getRawFileUrl } from "../hooks/github-hook";
import { getProjectMembers, getProjectTags, type ProjectDocument } from "../components/projects/ProjectPreview";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectsIntro from "../components/projects/ProjectsIntro";
import "./Projects.css";

interface ProjectListFile {
  projects: string[];
  featured?: string[];
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

function resolveProjectAsset(projectId: string, src: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(src) || src.startsWith("/")) {
    return src;
  }

  const normalized = src.replace(/^\.\//, "");
  return getRawFileUrl(`projects/${projectId}/${normalized}`);
}

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [featuredProjectIds, setFeaturedProjectIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
      setFeaturedProjectIds(Array.isArray(parsedIndex.featured) ? parsedIndex.featured : []);
      setIsLoading(false);
    };

    void loadProjects();

    return () => {
      canceled = true;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = projects
      .map(({ document }) => document?.type.trim())
      .filter((type): type is string => Boolean(type));
    return ["all", ...Array.from(new Set(categories))];
  }, [projects]);
  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return projects.filter(({ id, document }) => {
      if (categoryFilter !== "all" && document?.type !== categoryFilter) return false;
      if (!search) return true;

      const searchableText = [
        id,
        document?.title,
        document?.description,
        document?.type,
        document?.content,
        ...getProjectMembers(document?.members ?? ""),
        ...getProjectTags(document?.tags ?? [])
      ].join(" ").toLowerCase();
      return searchableText.includes(search);
    }).sort((a, b) => {
      const dateA = a.document?.date ? Date.parse(a.document.date) : Number.NEGATIVE_INFINITY;
      const dateB = b.document?.date ? Date.parse(b.document.date) : Number.NEGATIVE_INFINITY;
      return (Number.isNaN(dateB) ? Number.NEGATIVE_INFINITY : dateB) - (Number.isNaN(dateA) ? Number.NEGATIVE_INFINITY : dateA);
    });
  }, [categoryFilter, projects, searchTerm]);

  const renderProjectCards = (items: ProjectListItem[]) => (
    <div className="projects-tile-grid">
      {items.map((project) => (
        <ProjectCard key={project.id} id={project.id} document={project.document} featured={featuredProjectIds.includes(project.id)} onOpen={(id) => navigate(`/projects/view/${id}`)} resolveImageSrc={resolveProjectAsset} />
      ))}
    </div>
  );

  return (
    <div>
      <NavBar page="Projects" />
      <main className="projects-page-wrap">
        <ProjectsIntro />

        <section className="projects-grid-panel">
            <h2 className="projects-section-title">Project Gallery</h2>
            <div className="projects-filters" role="search" aria-label="Search and filter projects">
              <label className="projects-search-field">
                <span>Search projects</span>
                <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Title, tag, author, or description" />
              </label>
              <label className="projects-category-field">
                <span>Category</span>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  {categoryOptions.map((category) => <option key={category} value={category}>{category === "all" ? "All categories" : category}</option>)}
                </select>
              </label>
            </div>
            {isLoading && <p className="projects-message">Loading projects...</p>}
            {!isLoading && error && <p className="projects-message projects-error">{error}</p>}
            {!isLoading && !error && projects.length === 0 && (
              <p className="projects-message">No projects found in projects/projects.json.</p>
            )}

            {!isLoading && !error && projects.length > 0 && filteredProjects.length === 0 && (
              <p className="projects-message">No projects match your search or category filter.</p>
            )}

            {!isLoading && !error && filteredProjects.length > 0 && (
              <section aria-labelledby="all-projects-title">
                <div className="projects-subsection-heading">
                  <h3 id="all-projects-title">All projects</h3>
                  <span>{filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"}, newest first</span>
                </div>
                {renderProjectCards(filteredProjects)}
              </section>
            )}
        </section>

        <section className="projects-submit-panel" aria-labelledby="submit-project-title">
          <div>
            <p className="projects-kicker">Share your work</p>
            <h2 id="submit-project-title">Submit a project</h2>
            <p>Use the editor to package your project. Only ZIP files exported from the editor will be accepted.</p>
          </div>
          <div className="projects-submit-details">
            <span>Upload the exported ZIP file when you submit. Other file types will not be accepted.</span>
            <Link className="projects-page-btn" to="/projects/editor">Open editor</Link>
            <a
              className="projects-page-btn projects-submit-btn"
              href="mailto:eboard%20-%20MSOE%20AI%20%3C36e830d8.msoe365.onmicrosoft.com%40amer.teams.ms%3E?subject=MAIC%20project%20submission&body=Project%20name%3A%20%0A%0AProject%20summary%3A%20%0A%0AAnything%20else%20the%20reviewers%20should%20know%3A%20"
            >
              Email a submission
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Projects;
