import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";
import { Skeleton, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import "./library.css";
import LeftPanel from "../../components/library/LeftPanel";
import Modal from "../../components/library/Modal";
import ModalItem from "../../components/library/ModalItem";
import { Link, useLocation } from "react-router-dom";
import { getAliasRedirectTarget } from "../../hooks/alias-redirect";
import { useNavigate } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";
import DescriptionIcon from "@mui/icons-material/Description";
import MovieIcon from "@mui/icons-material/Movie";
import ConstructionIcon from "@mui/icons-material/Construction";
import ScienceIcon from "@mui/icons-material/Science";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
// Group icon removed from stats; using Construction for Workshops
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ModalItemPreview from "../../components/library/ModalItemPreview";
import Article from "../../components/library/Article";
import NavBar from "../../components/navbar/Navbar";
import CanvasBackground from "../../components/library/Background";
import ArticleCards from "../../components/library/ArticleCards";
import ResearchProjects from "../../components/library/ResearchProjects";
import Workshops from "../../components/library/Workshops";
import Videos from "../../components/library/Videos";
import Competitions from "../../components/library/Competitions";
import SpotlightCard from "../../components/react-bits/spotlight-card/SpotlightCard";
import {
  getFeaturedModals,
  getTaggedContent,
  getSubsectionModals,
  getTotalResourceCount,
  getVideosCount,
  getWorkshopsCount,
  getResearchProjectCount,
  getRecentEvents,
  getArticlesCount,
  getCompetitionsCount,
  getLatestSchoolYearResearchProjectCount,
  searchAllContent,
} from "../../hooks/library-helper";
import type { ModalContent } from "../../hooks/library-helper";

interface Modal {
  title: string;
  tags: string[];
  content_ids: string[];
  type: string;
  img: string;
  date: string;
  description: string;
  authors: string;
}

const useScrollToLocation = () => {
  const scrolledRef = useRef(false);
  const { hash } = useLocation();
  const hashRef = useRef(hash);

  useEffect(() => {
    if (hash) {
      if (hashRef.current !== hash) {
        hashRef.current = hash;
        scrolledRef.current = false;
      }

      if (!scrolledRef.current) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: elementPosition,
            behavior: "smooth",
          });

          scrolledRef.current = true;
        }
      }
    }
  });
};

/**
 * The Library component displays the library page of the website.
 * @returns {JSX.Element} The Library component.
 */
const Library = () => {
  /**
   * The states of the Library component, including the current article, previewed article, and whether to show the preview.
   */
  useScrollToLocation();
  const [currentArticle, setCurrentArticle] = useState("");
  const [previewedArticle, setPreviewedArticle] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(6);
  const [width, setWidth] = useState(window.innerWidth);
  const [resourceCount, setResourceCount] = useState<number>(0);
  const [videosCount, setVideosCount] = useState<number>(0);
  const [workshopsCount, setWorkshopsCount] = useState<number>(0);
  // Removed unused event and member learnings counts on landing
  const [researchProjectsCount, setResearchProjectsCount] = useState<number>(0); // latest school year
  const [researchProjectsTotalCount, setResearchProjectsTotalCount] =
    useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<
    { title: string; date: string }[]
  >([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [competitionsCount, setCompetitionsCount] = useState<number>(0);
  // Global search state (Featured view)
  const defaultActiveTypes = {
    Article: true,
    Research: true,
    Workshop: true,
    Video: true,
    Competition: true,
  } as const;
  const [globalQuery, setGlobalQuery] = useState<string>("");
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [activeTypes, setActiveTypes] = useState<{ [key: string]: boolean }>({
    ...defaultActiveTypes,
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const isSearchActive = (globalQuery || "").trim().length > 0;
  const [filtersDebouncing, setFiltersDebouncing] = useState<boolean>(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    document.title = "MAIC - Library";
  }, []);

  /**
   * Updates the width state based on the window width.
   */
  useEffect(() => {
    // Define a function to update the width state
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * Updates the number of columns based on the window width.
   */
  useEffect(() => {
    setColumns(Math.round(window.innerWidth / 320));
  }, [width]);

  /**
   * Opens the preview of the article with the given article ID.
   * @param {string} articleId - The article ID to open the preview for.
   * @returns {boolean} Whether the preview is open.
   */
  function openPreview(articleObj: string | ModalContent): boolean {
    let returnValue = false;

    const articleId =
      typeof articleObj === "string" ? articleObj : Object.keys(articleObj)[0];

    setPreviewedArticle((prevArticleId) => {
      if (prevArticleId === articleId) {
        returnValue = true;
        setShowPreview(false);
        return "";
      }
      returnValue = false;
      setShowPreview(true);
      return articleId;
    });

    return returnValue;
  }

  /**
   * Hides the preview of the article.
   */
  function hidePreview() {
    setShowPreview(false);
  }

  /**
   * Close the article
   */
  function closeArticle() {
    setCurrentArticle("");
    setPreviewedArticle("");
  }

  /**
   * The location of the current page.
   * The query parameters of the current page.
   * The category of the current page.
   * The modals to display on the page.
   */
  const location = useLocation();
  const navigate = useNavigate();
  // Handle alias redirects for legacy article paths landing on /library
  useEffect(() => {
    const target = getAliasRedirectTarget(location.pathname, location.search);
    if (target) navigate(target, { replace: true });
  }, [location.pathname, location.search]);

  const [query, setQuery] = useState<URLSearchParams>(
    new URLSearchParams(location.search)
  );
  const [modals, setModals] = useState<any[] | undefined>(undefined);

  /**
   * Gets the current query parameters from the URL.
   */
  useEffect(() => {
    setQuery(new URLSearchParams(location.search));
  }, [location.search]);

  /**
   * Sets the current article based on the query parameters.
   */
  useEffect(() => {
    setCurrentArticle(query.get("article") ?? "");
  }, [query]);

  // Fetch live counts for landing page
  useEffect(() => {
    (async () => {
      try {
        const [total, vid, ws, rp, ac, cc, rpTotal] = await Promise.all([
          getTotalResourceCount(),
          getVideosCount(),
          getWorkshopsCount(),
          getLatestSchoolYearResearchProjectCount(),
          getArticlesCount(),
          getCompetitionsCount(),
          getResearchProjectCount(),
        ]);
        setResourceCount(total);
        setVideosCount(vid);
        setWorkshopsCount(ws);
        setResearchProjectsCount(rp);
        setArticlesCount(ac);
        setCompetitionsCount(cc);
        setResearchProjectsTotalCount(rpTotal);
      } catch (_) {
        // leave defaults
      }

      try {
        const events = await getRecentEvents(3);
        setRecentActivity(
          events.map((e) => ({ title: e.title, date: e.date }))
        );
      } catch (_) {
        setRecentActivity([]);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const nav = query.get("nav");
      const type = query.get("type");

      if (currentArticle !== "") {
        setModals([]);
        return;
      }

      if (nav) {
        const subsectionModals = await getSubsectionModals(nav);
        setModals(transformModals(subsectionModals));
      } else if (type) {
        const taggedContent = await getTaggedContent(type);
        const modal = (
          <Modal
            title={type}
            chips={[]}
            items={transformTaggedContent(taggedContent)}
          />
        );
        setModals([modal]);
      } else {
        const featuredModals = await getFeaturedModals();
        setModals(transformModals(featuredModals));
      }
    };

    fetchContent();
  }, [query, currentArticle]);

  // Execute global search when on Featured view and query is non-empty
  useEffect(() => {
    if (!(query.get("nav") === null || query.get("nav") === "Featured")) return;
    if (!isSearchActive) return;
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAllContent(globalQuery);
        if (!cancelled) setGlobalResults(results);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 250); // debounce keystrokes
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [globalQuery, query, isSearchActive]);

  // Debounce filter changes; hide results while filters are being adjusted
  useEffect(() => {
    if (!isSearchActive) return;
    setFiltersDebouncing(true);
    const handle = window.setTimeout(() => setFiltersDebouncing(false), 200);
    return () => window.clearTimeout(handle);
  }, [activeTypes, isSearchActive]);

  // When navigating into Featured from another section, clear search and filters
  const lastNavRef = useRef<string>("__init__");
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("nav");
    const normalized = raw ? raw.trim().toLowerCase() : null;
    const isNowFeatured = normalized === null || normalized === "featured";
    const wasFeatured = lastNavRef.current === "featured";
    // Check sessionStorage signal from LeftPanel clicks
    let shouldForceClear = false;
    try {
      shouldForceClear =
        sessionStorage.getItem("maic:clear-featured-search") === "1";
    } catch (_) {
      shouldForceClear = false;
    }
    if (isNowFeatured && (!wasFeatured || shouldForceClear)) {
      setGlobalQuery("");
      setGlobalResults([]);
      setActiveTypes({ ...defaultActiveTypes });
      setIsSearching(false);
      setFiltersDebouncing(false);
      try {
        sessionStorage.removeItem("maic:clear-featured-search");
      } catch (_) {}
    }
    lastNavRef.current = isNowFeatured
      ? "featured"
      : String(normalized || "other");
  }, [location.search, location.pathname]);

  // no-op: removed category chips on landing

  const transformTaggedContent = (items: ModalContent[]) => {
    return items.map((item) => {
      const contentId = Object.keys(item)[0];
      const metadata = item[contentId];
      return (
        <ModalItem
          key={contentId}
          articleId={contentId}
          title={metadata.title}
          authors={metadata.authors}
          dataType={metadata.type}
          img={metadata.img}
          openPreview={() => openPreview(item)}
          columns={columns}
        />
      );
    });
  };

  const transformModals = (modalsData: any[]): ReactElement[] => {
    return modalsData.map((modal, index) => {
      const chips =
        modal.tags?.map((tag: string, i: number) => (
          <Chip
            key={i}
            component={Link}
            color="primary"
            label={tag}
            to={`/library?nav=${tag}`}
            clickable
            deleteIcon={<ArrowForward />}
            onDelete={() => {}}
          />
        )) || [];

      const content = modal.content_ids.map((contentIdObj: ModalContent) => {
        const contentId = Object.keys(contentIdObj)[0];
        const metadata = contentIdObj[contentId];
        if (!metadata) return null;
        return (
          <ModalItem
            key={contentId}
            title={metadata.title}
            authors={metadata.authors}
            img={metadata.img}
            dataType={metadata.type}
            articleId={contentId}
            openPreview={() => openPreview(contentIdObj)}
            columns={columns}
            type={modal.type}
          />
        );
      });

      return (
        <Modal
          key={index}
          title={modal.title}
          chips={chips}
          items={content}
          type={modal.type}
          img={modal.img}
          date={modal.date}
          description={modal.description}
          authors={modal.authors}
        />
      );
    });
  };

  function forceRefresh(nav: string) {
    window.history.pushState({}, "", `/library?nav=${nav}`);
    window.location.reload();
  }

  /**
   * The Library component.
   */
  return (
    <div style={{ margin: "0", padding: "0" }}>
      <NavBar page="Library" />
      <div className="App">
        {/* Mobile drawer toggle button */}
        {!getAliasRedirectTarget(location.pathname, location.search) && (
          <IconButton
            className="library-mobile-menu-toggle"
            onClick={() => setIsLeftPanelOpen(true)}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>
        )}

        <nav style={{ display: "flex" }}>
          {/* Desktop fixed sidebar */}
          {!getAliasRedirectTarget(location.pathname, location.search) && (
            <div className="library-leftpanel-desktop">
              <LeftPanel
                query={query}
                setQuery={setQuery}
                forceRefresh={(nav: string) => forceRefresh(nav)}
              />
            </div>
          )}

          {/* Mobile drawer overlay */}
          {isLeftPanelOpen && (
            <>
              <div
                className="library-leftpanel-backdrop"
                onClick={() => setIsLeftPanelOpen(false)}
                aria-label="Close navigation menu"
              />
              <div className="library-leftpanel-overlay">
                <IconButton
                  className="library-drawer-close"
                  onClick={() => setIsLeftPanelOpen(false)}
                  aria-label="Close navigation"
                >
                  <CloseIcon />
                </IconButton>
                <LeftPanel
                  query={query}
                  setQuery={setQuery}
                  forceRefresh={(nav: string) => forceRefresh(nav)}
                  onNavigate={() => setIsLeftPanelOpen(false)}
                />
              </div>
            </>
          )}

          {getAliasRedirectTarget(location.pathname, location.search) ===
            null &&
            query.get("article") === null && (
              <section
                className="modals"
                style={{
                  maxWidth: "93.25vw",
                  paddingTop: "40px",
                  width: "100%",
                }}
              >
                <div>
                  {(query.get("nav") === null ||
                    query.get("nav") === "Featured") && (
                    <div className="library-landing">
                      <div className="library-hero">
                        <h1>MAIC Library</h1>
                        <p>
                          Explore curated articles, interactive workshops,
                          videos, and recent research from the MAIC community.
                          Learn, build, and contribute—start with the highlights
                          below.
                        </p>
                      </div>
                      {/* Global Search and Filters moved between hero and top 4 cards */}
                      <div
                        className={`global-search-wrap ${
                          isSearchActive ? "" : "single"
                        }`}
                      >
                        <div className="global-search-main">
                          <input
                            type="text"
                            placeholder="Search across articles, research, workshops, videos..."
                            value={globalQuery}
                            onChange={(e) => setGlobalQuery(e.target.value)}
                            className="search-input"
                          />
                        </div>
                        {isSearchActive && (
                          <div className="global-filter-row">
                            <span className="filter-title">Filter by type</span>
                            {Object.keys(activeTypes).map((k) => (
                              <label
                                key={k}
                                className={`filter-check ${
                                  activeTypes[k] ? "on" : "off"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!activeTypes[k]}
                                  onChange={() =>
                                    setActiveTypes((prev) => ({
                                      ...prev,
                                      [k]: !prev[k],
                                    }))
                                  }
                                />
                                <span>{k}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {isSearchActive &&
                          (isSearching || filtersDebouncing) && (
                            <div className="global-results-grid">
                              {[...Array(6)].map((_, i) => (
                                <SpotlightCard
                                  key={i}
                                  className="search-result-spotlight"
                                  style={{ padding: 0 }}
                                >
                                  <div className="search-result-card">
                                    <div className="result-top">
                                      <Skeleton
                                        variant="rounded"
                                        width={70}
                                        height={20}
                                      />
                                      <Skeleton
                                        variant="text"
                                        width={60}
                                        height={20}
                                      />
                                    </div>
                                    <Skeleton
                                      variant="text"
                                      width="80%"
                                      height={28}
                                    />
                                    <Skeleton
                                      variant="text"
                                      width="95%"
                                      height={18}
                                    />
                                    <Skeleton
                                      variant="text"
                                      width="90%"
                                      height={18}
                                    />
                                    <div className="result-actions">
                                      <Skeleton
                                        variant="rounded"
                                        width={72}
                                        height={32}
                                      />
                                    </div>
                                  </div>
                                </SpotlightCard>
                              ))}
                            </div>
                          )}
                      </div>
                      {!isSearchActive && (
                        <div className="library-stats">
                          <SpotlightCard
                            className="stat-card"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              textAlign: "left",
                              gap: 12,
                              padding: 16,
                              minHeight: 0,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                width: "100%",
                                gap: "0.5rem",
                              }}
                            >
                              <LibraryBooksIcon />
                              <div className="stat-text">
                                <span className="stat-number">
                                  {resourceCount}
                                </span>
                                <span className="stat-label">
                                  Total Resources
                                </span>
                              </div>
                            </div>
                          </SpotlightCard>
                          <SpotlightCard
                            className="stat-card"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              textAlign: "left",
                              gap: 12,
                              padding: 16,
                              minHeight: 0,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                width: "100%",
                                gap: "0.5rem",
                              }}
                            >
                              <ConstructionIcon />
                              <div className="stat-text">
                                <span className="stat-number">
                                  {workshopsCount}
                                </span>
                                <span className="stat-label">Workshops</span>
                              </div>
                            </div>
                          </SpotlightCard>
                          <SpotlightCard
                            className="stat-card"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              textAlign: "left",
                              gap: 12,
                              padding: 16,
                              minHeight: 0,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                width: "100%",
                                gap: "0.5rem",
                              }}
                            >
                              <QueryBuilderIcon />
                              <div className="stat-text">
                                <span className="stat-number">
                                  {videosCount}
                                </span>
                                <span className="stat-label">Videos</span>
                              </div>
                            </div>
                          </SpotlightCard>
                          <SpotlightCard
                            className="stat-card"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              textAlign: "left",
                              gap: 12,
                              padding: 16,
                              minHeight: 0,
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                width: "100%",
                                gap: "0.5rem",
                              }}
                            >
                              <RocketLaunchIcon />
                              <div className="stat-text">
                                <span className="stat-number">
                                  {researchProjectsCount}
                                </span>
                                <span className="stat-label">
                                  Recent Research Projects
                                </span>
                              </div>
                            </div>
                          </SpotlightCard>
                        </div>
                      )}
                      {/* Search Results grid now appears after the top 4 cards */}
                      {isSearchActive && !isSearching && !filtersDebouncing && (
                        <div className="global-results-grid">
                          {globalResults
                            .filter((r: any) => activeTypes[r.source])
                            .map((r: any) => (
                              <SpotlightCard
                                key={`${r.source}:${r.id}`}
                                className="search-result-spotlight"
                                style={{ padding: 0 }}
                              >
                                <div className="search-result-card">
                                  <div className="result-top">
                                    <span
                                      className={`pill type ${String(
                                        r.source
                                      ).toLowerCase()}`}
                                    >
                                      {r.source}
                                    </span>
                                    {r.meta.date && (
                                      <span className="muted">
                                        {r.meta.date}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="result-title">
                                    {r.meta.title || r.id}
                                  </h3>
                                  {r.meta.description && (
                                    <p className="result-desc">
                                      {r.meta.description}
                                    </p>
                                  )}
                                  <div className="result-meta">
                                    {r.meta.authors && (
                                      <span className="muted">
                                        {r.meta.authors}
                                      </span>
                                    )}
                                  </div>
                                  {r.source !== "Research" && (
                                    <div className="result-actions">
                                      <Link
                                        to={(() => {
                                          if (r.source === "Article")
                                            return `/library?nav=Articles&article=${encodeURIComponent(
                                              r.id
                                            )}`;
                                          if (r.source === "Workshop")
                                            return `/library?nav=Workshops&article=${encodeURIComponent(
                                              r.id
                                            )}`;
                                          if (r.source === "Video")
                                            return `/library?nav=Videos&article=${encodeURIComponent(
                                              r.id
                                            )}`;
                                          if (r.source === "Competition")
                                            return `/library?nav=Competitions&article=${encodeURIComponent(
                                              r.id
                                            )}`;
                                          return `/library?article=${encodeURIComponent(
                                            r.id
                                          )}`;
                                        })()}
                                        className="btn"
                                      >
                                        Open
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </SpotlightCard>
                            ))}
                          {!isSearching &&
                            !filtersDebouncing &&
                            globalResults.filter(
                              (r: any) => activeTypes[r.source]
                            ).length === 0 && (
                              <div className="empty-state">
                                No results match your filters.
                              </div>
                            )}
                        </div>
                      )}

                      {!isSearchActive && (
                        <div className="library-categories">
                          <Link
                            to="/library?nav=Articles"
                            style={{ textDecoration: "none" }}
                          >
                            <SpotlightCard
                              className="category-spotlight"
                              style={{ padding: 16, minHeight: 0, minWidth: 0 }}
                            >
                              <div className="category-card">
                                <div className="category-icon">
                                  <DescriptionIcon />
                                </div>
                                <div className="category-content">
                                  <h3>Articles</h3>
                                  <p>
                                    Guides, tutorials, and club write-ups across
                                    AI topics.
                                  </p>
                                  <span className="category-meta">
                                    {articlesCount} articles
                                  </span>
                                </div>
                                <span className="category-arrow">→</span>
                              </div>
                            </SpotlightCard>
                          </Link>

                          <Link
                            to="/library?nav=Videos"
                            style={{ textDecoration: "none" }}
                          >
                            <SpotlightCard
                              className="category-spotlight"
                              style={{ padding: 16, minHeight: 0, minWidth: 0 }}
                            >
                              <div className="category-card">
                                <div className="category-icon">
                                  <MovieIcon />
                                </div>
                                <div className="category-content">
                                  <h3>Video Library</h3>
                                  <p>
                                    Educational videos covering AI concepts,
                                    tutorials, and discussions.
                                  </p>
                                  <span className="category-meta">
                                    {videosCount} videos
                                  </span>
                                </div>
                                <span className="category-arrow">→</span>
                              </div>
                            </SpotlightCard>
                          </Link>

                          <Link
                            to="/library?nav=Workshops"
                            style={{ textDecoration: "none" }}
                          >
                            <SpotlightCard
                              className="category-spotlight"
                              style={{ padding: 16, minHeight: 0, minWidth: 0 }}
                            >
                              <div className="category-card">
                                <div className="category-icon">
                                  <ConstructionIcon />
                                </div>
                                <div className="category-content">
                                  <h3>Interactive Workshops</h3>
                                  <p>
                                    Hands-on coding workshops you can complete
                                    right in your browser.
                                  </p>
                                  <span className="category-meta">
                                    {workshopsCount} workshops
                                  </span>
                                </div>
                                <span className="category-arrow">→</span>
                              </div>
                            </SpotlightCard>
                          </Link>

                          <Link
                            to="/library?nav=Research"
                            style={{ textDecoration: "none" }}
                          >
                            <SpotlightCard
                              className="category-spotlight"
                              style={{ padding: 16, minHeight: 0, minWidth: 0 }}
                            >
                              <div className="category-card">
                                <div className="category-icon">
                                  <ScienceIcon />
                                </div>
                                <div className="category-content">
                                  <h3>Research Projects</h3>
                                  <p>
                                    Current research initiatives and projects
                                    from our club members.
                                  </p>
                                  <span className="category-meta">
                                    {researchProjectsTotalCount} projects
                                  </span>
                                </div>
                                <span className="category-arrow">→</span>
                              </div>
                            </SpotlightCard>
                          </Link>

                          <Link
                            to="/library?nav=Competitions"
                            style={{ textDecoration: "none" }}
                          >
                            <SpotlightCard
                              className="category-spotlight"
                              style={{ padding: 16, minHeight: 0, minWidth: 0 }}
                            >
                              <div className="category-card">
                                <div className="category-icon">
                                  <EmojiEventsIcon />
                                </div>
                                <div className="category-content">
                                  <h3>Competitions</h3>
                                  <p>
                                    Hackathons and competitions hosted or joined
                                    by the club.
                                  </p>
                                  <span className="category-meta">
                                    {competitionsCount} entries
                                  </span>
                                </div>
                                <span className="category-arrow">→</span>
                              </div>
                            </SpotlightCard>
                          </Link>

                          <Link
                            to="https://forms.office.com/r/STYXQ1FPMn"
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "none" }}
                          >
                            <SpotlightCard
                              className="category-spotlight"
                              style={{ padding: 16, minHeight: 0, minWidth: 0 }}
                            >
                              <div className="category-card">
                                <div className="category-icon">
                                  <NoteAddIcon />
                                </div>
                                <div className="category-content">
                                  <h3>Submit</h3>
                                  <p>
                                    Share an article, workshop, video, or
                                    research with the community.
                                  </p>
                                  <span className="category-meta">
                                    Opens form
                                  </span>
                                </div>
                                <span className="category-arrow">→</span>
                              </div>
                            </SpotlightCard>
                          </Link>
                        </div>
                      )}

                      {!isSearchActive && (
                        <div className="recent-activity">
                          <h3>Recent Activity</h3>
                          <ul>
                            {recentActivity.map((a, idx) => (
                              <li key={idx}>
                                <span className="dot" />
                                <span className="activity-text">{a.title}</span>
                                <span className="time">
                                  {new Date(a.date).toLocaleDateString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {query.get("nav") === "Articles" && !query.get("type") && (
                    <div className="library-landing">
                      <ArticleCards type="" />
                    </div>
                  )}
                  {query.get("nav") === "Articles" && query.get("type") && (
                    <div className="library-landing">
                      <ArticleCards type={query.get("type") as string} />
                    </div>
                  )}
                  {query.get("nav") === "Research" && (
                    <div className="library-landing">
                      <ResearchProjects />
                    </div>
                  )}
                  {query.get("nav") === "Videos" && (
                    <div className="library-landing">
                      <Videos />
                    </div>
                  )}
                  {query.get("nav") === "Workshops" && (
                    <div className="library-landing">
                      <Workshops />
                    </div>
                  )}
                  {query.get("nav") === "Competitions" && (
                    <div className="library-landing">
                      <Competitions />
                    </div>
                  )}
                  {query.get("nav") &&
                    ![
                      "Featured",
                      "Articles",
                      "Research",
                      "Workshops",
                      "Videos",
                      "Competitions",
                    ].includes(query.get("nav") as string) && (
                      <div>{modals}</div>
                    )}
                </div>
              </section>
            )}
          {getAliasRedirectTarget(location.pathname, location.search) ===
            null &&
            query.get("article") !== null && (
              <Article articleId={currentArticle} closeArticle={closeArticle} />
            )}
          <ModalItemPreview
            articleId={previewedArticle}
            showPreview={showPreview}
            openPreview={openPreview}
            hidePreview={hidePreview}
            setShowPreview={setShowPreview}
          />
        </nav>
      </div>
      <CanvasBackground />
    </div>
  );
};

export default Library;
