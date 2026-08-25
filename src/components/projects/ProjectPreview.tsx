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
  members: string | string[];
  description: string;
  date: string;
  tags: string[] | string;
  type: string;
  content: string;
  images?: ProjectImageDescriptor[];
  thumbnail?: string | ProjectThumbnail | null;
}

export function getProjectMembers(members: ProjectDocument["members"]): string[] {
  return Array.isArray(members) ? members : members.split(",").map((member) => member.trim()).filter(Boolean);
}

export function getProjectTags(tags: ProjectDocument["tags"]): string[] {
  return Array.isArray(tags) ? tags : tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

interface ProjectPreviewProps {
  project: ProjectDocument;
  resolveImageSrc?: (src: string) => string;
}

export const ProjectHeader: React.FC<{ project: ProjectDocument; resolveImageSrc?: (src: string) => string }> = ({ project, resolveImageSrc }) => {
  const displayDate = project.date || new Date().toISOString().split("T")[0];
  const thumbnailPath = getThumbnailPath(project);
  const thumbnailSrc = thumbnailPath ? resolveImage(thumbnailPath, resolveImageSrc) : null;

  return (
    <div className="project-preview-header">
      {thumbnailSrc && (
        <div className="project-preview-thumbnail-wrap">
          <img src={thumbnailSrc} alt={`${project.title || "Project"} thumbnail`} className="project-preview-thumbnail" />
        </div>
      )}
      <div className="project-preview-meta">
        <h1 className="project-preview-title">{project.title || "Project Title"}</h1>
        <p><strong>Authors / Members:</strong> {getProjectMembers(project.members).join(", ") || "Author Name(s)"}</p>
        <p><strong>Published:</strong> {displayDate}</p>
        <p><strong>Description:</strong> <em>{project.description || "Brief project summary..."}</em></p>
        {getProjectTags(project.tags).length > 0 && (
          <div className="project-preview-tags" aria-label="Project tags">
            {getProjectTags(project.tags).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
      </div>
    </div>
  );
};

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
  return (
    <div className="project-preview article">
      <ProjectHeader project={project} resolveImageSrc={resolveImageSrc} />

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
