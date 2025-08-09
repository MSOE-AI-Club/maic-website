import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";
import "./library.css";
import LeftPanel from "../../components/library/LeftPanel";
import Modal from "../../components/library/Modal";
import ModalItem from "../../components/library/ModalItem";
import { Link, useLocation } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MovieIcon from "@mui/icons-material/Movie";
import ConstructionIcon from "@mui/icons-material/Construction";
import ScienceIcon from "@mui/icons-material/Science";
import GroupIcon from "@mui/icons-material/Group";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ModalItemPreview from "../../components/library/ModalItemPreview";
import Article from "../../components/library/Article";
import NavBar from "../../components/Navbar";
import CanvasBackground from "../../components/library/Background";
import ArticleCards from "../../components/library/ArticleCards";
import ResearchProjects from "../../components/library/ResearchProjects";
import Workshops from "../../components/library/Workshops";
import Videos from "../../components/library/Videos";
import Competitions from "../../components/library/Competitions";
import {
  getFeaturedModals,
  getTaggedContent,
  getSubsectionModals,
  getTotalResourceCount,
  getVideosCount,
  getWorkshopsCount,
  getEventArticlesCount,
  getMemberLearningsCount,
  getResearchProjectCount,
  getRecentEvents,
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
  const [eventArticlesCount, setEventArticlesCount] = useState<number>(0);
  const [memberLearningsCount, setMemberLearningsCount] = useState<number>(0);
  const [researchProjectsCount, setResearchProjectsCount] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<{ title: string; date: string }[]>([]);

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

    const articleId = typeof articleObj === 'string' ? articleObj : Object.keys(articleObj)[0];

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
        const [total, vid, ws, ev, ml, rp] = await Promise.all([
          getTotalResourceCount(),
          getVideosCount(),
          getWorkshopsCount(),
          getEventArticlesCount(),
          getMemberLearningsCount(),
          getResearchProjectCount(),
        ]);
        setResourceCount(total);
        setVideosCount(vid);
        setWorkshopsCount(ws);
        setEventArticlesCount(ev);
        setMemberLearningsCount(ml);
        setResearchProjectsCount(rp);
      } catch (_) {
        // leave defaults
      }

      try {
        const events = await getRecentEvents(3);
        setRecentActivity(events.map((e) => ({ title: e.title, date: e.date })));
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
        <nav style={{ display: "flex" }}>
          <LeftPanel query={query} setQuery={setQuery} forceRefresh={(nav: string) => forceRefresh(nav)} />
          {query.get("article") === null && (
            <section
              className="modals"
              style={{ maxWidth: "93.25vw", paddingTop: "40px", width: "100%" }}
            >
              <div>
                {(query.get("nav") === null || query.get("nav") === "Featured") && (
                  <div className="library-landing">
                    <div className="library-stats">
                      <div className="stat-card">
                        <LibraryBooksIcon />
                        <div className="stat-text">
                          <span className="stat-number">{resourceCount > 0 ? `${resourceCount}+` : "40+"}</span>
                          <span className="stat-label">Total Resources</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <GroupIcon />
                        <div className="stat-text">
                          <span className="stat-number">120+</span>
                          <span className="stat-label">Club Members</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <QueryBuilderIcon />
                        <div className="stat-text">
                          <span className="stat-number">25+</span>
                          <span className="stat-label">Hours Content</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <RocketLaunchIcon />
                        <div className="stat-text">
                          <span className="stat-number">4</span>
                          <span className="stat-label">Active Projects</span>
                        </div>
                      </div>
                    </div>

                    <div className="library-categories">
                      <a className="category-card" href="/library?nav=Articles">
                        <div className="category-icon"><EventNoteIcon /></div>
                        <div className="category-content">
                          <h3>Event Articles</h3>
                          <p>Stay updated with the latest club events, meetups, and announcements.</p>
                          <span className="category-meta">{eventArticlesCount} articles</span>
                        </div>
                        <span className="category-arrow">→</span>
                      </a>

                      <a className="category-card" href="/library?nav=Videos">
                        <div className="category-icon"><MovieIcon /></div>
                        <div className="category-content">
                          <h3>Video Library</h3>
                          <p>Educational videos covering AI concepts, tutorials, and discussions.</p>
                          <span className="category-meta">{videosCount} videos</span>
                        </div>
                        <span className="category-arrow">→</span>
                      </a>

                      <a className="category-card" href="/library?nav=Workshops">
                        <div className="category-icon"><ConstructionIcon /></div>
                        <div className="category-content">
                          <h3>Interactive Workshops</h3>
                          <p>Hands-on coding workshops you can complete right in your browser.</p>
                          <span className="category-meta">{workshopsCount} workshops</span>
                        </div>
                        <span className="category-arrow">→</span>
                      </a>

                      <a className="category-card" href="/library?nav=Articles&type=Member%20Learnings">
                        <div className="category-icon"><LibraryBooksIcon /></div>
                        <div className="category-content">
                          <h3>Member Learnings</h3>
                          <p>Knowledge sharing from club members about their AI journey.</p>
                          <span className="category-meta">{memberLearningsCount} posts</span>
                        </div>
                        <span className="category-arrow">→</span>
                      </a>

                      <a className="category-card" href="/library?nav=Research">
                        <div className="category-icon"><ScienceIcon /></div>
                        <div className="category-content">
                          <h3>Research Projects</h3>
                          <p>Current research initiatives and projects from our club members.</p>
                          <span className="category-meta">{researchProjectsCount} projects</span>
                        </div>
                        <span className="category-arrow">→</span>
                      </a>
                    </div>

                    <div className="recent-activity">
                      <h3>Recent Activity</h3>
                      <ul>
                        {recentActivity.map((a, idx) => (
                          <li key={idx}>
                            <span className="dot" />
                            <span className="activity-text">{a.title}</span>
                            <span className="time">{new Date(a.date).toLocaleDateString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                {query.get("nav") && !["Featured","Articles","Research","Workshops","Videos","Competitions"].includes(query.get("nav") as string) && (
                  <div>
                    {modals}
                  </div>
                )}
              </div>
            </section>
          )}
          {query.get("article") !== null && (
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
