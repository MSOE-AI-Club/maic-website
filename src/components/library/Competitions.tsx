import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import { getDirectoryContents, getFileContent, getRawFileUrl } from "../../hooks/github-hook";
import SpotlightCard from "../react-bits/spotlight-card/SpotlightCard";

interface CompetitionMeta {
  title: string;
  summary?: string;
  image?: string;
  img?: string; // legacy
  date?: string; // single date or range text
  authors?: string;
  categories?: string | string[]; // used for type badge like Hackathon, Research, etc.
  participants?: number;
  link?: string;
  url?: string;
  status?: string; // e.g., Completed, Ongoing
}

interface CompetitionItem {
  id: string; // markdown id
  meta: CompetitionMeta;
  parentFolder: string; // e.g., HacksGiving, Innovation Labs
}

function toArray(raw?: string | string[]): string[] {
  if (!raw) return [];
  return Array.isArray(raw)
    ? raw.map((s) => String(s).trim()).filter(Boolean)
    : String(raw)
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
}

const Competitions = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CompetitionItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const root = await getDirectoryContents("competitions");
        const categories = (root || []).filter((i) => i.type === "dir");
        const out: CompetitionItem[] = [];
        for (const cat of categories) {
          const catDirs = await getDirectoryContents(cat.path);
          const leafDirs = (catDirs || []).filter((d) => d.type === "dir");
          for (const leaf of leafDirs) {
            const files = await getDirectoryContents(leaf.path);
            if (!files) continue;
            const md = files.find((f) => f.type === "file" && /\.md$/i.test(f.name));
            const metaFile = files.find((f) => f.type === "file" && f.name.toLowerCase() === "metadata.json");
            if (!md || !metaFile) continue;
            const metaRaw = await getFileContent(metaFile.path);
            let meta: CompetitionMeta = { title: md.name.replace(/\.md$/i, "") };
            if (metaRaw) {
              try { meta = JSON.parse(metaRaw); } catch { /* ignore */ }
            }
            out.push({ id: md.name.replace(/\.md$/i, ""), meta, parentFolder: cat.name });
          }
        }
        // newest first by date
        out.sort((a, b) => {
          const ad = Date.parse(String(a.meta.date || ""));
          const bd = Date.parse(String(b.meta.date || ""));
          if (isNaN(ad) && isNaN(bd)) return a.meta.title.localeCompare(b.meta.title);
          if (isNaN(ad)) return 1;
          if (isNaN(bd)) return -1;
          return bd - ad;
        });
        setItems(out);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openItem(id: string) {
    navigate(`/library?nav=Competitions&article=${encodeURIComponent(id)}`);
  }

  return (
    <div className="competitions">
      <h1 style={{ margin: 0 }}>AI Club Competitions</h1>
      <p className="muted" style={{ marginTop: 4 }}>
        Showcase your participation in our prestigious competitions and earn certificates to
        demonstrate your achievements in AI and machine learning.
      </p>

      <div className="competition-grid">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <SpotlightCard key={i} className="competition-spotlight" style={{ padding: 0 }}>
            <div className="comp-card"><Skeleton variant="rectangular" height={180} /></div>
          </SpotlightCard>
        ))}
        {!loading && items.map((c) => {
          const img = c.meta.image || c.meta.img;
          const typeBadge = toArray(c.meta.categories).find((t) => /hackathon|research|technical|debate/i.test(t)) || c.parentFolder;
          const link = c.meta.link || c.meta.url;
          const status = c.meta.status || "Completed";
          return (
            <SpotlightCard key={c.id} className="competition-spotlight" style={{ padding: 0 }}>
              <div className="comp-card">
                <div className="comp-header">
                  <div className="comp-icon"><EmojiEventsIcon /></div>
                  <div className="comp-title">{c.meta.title || c.id}</div>
                  <span className="status">{status}</span>
                </div>
                <div className="comp-body">
                  <div className="badges">
                    <span className="badge">{typeBadge}</span>
                  </div>
                  <p className="summary">{c.meta.summary || ""}</p>
                  <div className="meta-row">
                    {c.meta.date && (
                      <span className="muted"><CalendarMonthIcon fontSize="small" /> {c.meta.date}</span>
                    )}
                    {typeof c.meta.participants === "number" && (
                      <span className="muted"><GroupIcon fontSize="small" /> {c.meta.participants} participants</span>
                    )}
                  </div>
                  <div className="links-row">
                    {link && (
                      <a className="purple-link" href={link} target="_blank" rel="noreferrer">
                        <OpenInNewIcon fontSize="small" /> Learn more
                      </a>
                    )}
                    <button className="btn" onClick={() => openItem(c.id)}>View Certificate</button>
                  </div>
                </div>
                {img && (<img className="comp-thumb" alt="thumb" src={getRawFileUrl(img.replace(/^\.\//, "").replace(/^\//, ""))} />)}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};

export default Competitions;


