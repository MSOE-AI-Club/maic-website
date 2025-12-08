import { useState, useEffect } from "react";
import { Divider } from "@mui/material";
import "./assets/library/css/left-panel.css";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ScienceIcon from "@mui/icons-material/Science";
import ConstructionIcon from "@mui/icons-material/Construction";
import DescriptionIcon from "@mui/icons-material/Description";
import Movie from "@mui/icons-material/Movie";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Link } from "react-router-dom";
import { getDirectoryContents } from "../../hooks/github-hook";

/**
 * The LeftPanelProps interface represents the props that the LeftPanel component receives.
 */
interface LeftPanelProps {
  query: any;
  setQuery: any;
  forceRefresh: (nav: string) => void;
  onNavigate?: () => void;
}

/**
 * The LeftPanel component displays the left panel of the library page.
 * @param {LeftPanelProps} props - The props to be passed to the LeftPanel component.
 * @returns {JSX.Element} The LeftPanel component.
 */
const LeftPanel = (props: LeftPanelProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const toTitleCase = (label: string): string => {
    return (
      label
        .replace(/[\-_]+/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        // Only uppercase the first letter if needed; keep the rest untouched (e.g., NLP remains NLP)
        .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
        .join(" ")
    );
  };
  /**
   * The state of the articles dropdown based on the query.
   */
  const [articlesDropdown, areArticlesDropdowned] = useState<boolean>(
    props.query.get("nav") === "Articles"
  );

  /**
   * Updates the articles dropdown state based on the query.
   */
  useEffect(() => {
    if (props.query.get("nav") === "Articles") {
      areArticlesDropdowned(true);
      return;
    }
    areArticlesDropdowned(false);
  }, [props.query.get("nav")]);

  useEffect(() => {
    // Build article type list from content manifest instead of backend API
    (async () => {
      const articleRoot = await getDirectoryContents("articles");
      const articleDirs =
        articleRoot?.filter((item) => item.type === "dir") || [];
      const sorted = [...articleDirs].sort((a: any, b: any) =>
        toTitleCase(a.name).localeCompare(toTitleCase(b.name), undefined, {
          sensitivity: "base",
        })
      );
      const links = sorted.map((dir) => (
        <Link
          key={dir.name}
          style={{ textAlign: "left" }}
          to={`/library?nav=Articles&type=${dir.name}`}
          className="left-nav-link"
          onClick={() => props.onNavigate?.()}
        >
          {toTitleCase(dir.name)}
        </Link>
      ));
      setCategories(links);
    })();
  }, []);

  /**
   * The LeftPanel component.
   */
  return (
    <div className="left-panel">
      <h1 className="header">
        <Link
          to="/library"
          onClick={() => {
            try {
              sessionStorage.setItem("maic:clear-featured-search", "1");
            } catch (_) {}
            props.onNavigate?.();
          }}
        >
          MArXiv
        </Link>
      </h1>
      <div className="navigation">
        <Link
          to="/library?nav=Featured"
          className="left-nav-link"
          onClick={() => {
            try {
              sessionStorage.setItem("maic:clear-featured-search", "1");
            } catch (_) {}
            props.onNavigate?.();
          }}
        >
          <AutoAwesomeIcon />
          <span>Featured</span>
        </Link>
        <Link
          to="/library?nav=Research"
          className="left-nav-link"
          onClick={() => props.onNavigate?.()}
        >
          <ScienceIcon />
          <span>Research</span>
        </Link>
        <Link
          to="/library?nav=Articles"
          className="left-nav-link"
          onClick={() => props.onNavigate?.()}
        >
          <DescriptionIcon />
          <span>Articles</span>
        </Link>
        {articlesDropdown && (
          <div className="articles-sublist">{categories}</div>
        )}
        <Link
          to="/library?nav=Workshops"
          className="left-nav-link"
          onClick={() => props.onNavigate?.()}
        >
          <ConstructionIcon />
          <span>Workshops</span>
        </Link>
        <Link
          to="/library?nav=Videos"
          className="left-nav-link"
          onClick={() => props.onNavigate?.()}
        >
          <Movie />
          <span>Videos</span>
        </Link>
        <Link
          to="/library?nav=Competitions"
          className="left-nav-link"
          onClick={() => props.onNavigate?.()}
        >
          <EmojiEventsIcon />
          <span>Competitions</span>
        </Link>
        {/* <Button
          component={Link}
          to="/library?nav=Favorites"
          startIcon={<Favorite />}
        >
          Favorites
        </Button> */}
        <Divider
          sx={{ borderColor: "white", margin: "1rem 1rem" }}
          aria-hidden="true"
        />
        <Link
          to="https://forms.office.com/r/STYXQ1FPMn"
          className="left-nav-link"
        >
          <NoteAddIcon />
          <span>Submit</span>
        </Link>
        {/* <Button
          component={Link}
          to="/About.html"
          startIcon={<HelpIcon />}
        >
          Help
        </Button> */}
      </div>
    </div>
  );
};

export default LeftPanel;
