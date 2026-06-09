import React from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./ProjectPreview.css";

export interface ProjectImageDescriptor {
  filename: string;
  mimeType: string;
}

export interface ProjectThumbnail {
  filename?: string;
  mimeType?: string;
  path?: string;
}

export interface ProjectDocument {
  title: string;
  members: string;
  description: string;
  date: string;
  tags: string[] | string;
  type: string;
  content: string;
  images?: ProjectImageDescriptor[];
  thumbnail?: string | ProjectThumbnail | null;
}

interface ProjectPreviewProps {
  project: ProjectDocument;
  resolveImageSrc?: (src: string) => string;
}

function getThumbnailPath(project: ProjectDocument): string | null {
  if (!project.thumbnail) {
    return null;
  }

  if (typeof project.thumbnail === "string") {
    return project.thumbnail;
  }

  if (project.thumbnail.path) {
    return project.thumbnail.path;
  }

  if (project.thumbnail.filename) {
    return `images/${project.thumbnail.filename}`;
  }

  return null;
}

function resolveImage(source: string, resolveImageSrc?: (src: string) => string): string {
  if (!resolveImageSrc) {
    return source;
  }

  return resolveImageSrc(source);
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ project, resolveImageSrc }) => {
  const displayDate = project.date || new Date().toISOString().split("T")[0];
  const thumbnailPath = getThumbnailPath(project);
  const thumbnailSrc = thumbnailPath ? resolveImage(thumbnailPath, resolveImageSrc) : null;

  return (
    <div className="project-preview article">
      <span className="article-title">
        <Markdown>{`# ${project.title || "Project Title"}`}</Markdown>
      </span>

      <div className="project-preview-header">
        {thumbnailSrc && (
          <div className="project-preview-thumbnail-wrap">
            <img
              src={thumbnailSrc}
              alt={`${project.title || "Project"} thumbnail`}
              className="project-preview-thumbnail"
            />
          </div>
        )}

        <div className="project-preview-meta">
          <Markdown>{`### **Authors / Members:** ${project.members || "Author Name(s)"}`}</Markdown>
          <Markdown>{`### **Published:** ${displayDate}`}</Markdown>
          <Markdown>{`### **Description:** *${project.description || "Brief project summary..."}*`}</Markdown>
        </div>
      </div>

      {project.content && (
        <Markdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            html: ({ node, children, ...props }) => <>{children}</>,
            body: ({ node, children, ...props }) => <>{children}</>,
            head: ({ node, children, ...props }) => <>{children}</>,
            style: () => null,
            link: () => null,
            meta: () => null,
            script: () => null,
            title: () => null,
            h2: ({ ...props }) => {
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
            a: ({ href, ...props }) => {
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
            img: ({ src, alt, ...props }) => {
              const normalizedSrc = typeof src === "string" ? resolveImage(src, resolveImageSrc) : src;
              return (
                <img
                  src={normalizedSrc}
                  alt={alt}
                  style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "1rem" }}
                  {...props}
                />
              );
            },
          }}
        >
          {project.content}
        </Markdown>
      )}
    </div>
  );
};

export default ProjectPreview;
