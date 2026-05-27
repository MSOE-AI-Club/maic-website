import React, { useState, useEffect, useRef } from "react";
import NavBar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./projectEditor.css";

// Lucide React Icons
import {
  Columns,
  FileText,
  Eye,
  Settings,
  Download,
  RotateCcw,
  Trash2,
  Bold,
  Italic,
  Heading,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ChevronDown
} from "lucide-react";

interface Metadata {
  title: string;
  members: string;
  description: string;
  date: string;
  tags: string;
  type: string;
}

const DEFAULT_METADATA: Metadata = {
  title: "",
  members: "",
  description: "",
  date: "",
  tags: "",
  type: "Project"
};

const DEFAULT_BODY = "";

const ProjectEditor: React.FC = () => {
  const [layout, setLayout] = useState<"split" | "editor" | "preview">("split");
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [editorText, setEditorText] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  // Set initial document
  useEffect(() => {
    document.title = "MAIC - Projects";
    setEditorText(DEFAULT_BODY);
  }, []);

  // Update editor frontmatter when form metadata changes
  const handleFormChange = (updatedMeta: Metadata) => {
    setMetadata(updatedMeta);
  };

  // Update form inputs when editor content changes
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorText(e.target.value);
  };

  // Insertion Helper
  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end) || placeholder;
    const replacement = before + selectedText + after;

    // Store the scroll position of the textarea
    const scrollTop = textarea.scrollTop;

    try {
      // Re-select to focus targeting
      textarea.setSelectionRange(start, end);
      
      // In modern browsers, execCommand('insertText') inserts text and preserves the native undo/redo history stack
      const success = document.execCommand("insertText", false, replacement);
      if (!success) {
        throw new Error("execCommand returned false");
      }
    } catch (e) {
      // Fallback for systems that don't support execCommand
      const newText = text.substring(0, start) + replacement + text.substring(end);
      setEditorText(newText);
    }

    // Restore scroll position to avoid vertical jumping
    textarea.scrollTop = scrollTop;

    // Reposition cursor on the injected selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      // Ensure the scroll position is maintained after focus
      textarea.scrollTop = scrollTop;
    }, 50);
  };

  // Helper inserts
  const insertBold = () => insertText("**", "**", "bold text");
  const insertItalic = () => insertText("_", "_", "italic text");
  const insertHeader = () => insertText("## ", "\n", "Heading");
  const insertCode = () => insertText("```python\n", "\n```\n", "# Python Code");
  const insertLink = () => insertText("[", "](https://example.com)", "Link Text");
  const insertTable = () => insertText(
    "\n| Header 1 | Header 2 |\n| :--- | :---: |\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |\n"
  );
  const insertImage = () => insertText("![Image Alt Text](", ")\n", "https://picsum.photos/800/400");

  // Load standard template
  const loadTemplate = () => {
    if (window.confirm("Are you sure you want to load the template? This will replace your current editor content.")) {
      setEditorText(DEFAULT_BODY);
      setMetadata(DEFAULT_METADATA);
    }
  };

  // Clear editor
  const clearEditor = () => {
    if (window.confirm("Are you sure you want to clear all content inside the editor?")) {
      const emptyMeta = {
        title: "",
        members: "",
        description: "",
        date: "",
        tags: "",
        type: "Project"
      };
      setMetadata(emptyMeta);
      setEditorText("");
    }
  };

  // Export File
  const exportJSONFile = () => {
    const filename = (metadata.title || "maic-project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + ".json";

    const formattedTags = metadata.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const jsonExport = {
      title: metadata.title,
      members: metadata.members,
      description: metadata.description,
      date: metadata.date,
      tags: formattedTags,
      type: metadata.type,
      content: editorText
    };

    const fileContent = JSON.stringify(jsonExport, null, 2);
    const blob = new Blob([fileContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (navigator.maxTouchPoints && (navigator as any).msSaveBlob) {
      // IE10+
      (navigator as any).msSaveBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  // Render body markdown inside previewer
  const bodyMarkdown = editorText;

  return (
    <div style={{ margin: "0", padding: "0" }}>
      <NavBar page="Projects" />
      
      <div className="projects-container">
        <header className="projects-header">
          <h1 className="projects-title">Project Page Creator</h1>
          <p className="projects-subtitle">
            Draft, format, and visualize library submissions in real-time. Export standard markdown packages ready for club verification.
          </p>
        </header>

        {/* Action / Control Bar */}
        <section className="projects-control-bar">
          <div className="control-group">
            <span className="control-label">Layout</span>
            <div className="view-btn-group">
              <button 
                className={`view-btn ${layout === "split" ? "active" : ""}`}
                onClick={() => setLayout("split")}
              >
                <Columns size={16} />
                <span>Split View</span>
              </button>
              <button 
                className={`view-btn ${layout === "editor" ? "active" : ""}`}
                onClick={() => setLayout("editor")}
              >
                <FileText size={16} />
                <span>Editor Only</span>
              </button>
              <button 
                className={`view-btn ${layout === "preview" ? "active" : ""}`}
                onClick={() => setLayout("preview")}
              >
                <Eye size={16} />
                <span>Preview Only</span>
              </button>
            </div>
          </div>

          <div className="control-group">
            <button 
              className="btn-glass btn-export" 
              onClick={exportJSONFile}
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", gap: "0.5rem", borderRadius: "10px" }}
            >
              <Download size={16} />
              <span>Export .JSON File</span>
            </button>
          </div>
        </section>

        {/* Action Status Toasts */}
        {exportSuccess && (
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgb(16, 185, 129)",
              color: "#34d399",
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
              animation: "fadeIn 0.2s ease"
            }}
          >
            <CheckCircle size={18} />
            <span>Success! JSON downloaded successfully. You can upload this file directly to the MAIC site administrator.</span>
          </div>
        )}

        {/* Main Split Panels */}
        <section className={`projects-workspace ${layout}`}>
          {/* Editor Panel */}
          {layout !== "preview" && (
            <article className="panel">
              <div className="panel-header">
                <span className="panel-title">
                  <FileText size={16} color="#8de0fe" />
                  <span>Markdown Workspace</span>
                </span>
                <span style={{ fontSize: "0.75rem", color: "rgb(var(--text-2))" }}>
                  {editorText.length} characters
                </span>
              </div>


              {/* Form Metadata Fields */}
              {showConfig && (
                <div className="metadata-panel">
                  <div className="form-field">
                    <label className="form-label">Project Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={metadata.title}
                      onChange={(e) => handleFormChange({ ...metadata, title: e.target.value })}
                      placeholder="e.g. Drone Obstacle Avoidance"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Members</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={metadata.members}
                      onChange={(e) => handleFormChange({ ...metadata, members: e.target.value })}
                      placeholder="e.g. John Doe, Jane Smith"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Description Summary</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={metadata.description}
                      onChange={(e) => handleFormChange({ ...metadata, description: e.target.value })}
                      placeholder="Short summary for the index card"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={metadata.date}
                      onChange={(e) => handleFormChange({ ...metadata, date: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Tags</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={metadata.tags}
                      onChange={(e) => handleFormChange({ ...metadata, tags: e.target.value })}
                      placeholder="Separated by commas"
                    />
                  </div>
                </div>
              )}

              {/* Editor Toolbar with helpers */}
              <div className="editor-toolbar">
                <button className="toolbar-btn" onClick={insertBold} data-tooltip="Bold">
                  <Bold size={15} />
                </button>
                <button className="toolbar-btn" onClick={insertItalic} data-tooltip="Italic">
                  <Italic size={15} />
                </button>
                <button className="toolbar-btn" onClick={insertHeader} data-tooltip="Heading">
                  <Heading size={15} />
                </button>
                <div className="toolbar-divider" />
                <button className="toolbar-btn" onClick={insertCode} data-tooltip="Code Block">
                  <Code size={15} />
                </button>
                <button className="toolbar-btn" onClick={insertLink} data-tooltip="Insert Link">
                  <LinkIcon size={15} />
                </button>
                <button className="toolbar-btn" onClick={insertTable} data-tooltip="Insert Table">
                  <TableIcon size={15} />
                </button>
                <button className="toolbar-btn" onClick={insertImage} data-tooltip="Insert Image">
                  <ImageIcon size={15} />
                </button>
                <div className="toolbar-divider" />
                <button 
                  className={`toolbar-btn ${showConfig ? "active" : ""}`}
                  onClick={() => setShowConfig(prev => !prev)} 
                  data-tooltip={showConfig ? "Collapse Meta Form" : "Expand Meta Form"}
                  style={{ color: "#8de0fe", marginLeft: "auto" }}
                >
                  <ChevronDown 
                    size={15} 
                    style={{ 
                      transform: showConfig ? "rotate(180deg)" : "none", 
                      transition: "transform 0.2s ease" 
                    }} 
                  />
                </button>
                <button 
                  className="toolbar-btn" 
                  onClick={loadTemplate} 
                  data-tooltip="Reset Template" 
                  style={{ color: "#a3c9f7" }}
                >
                  <RotateCcw size={15} />
                </button>
                <button 
                  className="toolbar-btn" 
                  onClick={clearEditor} 
                  data-tooltip="Clear All" 
                  style={{ color: "#e084ff" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Main Textarea */}
              <div className="editor-body-wrapper">
                <textarea
                  ref={textareaRef}
                  className="markdown-textarea"
                  value={editorText}
                  onChange={handleEditorChange}
                  placeholder="Draft your markdown package here..."
                />
              </div>
            </article>
          )}

          {/* Live Preview Panel */}
          {layout !== "editor" && (
            <article className="panel">
              <div className="panel-header">
                <span className="panel-title">
                  <Eye size={16} color="#e084ff" />
                  <span>Live Preview</span>
                </span>
              </div>

              {/* Rendered Viewport */}
              <div className="preview-body">
                <div className="article">
                  <span className="article-title">
                    <Markdown>{`# ${metadata.title || "Project Title"}`}</Markdown>
                  </span>
                  <Markdown>{`### **Authors / Members:** ${metadata.members || "Author Name(s)"}`}</Markdown>
                  <Markdown>{`### **Published:** ${metadata.date || new Date().toISOString().split("T")[0]}`}</Markdown>
                  <Markdown>{`### **Description:** *${metadata.description || "Brief project summary..."}*`}</Markdown>
                  
                  {bodyMarkdown && (
                    <Markdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex, rehypeRaw]}
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
                        a: ({ node, href, ...props }) => {
                          if (
                            href &&
                            (href.startsWith("http://") ||
                              href.startsWith("https://") ||
                              href.startsWith("mailto:") ||
                              /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href))
                          ) {
                            return <a href={href} {...props} target="_blank" rel="noopener noreferrer" />;
                          }
                          return <a href={href} {...props} />;
                        },
                        img: ({ node, src, alt, ...props }) => {
                          return <img src={src} alt={alt} style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "1rem" }} {...props} />;
                        }
                      }}
                    >
                      {bodyMarkdown}
                    </Markdown>
                  )}
                </div>
              </div>
            </article>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectEditor;
