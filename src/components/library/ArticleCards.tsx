import { useEffect, useState } from "react";
import { Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
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

  if (loading) {
    return (
      <div className="article-cards">
        <h1 style={{ marginTop: 0, marginBottom: "0.25rem" }}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Articles
        </h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>Stay updated with the latest from our AI club community</p>
        <div className="article-featured-grid">
          {[0, 1].map((i) => (
            <div key={i} className="article-featured-card">
              <Skeleton variant="rectangular" height={110} />
              <Skeleton width="60%" height={24} />
              <Skeleton width="90%" height={16} />
              <Skeleton width="40%" height={16} />
            </div>
          ))}
        </div>
        <h2>All Articles</h2>
        <Skeleton variant="rectangular" height={40} />
        <div className="article-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="article-row">
              <Skeleton variant="rectangular" height={28} width="100%" />
            </div>
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
    </div>
  );
};

export default ArticleCards;


