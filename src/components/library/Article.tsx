import "./assets/library/css/article.css";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import CheckIcon from "@mui/icons-material/Check";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";
import { getRawFileUrl, getManifest, getFileContent } from "../../hooks/github-hook";
import { Skeleton } from "@mui/material";

/**
 * The ArticleProps interface represents the props that the Article component receives.
 */
interface ArticleProps {
  articleId: string;
  closeArticle: () => void;
}

/**
 * Converts a date string in the format "dd/mm/yyyy" to a textual representation.
 * @param {string} dateString - The date string in the format "dd/mm/yyyy".
 * @returns {string} The textual representation of the date string.
 */
function convertDateToTextual(dateString: string) {
  const [day, month, year] = dateString.split("/");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthName = months[parseInt(month, 10) - 1];
  return `${monthName} ${day}, ${year}`;
}

/**
 * The Article component displays an article with the given article ID.
 * @param {ArticleProps} props - The props to be passed to the Article component.
 * @returns {JSX.Element} The Article component.
 */
const Article = (props: ArticleProps) => {
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [authors, setAuthors] = useState<string>("");
  const [contents, setContents] = useState<string>("");
  const [type, setType] = useState<string>("md");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [marimoUrl, setMarimoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Resolve content type and any external link/video/pdf from local metadata
    (async () => {
      if (!props.articleId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const manifest = await getManifest();
      const files = manifest?.files || [];
      const mdPath = files.find((p) => p.endsWith(`/${props.articleId}.md`) || p === `${props.articleId}.md`);
      if (!mdPath) {
        setType("md");
        // Let the markdown loader effect decide not found after it attempts load
        return;
      }
      const dir = mdPath.substring(0, mdPath.lastIndexOf("/"));
      const metaPathsToTry = [
        `${dir}/metadata.json`,
        `${dir.substring(0, dir.lastIndexOf("/"))}/metadata.json`,
      ];
      let meta: any = null;
      for (const mp of metaPathsToTry) {
        const raw = await getFileContent(mp);
        if (raw) {
          try {
            meta = JSON.parse(raw);
            break;
          } catch {
            // ignore
          }
        }
      }
      if (meta) {
        const detectedType = (meta.type || "md").toString().toLowerCase();
        if (detectedType === "link" && meta.link) {
          window.open(meta.link.toString(), "_blank");
          navigate("/library");
          props.closeArticle();
          setIsLoading(false);
          return;
        }
        if (detectedType === "pdf" && meta.pdf) {
          setPdfUrl(getRawFileUrl(meta.pdf.toString()));
        }
        if (detectedType === "video" && meta.id) {
          setVideoId(meta.id.toString());
        }
        if (detectedType === "marimo" && meta.url) {
          setMarimoUrl(meta.url.toString());
        }
        setType(detectedType);
        window.scrollTo(0, 0);
        if (detectedType !== "md") {
          setIsLoading(false);
        }
      } else {
        setType("md");
        // leave loading true; markdown loader will finalize
      }
    })();
  }, [props.articleId, navigate]);

  useEffect(() => {
    const parts: string[] = window.location.href.split("/");
    let baseUrl: string = "";
    if (parts[2] === "127.0.0.1:3000" || parts[2] === "localhost:3000") {
      baseUrl = `${parts[0]}//127.0.0.1:8000`;
    } else {
      baseUrl = `${parts[0]}//${parts[2]}`;
    }
    const imgs = document.querySelectorAll("img");
    imgs.forEach((img) => {
      if (
        !img.classList.contains("modal-item-preview-image") &&
        !img.classList.contains("logo")
      ) {
        try {
          const tail = img.src.split("/").slice(-3).map(decodeURIComponent).join("/");
          // Prefer the CDN/content base URL, never fall back to S3 (deprecated)
          img.src = getRawFileUrl(tail);
        } catch (_) {
          // If we can't parse/update, leave as-is
        }
      }
    });

    const preElements = document.querySelectorAll("pre");

    preElements.forEach((pre) => {
      const existingButton = pre.querySelector("button");
      if (!existingButton) {
        const button = document.createElement("button");
        button.classList.add("copy-button");

        button.addEventListener("click", () => {
          const codeText = pre.innerText;
          navigator.clipboard.writeText(codeText);

          const iconContainer = button.querySelector("span");
          const root = createRoot(iconContainer!);
          root.render(<CheckIcon color="inherit" />);

          setTimeout(() => {
            root.render(<CopyAllIcon color="inherit" />);
          }, 3000);
        });

        const iconContainer = document.createElement("span");
        button.appendChild(iconContainer);
        pre.appendChild(button);

        const root = createRoot(iconContainer);
        root.render(<CopyAllIcon color="inherit" />);
      }

      const scriptPrettify1 = document.createElement("script");
      scriptPrettify1.innerHTML =
        "document.querySelectorAll('code').forEach(x => x.classList.add('prettyprint'))";
      document.body.appendChild(scriptPrettify1);

      const scriptPrettify2 = document.createElement("script");
      scriptPrettify2.src =
        "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js";
      document.body.appendChild(scriptPrettify2);
    });
  }, [contents]);

  useEffect(() => {
    // Load markdown content and metadata locally
    (async () => {
      try {
        if (!props.articleId) { setIsLoading(false); return; }
        const manifest = await getManifest();
        const files = manifest?.files || [];
        const mdPath = files.find((p) => p.endsWith(`/${props.articleId}.md`) || p === `${props.articleId}.md`);
        if (!mdPath) { setIsLoading(false); return; }
        const dir = mdPath.substring(0, mdPath.lastIndexOf("/"));
        const metaPathsToTry = [
          `${dir}/metadata.json`,
          `${dir.substring(0, dir.lastIndexOf("/"))}/metadata.json`,
        ];
        let meta: any = null;
        for (const mp of metaPathsToTry) {
          const raw = await getFileContent(mp);
          if (raw) {
            try {
              meta = JSON.parse(raw);
              break;
            } catch {
              // ignore
            }
          }
        }
        if (meta) {
          if (meta.summary) setSummary(meta.summary.toString());
          if (meta.date && /\d+\/\d+\/\d+/.test(meta.date.toString())) {
            setDate(convertDateToTextual(meta.date.toString()));
          } else if (meta.date) {
            setDate(meta.date.toString());
          }
          if (meta.title) setTitle(meta.title.toString());
          if (meta.authors) setAuthors(meta.authors.toString());
        }
        const content = await getFileContent(mdPath);
        if (content) setContents(content);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [props.articleId]);

  return (
    <div className="content">
      {isLoading && type === "md" && (
        <div className="article">
          <div style={{ paddingTop: "12px" }}>
            <Skeleton variant="text" width="60%" height={48} />
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" height={22} />
            <Skeleton variant="rectangular" width="100%" height={240} style={{ marginTop: 12 }} />
            <Skeleton variant="text" width="90%" height={22} />
            <Skeleton variant="text" width="88%" height={22} />
            <Skeleton variant="text" width="86%" height={22} />
          </div>
        </div>
      )}
      {type === "md" && !isLoading && (
        <div className="article">
          {!title && !authors && !date && !summary && (
            <div>
              <h1>404 - Article Not Found</h1>
              <p>No article was found here. Try again looking for the article.</p>
            </div>
          )}
          {title && (
            <span className="article-title">
              <Markdown>{`# ${title}`}</Markdown>
            </span>
          )}
          {authors && <Markdown>{`### **Authors:** ${authors}`}</Markdown>}
          {date && <Markdown>{`### **Published:** ${date}`}</Markdown>}
          {summary && <Markdown>{`### ${summary}`}</Markdown>}
          {title && authors && date && summary && (
            <Markdown
                children={contents}
                rehypePlugins={[rehypeRaw]}
                components={{
                h2: ({ node, ...props }) => {
                    if (
                    Array.isArray(props.children) &&
                    typeof props.children[0] === "string" &&
                    props.children[0] === "Why"
                    ) {
                    return (
                        <h2 {...props} className="yellow-why">
                        {props.children}
                        </h2>
                    );
                    }
                    return <h2 {...props} />;
                },
                }}
            />
          )}
        </div>
      )}
      <iframe
        src={pdfUrl}
        title={pdfUrl}
        width={"100%"}
        style={{
          display: type === "pdf" ? "block" : "none",
          marginTop: "55px",
          border: "none",
          height: "calc(100vh - 55px)",
        }}
      />
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={videoId}
        width={"100%"}
        style={{
          display: type === "video" ? "block" : "none",
          marginTop: "55px",
          border: "none",
          height: "calc(100vh - 55px)",
        }}
      />
      <iframe
        src={marimoUrl}
        title={marimoUrl}
        width={"100%"}
        style={{
          display: type === "marimo" ? "block" : "none",
          marginTop: "55px",
          border: "none",
          height: "calc(100vh - 55px)",
        }}
      />
    </div>
  );
};

export default Article;