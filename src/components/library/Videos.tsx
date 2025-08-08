import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import { getDirectoryContents, getFileContent, getRawFileUrl } from "../../hooks/github-hook";

interface VideoMeta {
  title: string;
  summary?: string;
  image?: string;
  img?: string; // legacy
  date?: string;
  authors?: string;
  categories?: string | string[];
  difficulty?: string; // easy|beginner|intermediate|advanced
  id?: string; // youtube id
  duration?: string; // optional, e.g., 19:13
  views?: string | number; // optional display only
}

interface VideoItem {
  id: string; // markdown id
  meta: VideoMeta;
  categoryFolder: string; // top-level folder name under videos
}

// Difficulty mapping not used in current UI; keeping minimal helpers lean

function normalizeCategories(raw: VideoMeta["categories"]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return String(raw)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const Videos = () => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState<string>("");
  // Difficulty filtering removed per design
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const root = await getDirectoryContents("videos");
        const folders = (root || []).filter((i) => i.type === "dir");
        const collected: VideoItem[] = [];

        for (const f of folders) {
          const children = await getDirectoryContents(f.path);
          const leafDirs = (children || []).filter((c) => c.type === "dir");
          for (const d of leafDirs) {
            const leaf = await getDirectoryContents(d.path);
            if (!leaf) continue;
            const md = leaf.find((it) => it.type === "file" && /\.md$/i.test(it.name));
            const metaFile = leaf.find((it) => it.type === "file" && it.name.toLowerCase() === "metadata.json");
            if (!md || !metaFile) continue;
            const metaRaw = await getFileContent(metaFile.path);
            let meta: VideoMeta = { title: md.name.replace(/\.md$/i, "") };
            if (metaRaw) {
              try { meta = JSON.parse(metaRaw); } catch { /* ignore */ }
            }
            collected.push({ id: md.name.replace(/\.md$/i, ""), meta, categoryFolder: f.name });
          }
        }

        // Sort newest first by date
        collected.sort((a, b) => {
          const ad = Date.parse(String(a.meta.date || ""));
          const bd = Date.parse(String(b.meta.date || ""));
          if (isNaN(ad) && isNaN(bd)) return a.meta.title.localeCompare(b.meta.title);
          if (isNaN(ad)) return 1;
          if (isNaN(bd)) return -1;
          return bd - ad;
        });

        setVideos(collected);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => {
      normalizeCategories(v.meta.categories).forEach((c) => set.add(c));
      set.add(v.categoryFolder);
    });
    // Remove generic "Videos" tag if present
    set.delete("Videos");
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [videos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      const cats = new Set<string>(normalizeCategories(v.meta.categories).concat([v.categoryFolder]));
      const catOk = activeCategory === "All" ? true : cats.has(activeCategory);
      if (!catOk) return false;
      if (!q) return true;
      const title = String(v.meta.title || v.id || "").toLowerCase();
      const summary = String(v.meta.summary || "").toLowerCase();
      const authors = String(v.meta.authors || "").toLowerCase();
      const catString = Array.from(cats).join(" ").toLowerCase();
      const duration = String(v.meta.duration || "").toLowerCase();
      return (
        title.includes(q) ||
        summary.includes(q) ||
        authors.includes(q) ||
        catString.includes(q) ||
        duration.includes(q)
      );
    });
  }, [videos, activeCategory, query]);

  function openVideo(v: VideoItem) {
    navigate(`/library?nav=Videos&article=${encodeURIComponent(v.id)}`);
  }

  return (
    <div className="videos">
      <h1 style={{ margin: 0 }}>Video Library</h1>
      <p className="muted" style={{ marginTop: 4 }}>Educational content curated for our AI club members</p>

      <div className="video-filters">
        <div className="filter-row">
          <div className="filter-label">Categories</div>
          <button className={`chip-filter ${activeCategory === "All" ? "active" : ""}`} onClick={() => setActiveCategory("All")}>All</button>
          {allCategories.map((c) => (
            <button key={c} className={`chip-filter ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search videos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="video-grid">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="video-card"><Skeleton variant="rectangular" height={170} /></div>
        ))}
        {!loading && filtered.map((v) => {
          const img = v.meta.image || v.meta.img;
          const cats = normalizeCategories(v.meta.categories).filter((c) => c.toLowerCase() !== "videos");
          return (
            <div key={v.id} className="video-card" onClick={() => openVideo(v)}>
              <div className="thumb-wrap">
                {img && (<img className="thumb" alt="thumbnail" src={getRawFileUrl(img.replace(/^\.\//, "").replace(/^\//, ""))} />)}
                {v.meta.duration && (
                  <span className="duration"><AccessTimeIcon /> {v.meta.duration}</span>
                )}
              </div>
              <div className="video-body">
                <div className="badge-row">
                  {cats.slice(0, 1).map((c) => (<span key={c} className="badge">{c}</span>))}
                </div>
                <div className="title">{v.meta.title || v.id}</div>
                <div className="desc">{v.meta.summary || ""}</div>
                <div className="meta-row">
                  <span className="author muted">By {v.meta.authors || "YouTube"}</span>
                  <span className="platform muted"><YouTubeIcon fontSize="small" /> YouTube</span>
                </div>
                <div className="meta-row end">
                  {typeof v.meta.views !== "undefined" && (
                    <span className="muted"><VisibilityIcon fontSize="small" /> {v.meta.views}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Videos;


