import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import { getDirectoryContents, getFileContent, getRawFileUrl } from "../../hooks/github-hook";

interface WorkshopMeta {
  title: string;
  summary?: string;
  image?: string;
  img?: string; // legacy
  date?: string;
  authors?: string;
  type?: string;
  url?: string; // for marimo/link
  difficulty?: string;
  categories?: string | string[];
  participants?: number; // optional future field
  chapters?: number; // optional future field
  duration?: string | number; // minutes or human label
}

interface WorkshopItem {
  id: string; // markdown id without extension
  path: string; // path to markdown file (manifest-style)
  meta: WorkshopMeta;
}

function normalizeCategories(raw: WorkshopMeta["categories"]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return String(raw)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getWorkshopStorageKey(id: string, key: string) {
  return `workshop:${id}:${key}`;
}

function formatCategory(label: string): string {
  const text = String(label || "").trim();
  if (text.length === 0) return text;
  const firstChar = text.charAt(0);
  const isFirstUpper = /[A-Z]/.test(firstChar);
  if (isFirstUpper) return text;
  const rest = text.slice(1);
  // If there is any uppercase in the rest, treat as acronym-like and uppercase all
  if (/[A-Z]/.test(rest)) return text.toUpperCase();
  // Otherwise, title-case: upper first, lower rest
  return firstChar.toUpperCase() + rest.toLowerCase();
}

const Workshops = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WorkshopItem[]>([]);
  const [page, setPage] = useState(1);
  const [localStateVersion, setLocalStateVersion] = useState(0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // List workshop folders
        const top = await getDirectoryContents("workshops");
        const folders = (top || []).filter((i) => i.type === "dir");
        const allMd: { id: string; path: string }[] = [];
        for (const f of folders) {
          const folderContents = await getDirectoryContents(f.path);
          const md = (folderContents || []).find((it) => it.type === "file" && /\.md$/i.test(it.name));
          if (!md) continue;
          const id = md.name.replace(/\.md$/i, "");
          allMd.push({ id, path: md.path });
        }

        const loaded: WorkshopItem[] = [];
        for (const file of allMd) {
          // read metadata.json in same dir
          const dir = file.path.substring(0, file.path.lastIndexOf("/"));
          const metaContent = await getFileContent(`${dir}/metadata.json`);
          let meta: WorkshopMeta = { title: file.id };
          if (metaContent) {
            try {
              meta = JSON.parse(metaContent);
            } catch {
              // ignore malformed metadata
            }
          }
          loaded.push({ id: file.id, path: file.path, meta });
        }

        // Sort by date desc if available
        loaded.sort((a, b) => {
          const ad = Date.parse(String(a.meta.date || ""));
          const bd = Date.parse(String(b.meta.date || ""));
          if (isNaN(ad) && isNaN(bd)) return a.meta.title.localeCompare(b.meta.title);
          if (isNaN(ad)) return 1;
          if (isNaN(bd)) return -1;
          return bd - ad;
        });

        setItems(loaded);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Reset to first page whenever the total item count changes
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const total = items.length;
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((w) => {
      const title = (w.meta.title || w.id || "").toLowerCase();
      const summary = (w.meta.summary || "").toLowerCase();
      const authors = (w.meta.authors || "").toLowerCase();
      const difficulty = (w.meta.difficulty || "").toLowerCase();
      const cats = normalizeCategories(w.meta.categories).join(" ").toLowerCase();
      return (
        title.includes(q) ||
        summary.includes(q) ||
        authors.includes(q) ||
        difficulty.includes(q) ||
        cats.includes(q)
      );
    });
  }, [items, query]);
  const completedCount = useMemo(
    () => items.filter((w) => localStorage.getItem(getWorkshopStorageKey(w.id, "completed")) === "true").length,
    [items, localStateVersion]
  );
  // Removed unused stats (participants and average completion) to match simplified header

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = useMemo(() => filteredItems.slice(start, start + pageSize), [filteredItems, start, pageSize]);

  // Scroll to top when page changes (consistent with articles/research)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [safePage]);

  function goTo(w: WorkshopItem) {
    navigate(`/library?nav=Workshops&article=${encodeURIComponent(w.id)}`);
    // Mark as started
    localStorage.setItem(getWorkshopStorageKey(w.id, "started"), new Date().toISOString());
    setLocalStateVersion((v) => v + 1);
  }

  return (
    <div className="workshops">
      <div className="workshops-stats">
        <div className="ws-stat">
          <div className="ws-stat-number">{loading ? <Skeleton width={20} /> : total}</div>
          <div className="ws-stat-label">Total Workshops</div>
        </div>
        <div className="ws-stat">
          <div className="ws-stat-number">{loading ? <Skeleton width={20} /> : completedCount}</div>
          <div className="ws-stat-label">Completed</div>
        </div>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search workshops..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(1); }}
      />
      <div className="workshops-list">
        {loading && (
          <div className="workshop-card"><Skeleton variant="rectangular" height={120} /></div>
        )}
        {!loading && pageItems.map((w) => {
          const started = !!localStorage.getItem(getWorkshopStorageKey(w.id, "started"));
          const completed = localStorage.getItem(getWorkshopStorageKey(w.id, "completed")) === "true";
          const img = w.meta.image || w.meta.img;
          const cats = normalizeCategories(w.meta.categories);
          const stage = completed ? 2 : (started ? 1 : 0);
          const fillPercent = stage === 0 ? 0 : stage === 1 ? 50 : 100;

          return (
            <div key={w.id} className="workshop-card">
              <div className="ws-left">
                <div className="ws-title-row">
                  <button className="triangle" aria-label="expand" />
                  <h3 className="ws-title">{w.meta.title || w.id}</h3>
                </div>
                <p className="ws-summary">{w.meta.summary || ""}</p>
                <div className="ws-meta">
                  <span className="ws-meta-item">
                    <AccessTimeIcon /> {typeof w.meta.duration === "number" ? `${w.meta.duration} minutes` : (w.meta.duration || "45 minutes")}
                  </span>
                  {typeof w.meta.participants === "number" && (
                    <span className="ws-meta-item"><GroupIcon /> {w.meta.participants} participants</span>
                  )}
                  {typeof w.meta.chapters === "number" && (
                    <span className="ws-meta-item"><MenuBookIcon /> {w.meta.chapters} chapters</span>
                  )}
                </div>
                <div className="ws-tags">
                  {w.meta.difficulty && (<span className={`chip ${w.meta.difficulty.toLowerCase()}`}>{w.meta.difficulty}</span>)}
                  {!started && (<span className="chip muted">Not Started</span>)}
                  {started && !completed && (<span className="chip in-progress">In Progress</span>)}
                  {completed && (<span className="chip success">Completed</span>)}
                  {cats.map((c) => (<span key={c} className="chip small">{formatCategory(c)}</span>))}
                </div>
                <div className="ws-progress">
                  <div className={`bar ${stage === 2 ? "complete" : ""}`}>
                    <div className={`fill ${stage === 2 ? "complete" : ""}`} style={{ width: `${fillPercent}%` }} />
                    <span className={`bubble ${stage >= 0 ? "active" : ""}`} style={{ left: "0%" }} aria-label="Not Started" />
                    <span className={`bubble ${stage >= 1 ? "active" : ""}`} style={{ left: "50%" }} aria-label="In Progress" />
                    <span className={`bubble ${stage >= 2 ? "active" : ""}`} style={{ left: "100%" }} aria-label="Completed" />
                  </div>
                </div>
              </div>
              <div className="ws-right">
                {img && (
                  <img alt="thumbnail" className="ws-thumb" src={getRawFileUrl(img.replace(/^\.\//, "").replace(/^\//, ""))} />
                )}
                <div className="ws-actions">
                  {!started && (
                    <button className="btn primary" onClick={() => goTo(w)}><PlayArrowIcon /> Start Workshop</button>
                  )}
                  {started && !completed && (
                    <button className="btn secondary" onClick={() => goTo(w)}><PlayArrowIcon /> Continue</button>
                  )}
                  {completed && (
                    <button className="btn success" onClick={() => goTo(w)}><CheckCircleIcon /> Review</button>
                  )}
                  {!completed && started && (
                    <button
                      className="btn ghost"
                      onClick={() => {
                        localStorage.setItem(getWorkshopStorageKey(w.id, "completed"), "true");
                        setLocalStateVersion((v) => v + 1);
                      }}
                    >
                      <CheckCircleIcon /> Mark Complete
                    </button>
                  )}
                  {started && (
                    <button
                      className="btn ghost"
                      onClick={() => {
                        localStorage.removeItem(getWorkshopStorageKey(w.id, "completed"));
                        localStorage.removeItem(getWorkshopStorageKey(w.id, "progress"));
                        localStorage.removeItem(getWorkshopStorageKey(w.id, "started"));
                        setLocalStateVersion((v) => v + 1);
                      }}
                    >
                      <ReplayIcon /> Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!loading && pageCount > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              className={`page-btn ${pNum === safePage ? "active" : ""}`}
              onClick={() => setPage(pNum)}
            >
              {pNum}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={safePage === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Workshops;


