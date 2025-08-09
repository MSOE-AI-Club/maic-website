import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getSubsectionModals } from "../../hooks/library-helper";
import { Skeleton } from "@mui/material";
import SpotlightCard from "../react-bits/spotlight-card/SpotlightCard";

interface ResearchModalLike {
  title: string;
  description?: string;
  img?: string;
  date?: string;
  authors?: string;
  content_ids: any[]; // list of articles for the project
  progress?: number;
  status?: string;
  featured?: boolean;
  tags?: string[];
  team?: string[];
  repoUrl?: string;
  paperUrl?: string;
  membersCount?: number;
  publicationsCount?: number;
}

const ResearchProjects = () => {
  const [projects, setProjects] = useState<ResearchModalLike[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getSubsectionModals("Research");
      const cleaned = (data || []).filter(Boolean) as ResearchModalLike[];
      setProjects(cleaned);

      // Derive available years from project dates
      const yearKey = (d?: string): string => {
        if (!d) return "Unknown";
        const m = d.match(/\d{4}\s*-\s*\d{4}/);
        if (m) return m[0].replace(/\s+/g, "");
        const y = d.match(/\d{4}/);
        return y ? y[0] : "Unknown";
      };
      const unique = Array.from(new Set(cleaned.map((p) => yearKey(p.date))));
      // Sort by starting year desc when in range form
      unique.sort((a, b) => {
        const aStart = parseInt((a.split("-")[0] || "0"), 10);
        const bStart = parseInt((b.split("-")[0] || "0"), 10);

        if (isNaN(aStart) && isNaN(bStart)) return 0;
        if (isNaN(aStart)) return 1;
        if (isNaN(bStart)) return -1;
        return bStart - aStart;
      });
      setYears(["All", ...unique]);
      setLoading(false);
    })();
  }, []);

  const yearFiltered = selectedYear === "All"
    ? projects
    : projects.filter((p) => {
        const key = (p.date || "").replace(/\s+/g, "");
        return key.includes(selectedYear.replace(/\s+/g, ""));
      });

  const filtered = yearFiltered.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const hay = [
      p.title,
      p.description,
      p.authors,
      (p.tags || []).join(" ")
    ].join(" \n ").toLowerCase();
    return hay.includes(q);
  });

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), pageCount);
  const start = (safePage - 1) * pageSize;
  const pageProjects = filtered.slice(start, start + pageSize);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div className="research-list">
      <h1 style={{ marginTop: 0, marginBottom: "0.25rem" }}>All Research Projects</h1>
      {loading && (
        <>
          <div className="filter-row">
            <Skeleton variant="rectangular" height={34} />
            <Skeleton variant="rectangular" height={40} />
          </div>
          <div className="research-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <SpotlightCard key={i} className="research-spotlight" style={{ padding: 0 }}>
                <div className="research-card">
                  <div className="card-top">
                    <Skeleton variant="rectangular" width={160} height={120} />
                    <div className="left" style={{ width: '100%' }}>
                      <Skeleton width="20%" height={18} />
                      <Skeleton width="70%" height={28} />
                      <Skeleton width="100%" height={16} />
                      <Skeleton width="95%" height={16} />
                      <Skeleton width="60%" height={16} />
                      <Skeleton width="40%" height={16} />
                    </div>
                  </div>
                  <div className="card-footer">
                    <Skeleton variant="rectangular" width={80} height={30} />
                    <Skeleton variant="rectangular" width={80} height={30} />
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </>
      )}
      <div className="filter-row">
        <div className="year-filter">
          {years.map((y) => (
            <button
              key={y}
              className={`year-chip ${selectedYear === y ? "active" : ""}`}
              onClick={() => setSelectedYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="research-grid">
        {pageProjects.length === 0 && (
          <div className="empty-state">No research projects found</div>
        )}
        {pageProjects.map((p) => {
          const slug = p.title.toLowerCase().replace(/\s+/g, "-");
          const publications = p.content_ids?.length || 0;
          const derivedMembers =
            typeof p.membersCount === 'number' && p.membersCount > 0
              ? p.membersCount
              : (Array.isArray(p.team) && p.team.length > 0
                  ? p.team.length
                  : (p.authors
                      ? p.authors.split(',').map((n) => n.trim()).filter((n) => n.length > 0).length
                      : 0));
          const memberNames: string[] = Array.isArray(p.team) && p.team.length > 0
            ? p.team
            : (p.authors ? p.authors.split(',').map((n) => n.trim()).filter(Boolean) : []);
          const visibleMembers = memberNames.slice(0, 4);
          const extraMembers = Math.max(0, memberNames.length - visibleMembers.length);
          const getInitials = (name: string) => {
            const parts = name.split(/\s+/).filter(Boolean);
            const first = parts[0]?.[0] || '';
            const last = parts[parts.length - 1]?.[0] || '';
            return (first + last).toUpperCase();
          };
          return (
            <SpotlightCard key={slug} className="research-spotlight" style={{ padding: 0 }}>
              <div className="research-card">
                <div className="card-top">
                {p.img && (
                  <img className="thumb" src={p.img} alt={p.title} loading="lazy" />
                )}
                <div className="left">
                  <div className="badges">
                    {(() => {
                      // Determine if this project is in the current active season (Sept 1 - May 31)
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = now.getMonth() + 1; // 1..12
                      const inSeason = month >= 9 || month <= 5; // Sep-Dec or Jan-May
                      // Extract start year from range or single year
                      let projectStartYear = 0;
                      if (typeof p.date === "string") {
                        const mRange = p.date.match(/(\d{4})\s*-\s*(\d{4})/);
                        if (mRange) {
                          projectStartYear = parseInt(mRange[1], 10);
                        } else {
                          const mYear = p.date.match(/(\d{4})/);
                          if (mYear) projectStartYear = parseInt(mYear[1], 10);
                        }
                      }
                      // Current school year's start year depends on month
                      const currentStartYear = month >= 9 ? year : year - 1;
                      const isActive = inSeason && projectStartYear === currentStartYear;
                      const status = p.status || (isActive ? "Active" : undefined);
                      return status ? <span className="badge pill">{status}</span> : null;
                    })()}
                    {p.featured && <span className="badge pill blue">Featured</span>}
                  </div>
                  <h3 className="card-title">{p.title}</h3>
                  <div
                    className="card-desc"
                    dangerouslySetInnerHTML={{ __html: p.description || "" }}
                  />
                  <div className="skills">
                    {p.tags?.slice(0,4).map((t) => (
                      <span key={t} className="skill-pill">{t}</span>
                    ))}
                  </div>
                  <div className="stats-row">
                    <span>👥 {derivedMembers} members</span>
                    <span>📅 {p.date}</span>
                    <span>📄 {p.publicationsCount ?? publications} publications</span>
                  </div>
                  <div className="team-row">
                    <span className="team-label">Team:</span>
                    <div className="avatars">
                      {visibleMembers.map((n) => (
                        <span key={n} className="avatar" title={n}>{getInitials(n)}</span>
                      ))}
                      {extraMembers > 0 && (
                        <span className="avatar overflow" title={memberNames.join(', ')}>
                          +{extraMembers}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                {p.repoUrl && (
                  <a className="ext-btn" href={p.repoUrl} target="_blank" rel="noreferrer">
                    <GitHubIcon sx={{ fontSize: 18 }} />
                    Code
                  </a>
                )}
                {p.paperUrl && (
                  <a className="ext-btn" href={p.paperUrl} target="_blank" rel="noreferrer">
                    <OpenInNewIcon sx={{ fontSize: 18 }} />
                    Paper
                  </a>
                )}
              </div>
            </div>
            </SpotlightCard>
          );
        })}
      </div>
      {pageCount > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === safePage ? "active" : ""}`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={safePage === pageCount}
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ResearchProjects;


