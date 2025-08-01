import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";
import "./library.css";
import LeftPanel from "../../components/library/LeftPanel";
import Modal from "../../components/library/Modal";
import ModalItem from "../../components/library/ModalItem";
import { Link, useLocation } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";
import ModalItemPreview from "../../components/library/ModalItemPreview";
import Article from "../../components/library/Article";
import NavBar from "../../components/Navbar";
import CanvasBackground from "../../components/library/Background";
import {
  getFeaturedModals,
  getTags,
  getTaggedContent,
  getSubsectionModals,
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
  const [categoryItems, setCategoryItems] = useState<any[]>([]);
  const [categoryTags, setCategoryTags] = useState<any[]>([]);
  const [currentArticle, setCurrentArticle] = useState("");
  const [previewedArticle, setPreviewedArticle] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [columns, setColumns] = useState<number>(6);
  const [width, setWidth] = useState(window.innerWidth);

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
  const [category, setCategory] = useState<string>("All");
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

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getTags();
      setCategoryTags(["All", ...tags]);
    };
    fetchTags();
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

  useEffect(() => {
    const fetchCategoryItems = async () => {
      if (category === "All") {
        setCategoryItems([]);
        return;
      }
      const items = await getTaggedContent(category);
      setCategoryItems(transformTaggedContent(items));
    };
    fetchCategoryItems();
  }, [category]);

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
              style={{ maxWidth: "93.25vw", paddingTop: "40px" }}
            >
              <div>
                {modals}
                {(query.get("nav") === "Featured" ||
                  query.get("nav") === null) && (
                  <Modal
                    title="Categories"
                    chips={categoryTags.slice(0, 6).map((tag, index) => {
                      return (
                        <Chip
                          key={index + 1}
                          variant={category === tag ? "filled" : "outlined"}
                          component={Link}
                          color="primary"
                          label={tag}
                          onClick={() => setCategory(tag)}
                          to="/library?nav=Featured"
                          clickable
                        />
                      );
                    })}
                    items={categoryItems}
                  />
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
