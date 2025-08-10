import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { getCategoryColors } from "./categoryColors";
import { getArticlesByType, getAllArticles, type ModalContent } from "../../hooks/library-helper";
import SpotlightCard from "../react-bits/spotlight-card/SpotlightCard";

interface ArticleCardMeta {
  id: string;
  title: string;
  description?: string;
  date?: string;
  authors?: string;
  tags?: string[];
  img?: string;
}

function mapModalToMeta(items: ModalContent[]): ArticleCardMeta[] {
  return items.map((it) => {
    const id = Object.keys(it)[0];
    const meta = it[id]!;
    const rawCategories = (meta as any).categories;
    const categories: string[] = Array.isArray(rawCategories)
      ? rawCategories.map((c: any) => String(c).trim()).filter((s: string) => s.length > 0)
      : (typeof rawCategories === 'string'
          ? String(rawCategories)
              .split(/[;,]/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
          : []);
    return {
      id,
      title: meta.title,
      description: meta.description,
      date: meta.date,
      authors: meta.authors,
      img: (meta as any).img,
      // Use categories from metadata when available; fallback to any legacy tags
      tags: meta.tags ?? categories,
    } as ArticleCardMeta;
  });
}

interface ArticleCardsProps {
  type: string; // e.g. "news", "jupyter", etc
}

const ArticleCards = ({ type }: ArticleCardsProps) => {
  const [articles, setArticles] = useState<ArticleCardMeta[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [preview, setPreview] = useState<ArticleCardMeta | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const panelRef = useRef<HTMLDivElement | null>(null);

  function formatDate(raw?: string): string {
    if (!raw) return "";
    const s = String(raw).trim();
    // dd/mm/yyyy
    const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m1) {
      const d = parseInt(m1[1], 10);
      const m = parseInt(m1[2], 10) - 1;
      const y = parseInt(m1[3], 10);
      return new Date(y, m, d).toLocaleDateString();
    }
    // yyyy-mm-dd or yyyy/mm/dd
    const m2 = s.match(/^(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})$/);
    if (m2) {
      const y = parseInt(m2[1], 10);
      const mo = parseInt(m2[2], 10) - 1;
      const d = parseInt(m2[3], 10);
      return new Date(y, mo, d).toLocaleDateString();
    }
    const t = Date.parse(s);
    if (!Number.isNaN(t)) return new Date(t).toLocaleDateString();
    return "";
  }

  function formatLabel(label: string): string {
    return String(label)
      .trim()
      .replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase());
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = type ? await getArticlesByType(type) : await getAllArticles();
        const placeholderRe = /^\s*\[\s*list\s+of\s+categories\s+separated\s+by\s+commas\s*\]\s*$/i;
        const mapped = mapModalToMeta(items).filter((a) => {
          const tags = a.tags || [];
          // Exclude if any category/tag is the placeholder prompt
          return !tags.some((t) => placeholderRe.test(String(t)));
        });
        setArticles(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, [type]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  function closePreview() {
    setPreviewOpen(false);
    const TRANSITION_MS = 250;
    window.setTimeout(() => {
      setPreview(null);
    }, TRANSITION_MS);
  }

  // Close preview when clicking outside the panel, unless clicking a card link (which opens/navigates)
  useEffect(() => {
    if (!preview) return;
    function onDocClick(ev: MouseEvent) {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      // If click is inside the preview panel, ignore
      if (panelRef.current && panelRef.current.contains(target)) return;
      // If click is on an article card link, ignore (card handler will manage open/navigate)
      let el: HTMLElement | null = target;
      while (el) {
        if (el.classList && el.classList.contains("article-card-link")) return;
        el = el.parentElement;
      }
      closePreview();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [preview]);

  function openArticle(articleId: string) {
    navigate(`/library?nav=Articles&article=${articleId}`);
  }

  function handleCardClick(e: React.MouseEvent, article: ArticleCardMeta) {
    // If preview already open for this article, navigate to it
    if (preview && preview.id === article.id) {
      e.preventDefault();
      openArticle(article.id);
      return;
    }
    // Otherwise open the preview
    e.preventDefault();
    setPreview(article);
    setPreviewOpen(true);
  }

  if (loading) {
    return (
      <div className="article-cards">
        <h1 style={{ marginTop: 0, marginBottom: "0.25rem" }}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Articles
        </h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>Stay updated with the latest from our AI club community</p>
        <h2 style={{ marginTop: "1rem" }}>Featured Articles</h2>
        <div className="article-featured-grid">
          {[0, 1].map((i) => (
            <SpotlightCard key={i} className="article-spotlight" style={{ padding: 0 }}>
              <div className="article-featured-card">
                <Skeleton variant="rectangular" height={110} />
                <Skeleton width="60%" height={28} />
                <Skeleton width="95%" height={16} />
                <Skeleton width="55%" height={16} />
              </div>
            </SpotlightCard>
          ))}
        </div>
        <h2>All Articles</h2>
        <Skeleton variant="rectangular" height={40} />
        <div className="article-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpotlightCard key={i} className="article-spotlight" style={{ padding: 0 }}>
              <div className="article-row">
                <div className="row-left" style={{ width: "70%" }}>
                  <Skeleton height={24} width="90%" />
                </div>
                <div className="row-right" style={{ width: "30%", display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Skeleton height={16} width={120} />
                  <Skeleton height={16} width={90} />
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="article-cards">
        <h1 style={{ marginTop: 0, marginBottom: "0.25rem" }}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Articles
        </h1>
        <div className="empty-state">No articles found</div>
      </div>
    );
  }

  // Always keep newest first (getArticlesByType already sorts by date desc)
  // First two are featured, but All includes everything (including featured)
  const featured = articles.slice(0, 2);
  const allItems = articles;

  const filtered = allItems.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const hay = [a.title, a.description, a.authors].join(" \n ").toLowerCase();
    return hay.includes(q);
  }).sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <div className="article-cards">
      <h1 style={{ marginTop: 0, marginBottom: "0.25rem" }}>
        {type.charAt(0).toUpperCase() + type.slice(1)} Articles
      </h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Stay updated with the latest from our AI club community
      </p>

      <h2 style={{ marginTop: "1rem" }}>Featured Articles</h2>
      <div className="article-featured-grid">
        {featured.map((a) => (
          <Link
            key={a.id}
            to={`/library?nav=Articles&article=${a.id}`}
            className="article-card-link"
            style={{ textDecoration: "none" }}
            onClick={(e) => handleCardClick(e, a)}
          >
            <SpotlightCard className="article-spotlight" style={{ padding: 0 }}>
              <div className="article-featured-card">
                <h3>{a.title}</h3>
                <p className="desc">{a.description}</p>
                <div className="meta">
                  <span className="muted">{a.authors}</span>
                  <span className="muted">{formatDate(a.date)}</span>
                </div>
              </div>
            </SpotlightCard>
            {a.tags && a.tags.length > 0 && (
              <div className="featured-tags-outside">
                {a.tags.map((t) => {
                  const c = getCategoryColors(t);
                  return (
                    <span key={t} className="tag" style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}>
                      {formatLabel(t)}
                    </span>
                  );
                })}
              </div>
            )}
          </Link>
        ))}
      </div>

      <h2>All Articles</h2>
      <input
        className="search-input"
        type="text"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="article-list">
        {pageItems.map((a) => (
          <Link
            key={a.id}
            to={`/library?nav=Articles&article=${a.id}`}
            className="article-card-link"
            style={{ textDecoration: "none" }}
            onClick={(e) => handleCardClick(e, a)}
          >
            <SpotlightCard className="article-spotlight" style={{ padding: 0 }}>
              <div className="article-row">
                <div className="row-left">
                  <div className="title">{a.title}</div>
                </div>
                <div className="row-right">
                  <span className="author muted">{a.authors}</span>
                  <span className="date muted">{formatDate(a.date)}</span>
                </div>
              </div>
            </SpotlightCard>
            {a.tags && a.tags.length > 0 && (
              <div className="row-tags-outside">
                {a.tags.slice(0, 4).map((t) => {
                  const c = getCategoryColors(t);
                  return (
                    <span key={t} className="tag tag-sm" style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}>
                      {formatLabel(t)}
                    </span>
                  );
                })}
              </div>
            )}
          </Link>
        ))}
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

      {preview && (
        <div className={`article-preview-panel ${previewOpen ? "open" : ""}`} ref={panelRef}>
          <div className="preview-inner">
            {preview.img && (
              <div className="preview-thumb-wrap">
                <img src={preview.img} alt={preview.title} className="preview-thumb" />
              </div>
            )}
            <h3 className="preview-title">{preview.title}</h3>
            <div className="preview-meta">
              <span className="muted">{preview.authors}</span>
              <span className="muted">{formatDate(preview.date)}</span>
            </div>
            {preview.description && <p className="preview-desc">{preview.description}</p>}
            {preview.tags && preview.tags.length > 0 && (
              <div className="preview-tags">
                {preview.tags.map((t) => {
                  const c = getCategoryColors(t);
                  return (
                    <span key={t} className="tag" style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}>
                      {formatLabel(t)}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="preview-footer">
            <button className="btn primary" onClick={() => openArticle(preview.id)}>Read more</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCards;


