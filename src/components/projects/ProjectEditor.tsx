import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import ProjectPreview, { type ProjectDocument } from "./ProjectPreview";
import "./ProjectEditor.css";

// Lucide React Icons
import {
  Columns,
  FileText,
  Eye,
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
  ChevronDown,
  Upload
} from "lucide-react";

interface ProjectEditorProps {
  embedded?: boolean;
}

interface Metadata {
  title: string;
  members: string;
  description: string;
  date: string;
  tags: string;
  type: string;
}

interface EmbeddedImage {
  filename: string;
  mimeType: string;
  dataUrl: string;
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

const getImageExtension = (file: File) => {
  const mimeExtension = file.type.split("/")[1]?.toLowerCase();
  if (!mimeExtension) {
    return "png";
  }

  if (mimeExtension === "jpeg") {
    return "jpg";
  }

  return mimeExtension;
};

const readImageAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });

const ProjectEditor: React.FC<ProjectEditorProps> = ({ embedded = false }) => {
  const [layout, setLayout] = useState<"split" | "editor" | "preview">("split");
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA);
  const [editorText, setEditorText] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [embeddedImages, setEmbeddedImages] = useState<EmbeddedImage[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<EmbeddedImage | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const nextImageIndexRef = useRef<number>(1);
  const zipInputRef = useRef<HTMLInputElement>(null);


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

  const resetEmbeddedImages = () => {
    setEmbeddedImages([]);
    setThumbnailImage(null);
    nextImageIndexRef.current = 1;
  };

  const insertMarkdownAtSelection = (markdown: string, start?: number, end?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const selectionStart = start ?? textarea.selectionStart;
    const selectionEnd = end ?? textarea.selectionEnd;

    setEditorText((currentText) => currentText.slice(0, selectionStart) + markdown + currentText.slice(selectionEnd));

    window.setTimeout(() => {
      textarea.focus();
      const cursorPosition = selectionStart + markdown.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const addImageFiles = async (files: File[], selectionStart?: number, selectionEnd?: number) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      return;
    }

    const textarea = textareaRef.current;
    let insertionStart = selectionStart ?? textarea?.selectionStart ?? editorText.length;
    let insertionEnd = selectionEnd ?? textarea?.selectionEnd ?? editorText.length;

    for (const file of imageFiles) {
      const imageDataUrl = await readImageAsDataUrl(file);
      const extension = getImageExtension(file);
      const filename = `image${nextImageIndexRef.current}.${extension}`;
      nextImageIndexRef.current += 1;

      const markdown = `![${filename}](images/${filename})`;
      setEmbeddedImages((currentImages) => [
        ...currentImages,
        {
          filename,
          mimeType: file.type || "image/*",
          dataUrl: imageDataUrl
        }
      ]);

      insertMarkdownAtSelection(`${markdown}\n`, insertionStart, insertionEnd);
      insertionStart += markdown.length + 1;
      insertionEnd = insertionStart;
    }
  };

  const handleImageBrowse = () => {
    imageInputRef.current?.click();
  };

  const handleThumbnailBrowse = () => {
    thumbnailInputRef.current?.click();
  };

  const clearThumbnail = () => {
    setThumbnailImage(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) {
      return;
    }

    const textarea = textareaRef.current;
    await addImageFiles(files, textarea?.selectionStart, textarea?.selectionEnd);
    e.target.value = "";
  };

  const handleThumbnailInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const imageDataUrl = await readImageAsDataUrl(file);
    const extension = getImageExtension(file);
    const filename = `thumbnail.${extension}`;

    setThumbnailImage({
      filename,
      mimeType: file.type || "image/*",
      dataUrl: imageDataUrl,
    });

    e.target.value = "";
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.dataTransfer.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!imageFiles.length) {
      return;
    }

    e.preventDefault();
    const textarea = textareaRef.current;
    await addImageFiles(imageFiles, textarea?.selectionStart, textarea?.selectionEnd);
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items ?? []);
    const pastedImages = items
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (!pastedImages.length) {
      return;
    }

    e.preventDefault();
    const textarea = textareaRef.current;
    await addImageFiles(pastedImages, textarea?.selectionStart, textarea?.selectionEnd);
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

  // Load standard template
  const loadTemplate = () => {
    if (window.confirm("Are you sure you want to load the template? This will replace your current editor content.")) {
      setEditorText(DEFAULT_BODY);
      setMetadata(DEFAULT_METADATA);
      resetEmbeddedImages();
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
      resetEmbeddedImages();
    }
  };

  // Export File
  const exportJSONFile = async () => {
    const metadataFilename = "metadata.json";
    const zipFilename = ((metadata.title || "maic-project")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "maic-project") + ".zip";

    const formattedTags = metadata.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const packagedImages = [...embeddedImages];
    if (thumbnailImage && !packagedImages.some((image) => image.filename === thumbnailImage.filename)) {
      packagedImages.push(thumbnailImage);
    }

    const jsonExport = {
      title: metadata.title,
      members: metadata.members,
      description: metadata.description,
      date: metadata.date,
      tags: formattedTags,
      type: metadata.type,
      content: editorText,
      thumbnail: thumbnailImage
        ? {
          filename: thumbnailImage.filename,
          mimeType: thumbnailImage.mimeType,
          path: `images/${thumbnailImage.filename}`,
        }
        : null,
      images: packagedImages.map((image) => ({
        filename: image.filename,
        mimeType: image.mimeType
      }))
    };

    try {
      const zip = new JSZip();
      zip.file(metadataFilename, JSON.stringify(jsonExport, null, 2));

      const imagesFolder = zip.folder("images");
      if (imagesFolder) {
        for (const image of packagedImages) {
          const base64Data = image.dataUrl.split(",")[1];
          imagesFolder.file(image.filename, base64Data, { base64: true });
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");

      if (navigator.maxTouchPoints && (navigator as any).msSaveBlob) {
        (navigator as any).msSaveBlob(blob, zipFilename);
      } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", zipFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (error) {
      console.error("Failed to export project package", error);
      window.alert("Unable to export the project package. Please try again.");
    }
  };

  const handleImportBrowse = () => {
    zipInputRef.current?.click();
  };

  const handleImportInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);
      const metadataFile = zip.file("metadata.json");
      if (!metadataFile) {
        window.alert("Invalid project package: metadata.json not found in the ZIP.");
        e.target.value = "";
        return;
      }

      const metadataContent = await metadataFile.async("string");
      const parsed = JSON.parse(metadataContent);

      // Extract metadata fields
      const newMetadata: Metadata = {
        title: parsed.title || "",
        members: parsed.members || "",
        description: parsed.description || "",
        date: parsed.date || "",
        tags: Array.isArray(parsed.tags) ? parsed.tags.join(", ") : (parsed.tags || ""),
        type: parsed.type || "Project",
      };

      const content = parsed.content || "";

      // Load images
      const loadedEmbeddedImages: EmbeddedImage[] = [];
      let loadedThumbnail: EmbeddedImage | null = null;
      let maxImageIdx = 0;

      if (parsed.thumbnail && parsed.thumbnail.filename) {
        const thumbFilename = parsed.thumbnail.filename;
        const thumbPath = parsed.thumbnail.path || `images/${thumbFilename}`;
        const thumbFileInZip = zip.file(thumbPath);
        if (thumbFileInZip) {
          const base64Data = await thumbFileInZip.async("base64");
          const mimeType = parsed.thumbnail.mimeType || "image/*";
          loadedThumbnail = {
            filename: thumbFilename,
            mimeType,
            dataUrl: `data:${mimeType};base64,${base64Data}`,
          };
        }
      }

      if (Array.isArray(parsed.images)) {
        for (const imgDesc of parsed.images) {
          if (imgDesc.filename) {
            const imgPath = `images/${imgDesc.filename}`;
            const imgFileInZip = zip.file(imgPath);
            if (imgFileInZip) {
              const base64Data = await imgFileInZip.async("base64");
              const mimeType = imgDesc.mimeType || "image/*";
              loadedEmbeddedImages.push({
                filename: imgDesc.filename,
                mimeType,
                dataUrl: `data:${mimeType};base64,${base64Data}`,
              });

              // Track image index
              const match = imgDesc.filename.match(/image(\d+)\./);
              if (match) {
                const idx = parseInt(match[1], 10);
                if (idx > maxImageIdx) {
                  maxImageIdx = idx;
                }
              }
            }
          }
        }
      }

      setMetadata(newMetadata);
      setEditorText(content);
      setThumbnailImage(loadedThumbnail);
      setEmbeddedImages(loadedEmbeddedImages);
      nextImageIndexRef.current = maxImageIdx + 1;

      window.alert("Project package imported successfully!");
    } catch (err) {
      console.error("Failed to import ZIP package", err);
      window.alert("Failed to parse project package ZIP file. Check console for details.");
    } finally {
      e.target.value = "";
    }
  };

  const resolveEditorImageSrc = (src: string): string => {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(src) || src.startsWith("data:")) {
      return src;
    }

    if (src.startsWith("images/")) {
      const allImages = thumbnailImage ? [thumbnailImage, ...embeddedImages] : embeddedImages;
      const matched = allImages.find((image) => `images/${image.filename}` === src);
      if (matched) {
        return matched.dataUrl;
      }
    }

    return src;
  };

  const previewDocument: ProjectDocument = {
    title: metadata.title,
    members: metadata.members,
    description: metadata.description,
    date: metadata.date,
    tags: metadata.tags,
    type: metadata.type,
    content: editorText,
    thumbnail: thumbnailImage ? { filename: thumbnailImage.filename, path: `images/${thumbnailImage.filename}` } : null,
  };

  return (
    <div className={`projects-container ${embedded ? "projects-container-embedded" : ""}`}>

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

        <div className="control-group" style={{ gap: "0.5rem" }}>
          <button
            className="btn-glass btn-secondary-glass"
            onClick={handleImportBrowse}
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", gap: "0.5rem", borderRadius: "10px", display: "flex", alignItems: "center" }}
          >
            <Upload size={16} />
            <span>Import .ZIP File</span>
          </button>
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            onChange={handleImportInputChange}
            style={{ display: "none" }}
          />

          <button
            className="btn-glass btn-export"
            onClick={exportJSONFile}
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", gap: "0.5rem", borderRadius: "10px", display: "flex", alignItems: "center" }}
          >
            <Download size={16} />
            <span>Export .ZIP File</span>
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
          <span>Success! ZIP downloaded successfully with the JSON file and images folder.</span>
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
                <div className="form-field">
                  <label className="form-label">Thumbnail</label>
                  <div className="thumbnail-controls">
                    <button className="thumbnail-btn" type="button" onClick={handleThumbnailBrowse}>
                      Choose Thumbnail
                    </button>
                    <button className="thumbnail-btn thumbnail-btn-clear" type="button" onClick={clearThumbnail}>
                      Clear
                    </button>
                  </div>
                  <span className="thumbnail-file-label">
                    {thumbnailImage ? thumbnailImage.filename : "No thumbnail selected"}
                  </span>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailInputChange}
                    style={{ display: "none" }}
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
              <button className="toolbar-btn" onClick={handleImageBrowse} data-tooltip="Add Image Files">
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
                onDrop={handleTextareaDrop}
                onPaste={handleTextareaPaste}
                onDragOver={(e) => e.preventDefault()}
                placeholder="Draft your markdown package here..."
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageInputChange}
                style={{ display: "none" }}
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
              <ProjectPreview project={previewDocument} resolveImageSrc={resolveEditorImageSrc} />
            </div>
          </article>
        )}
      </section>
    </div>
  );
};

export default ProjectEditor;
