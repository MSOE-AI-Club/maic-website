import {
  getFileContent,
  getDirectoryContents,
  getRawFileUrl,
  getManifest,
} from "./github-hook";

interface ContentMetadata {
  title: string;
  authors: string;
  type: string;
  img: string;
  date?: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  link?: string;
}

export interface ModalContent {
  [key: string]: ContentMetadata;
}

const contentRootFolders = ["articles", "data", "videos", "workshops"];
let allFiles: string[] | null = null;

async function getAllFiles() {
  if (allFiles) {
    return allFiles;
  }
  const manifestResult = await getManifest();
  if (manifestResult?.files) {
    allFiles = manifestResult.files;
    return allFiles;
  }
  return [];
}

async function findFilePath(contentId: string): Promise<string | null> {
  const files = await getAllFiles();
  const filePath = files.find((path) => path.includes(`${contentId}.md`));
  return filePath || null;
}

function parseDateToMillis(dateStr?: string): number {
  if (!dateStr) return 0;
  const s = String(dateStr).trim();
  // ISO-like
  const iso = Date.parse(s);
  if (!Number.isNaN(iso)) return iso;
  // dd/mm/yyyy or d/m/yyyy
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) {
    const d = parseInt(m1[1], 10);
    const m = parseInt(m1[2], 10) - 1;
    const y = parseInt(m1[3], 10);
    return new Date(y, m, d).getTime();
  }
  // mm/dd/yyyy
  const m2 = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m2) {
    const m = parseInt(m2[1], 10) - 1;
    const d = parseInt(m2[2], 10);
    const y = parseInt(m2[3], 10);
    return new Date(y, m, d).getTime();
  }
  return 0;
}

function normalizeImageAssetPath(rawPath: string): string {
  let path = rawPath.trim();
  // Remove common wrappers or labels
  path = path.replace(/^\[?\s*Image URL:\s*/i, "");
  path = path.replace(/^\[|^\(|\]$|\)$/g, "");
  // Remove quotes
  path = path.replace(/^['\"]|['\"]$/g, "");
  // Drop leading ./ or /
  path = path.replace(/^\.\//, "").replace(/^\//, "");
  // Map legacy img/ paths to images/
  if (path.startsWith("img/thumbnails/")) {
    path = path.replace(/^img\//, "images/");
  }
  if (path.startsWith("img/")) {
    path = path.replace(/^img\//, "images/");
  }
  return path;
}

export async function getContentMetadata(
  contentId: string
): Promise<ContentMetadata | null> {
  const filePath = await findFilePath(contentId);
  if (!filePath) {
    return null;
  }

  // Prefer metadata.json in the same directory as the markdown file
  const dir = filePath.substring(0, filePath.lastIndexOf("/"));
  const sameDirMetadataPath = `${dir}/metadata.json`;
  let metaFromJson: any | null = null;
  const metaJsonContent = await getFileContent(sameDirMetadataPath);
  if (metaJsonContent) {
    try {
      metaFromJson = JSON.parse(metaJsonContent);
    } catch (_) {
      metaFromJson = null;
    }
  } else {
    // Some content stores metadata.json in the parent directory
    const parentDir = dir.substring(0, dir.lastIndexOf("/"));
    const parentMetadataPath = `${parentDir}/metadata.json`;
    const parentMetaContent = await getFileContent(parentMetadataPath);
    if (parentMetaContent) {
      try {
        metaFromJson = JSON.parse(parentMetaContent);
      } catch (_) {
        metaFromJson = null;
      }
    }
  }

  if (metaFromJson) {
    const imageValue: string | undefined = metaFromJson.image || metaFromJson.img;
    const categories: string[] | undefined = Array.isArray(metaFromJson.categories)
      ? metaFromJson.categories.map((c: any) => String(c).trim()).filter((s: string) => s.length > 0)
      : (typeof metaFromJson.categories === 'string'
          ? String(metaFromJson.categories)
              .split(/[;,]/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
          : undefined);
    const metadata: ContentMetadata = {
      title: (metaFromJson.title || "").toString(),
      authors: (metaFromJson.authors || "").toString(),
      type: (metaFromJson.type || "md").toString(),
      img: imageValue ? getRawFileUrl(normalizeImageAssetPath(imageValue)) : "",
      date: metaFromJson.date ? String(metaFromJson.date) : undefined,
      description: metaFromJson.summary || metaFromJson.description || undefined,
      tags: Array.isArray(metaFromJson.tags)
        ? metaFromJson.tags.map((t: any) => String(t))
        : (typeof metaFromJson.tags === 'string' ? String(metaFromJson.tags).split(',').map((t: string) => t.trim()) : undefined),
      categories,
      link: typeof metaFromJson.link === 'string' ? metaFromJson.link : undefined,
    };
    return metadata;
  }

  // Fallback: parse simple key: value lines from the markdown file
  const content = await getFileContent(filePath);
  if (!content) {
    return null;
  }

  const lines = content.split("\n");
  const metadata: Partial<ContentMetadata> = {};

  for (const line of lines) {
    if (line.startsWith("title:")) {
      metadata.title = line.substring(6).trim();
    } else if (line.startsWith("authors:")) {
      metadata.authors = line.substring(8).trim();
    } else if (line.startsWith("type:")) {
      metadata.type = line.substring(5).trim();
    } else if (line.startsWith("image:")) {
      const imgRaw = line.substring(6).trim();
      const imgPath = normalizeImageAssetPath(imgRaw);
      metadata.img = getRawFileUrl(imgPath) || "";
    } else if (line.toLowerCase().startsWith("date:")) {
      metadata.date = line.substring(5).trim();
    } else if (line.toLowerCase().startsWith("summary:") || line.toLowerCase().startsWith("description:")) {
      const text = line.split(":")[1];
      if (text) metadata.description = text.trim();
    } else if (line.toLowerCase().startsWith("tags:")) {
      const raw = line.substring(5).trim();
      metadata.tags = raw.split(',').map((t) => t.trim());
    } else if (line.toLowerCase().startsWith("link:") || line.toLowerCase().startsWith("url:")) {
      const url = line.split(":")[1];
      if (url) metadata.link = url.trim();
    } else if (line.toLowerCase().startsWith("categories:")) {
      const raw = line.substring(11).trim();
      metadata.categories = raw.split(',').map((c) => c.trim());
    }
  }

  // Default type if not found
  if (!metadata.type) metadata.type = "md";
  // Derive brief description if still missing: grab first non-empty paragraph
  if (!metadata.description) {
    const body = lines.join("\n");
    const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length > 0) {
      metadata.description = paragraphs[0].replace(/^#+\s*/g, "").slice(0, 240);
    }
  }
  return metadata as ContentMetadata;
}

export async function getTags(): Promise<string[]> {
  const tags = new Set<string>();
  for (const folder of contentRootFolders) {
    const contents = await getDirectoryContents(folder);
    if (contents) {
      contents.forEach((item) => {
        if (item.type === "dir") {
          tags.add(item.name);
        }
      });
    }
  }
  return Array.from(tags);
}

export async function getFeaturedModals() {
  const modals = [
    {
      title: "Featured Research",
      tags: ["Research"],
      content_ids: [
        "Research-50NourishNet",
        "Research-50Silent-Sound-Synthesizers",
        "Research-50Brain-Alignment-Innovators",
      ],
      type: "decorative",
    },
    {
      title: "Featured Articles",
      tags: ["Articles"],
      content_ids: [
        "001_What_is_the_Learning_Tree",
        "010_What_is_a_NN",
        "Learning_Resources-how-to-use-jupyter-notebooks",
      ],
      type: "decorative",
    },
    {
      title: "Featured Videos",
      tags: ["Videos"],
      content_ids: [
        "Video-Rosie_23_Competiton",
        "Video-Rosie_24_Competiton",
        "Video-NVIDIA_QA_Panel_MAIC_Speaker_Series",
        "Video-Web_Scraping",
      ],
      type: "decorative",
    },
  ];

  const processedModals = await Promise.all(
    modals.map(async (modal) => {
      const contentWithMetadata = await Promise.all(
        modal.content_ids.map(async (id) => {
          const metadata = await getContentMetadata(id);
          return { [id]: metadata };
        })
      );
      return { ...modal, content_ids: contentWithMetadata };
    })
  );

  return processedModals;
}

export async function getTaggedContent(
  tag: string
): Promise<ModalContent[]> {
  if (!tag) {
    return [];
  }

  const taggedContent: ModalContent[] = [];
  const files = await getAllFiles();
  const filteredFiles = files.filter(
    (file) =>
      file.includes(`/${tag}/`) && file.endsWith(".md")
  );

  for (const file of filteredFiles) {
    const contentId = file.split("/").pop()?.replace(".md", "") || "";
    if (contentId) {
      const metadata = await getContentMetadata(contentId);
      if (metadata) {
        taggedContent.push({ [contentId]: metadata });
      }
    }
  }

  return taggedContent;
}

export async function getSubsectionModals(subsectionName: string) {
  if (!subsectionName || subsectionName === "Featured") {
    return getFeaturedModals();
  }

  if (subsectionName === "Research") {
    const files = await getAllFiles();
    // Support legacy (Anchor/Markdown) and new (flat per-project) structures
    const legacyAnchorPaths = files.filter(
      (p) => p.startsWith("articles/research/") && p.endsWith("/Anchor/metadata.json")
    );
    const flatProjectAnchors = files.filter(
      (p) =>
        p.startsWith("articles/research/") &&
        p.endsWith("/metadata.json") &&
        !p.includes("/Anchor/") &&
        !p.includes("/Markdown/") &&
        !/\/Team-\d+\//.test(p)
    );
    const anchorMetadataPaths = [...legacyAnchorPaths, ...flatProjectAnchors];

    const researchModals = await Promise.all(
      anchorMetadataPaths.map(async (metadataPath) => {
        const metaContent = await getFileContent(metadataPath);
        if (!metaContent) return null;
        let meta: any;
        try {
          meta = JSON.parse(metaContent);
        } catch {
          return null;
        }

        // Discover associated Markdown files
        let markdownIds: string[] = [];
        if (metadataPath.includes("/Anchor/metadata.json")) {
          const markdownDir = metadataPath.replace("/Anchor/metadata.json", "/Markdown/");
          markdownIds = files
            .filter((p) => p.startsWith(markdownDir) && p.endsWith(".md"))
            .map((p) => p.split("/").pop() as string)
            .map((name) => name.replace(/\.md$/i, ""));
        } else {
          const projectDir = metadataPath.replace(/\/metadata\.json$/, "");
          markdownIds = files
            .filter((p) => p.startsWith(projectDir + "/") && p.endsWith(".md"))
            .map((p) => p.split("/").pop() as string)
            .map((name) => name.replace(/\.md$/i, ""));
        }

        // Try to find a Team-*/*/metadata.json that likely holds a paper link
        let discoveredPaperUrl: string | undefined;
        const parts = metadataPath.split("/");
        const yearDir = metadataPath.includes("/Anchor/")
          ? parts.slice(0, -3).join("/")
          : parts.slice(0, -2).join("/"); // .../<Year>
        const teamMetaFiles = files.filter((p) => p.startsWith(yearDir + "/Team-") && p.endsWith("/metadata.json"));
        // Titles in the anchor that can help us match (meta.files may list associated paper titles)
        const filesList: string[] = Array.isArray(meta.files)
          ? meta.files
          : (typeof meta.files === 'string' ? [meta.files] : []);
        const norm = (s: string) => s.toLowerCase().trim();
        for (const metaPath of teamMetaFiles) {
          const c = await getFileContent(metaPath);
          if (!c) continue;
          try {
            const j = JSON.parse(c);
            const candidateUrl: string | undefined = j.pdf || j.link || j.url;
            const title: string = String(j.title || '');
            if (!candidateUrl) continue;
            if (filesList.length === 0) {
              // Weak match: title contains project title
              if (norm(title).includes(norm(meta.title || ''))) {
                discoveredPaperUrl = candidateUrl; break;
              }
            } else {
              // Strong match: team title matches one of files listed in anchor
              const matched = filesList.some((f) => norm(title) === norm(String(f)) || norm(title).includes(norm(String(f))));
              if (matched) { discoveredPaperUrl = candidateUrl; break; }
            }
          } catch { /* ignore and continue */ }
        }

        const contentWithMetadata = await Promise.all(
          markdownIds.map(async (id) => {
            const itemMeta = await getContentMetadata(id);
            return { [id]: itemMeta } as ModalContent;
          })
        );

        // Optional fields from anchor metadata.json
        const tagsFromMeta: string[] = Array.isArray(meta.tags)
          ? meta.tags
          : (typeof meta.tags === 'string' ? meta.tags.split(',').map((t: string) => t.trim()) : []);
        const technologies: string[] = Array.isArray(meta.technologies) ? meta.technologies : [];
        const tags = (tagsFromMeta.length ? tagsFromMeta : technologies);
        const progressRaw = meta.progress ?? meta.completion ?? meta.percentComplete;
        const progress = typeof progressRaw === 'number' ? progressRaw : (typeof progressRaw === 'string' ? parseFloat(progressRaw) : undefined);
        const status = meta.status || (meta.active ? 'Active' : undefined);
        const featured = !!meta.featured;
        const team: string[] = Array.isArray(meta.team) ? meta.team : (Array.isArray(meta.members) ? meta.members : []);
        const repoUrl: string | undefined = meta.repo || meta.github || meta.code || undefined;
        let paperUrlVal: string | undefined = meta.paper || meta.publication || meta.paperUrl || undefined;
        const membersCount: number | undefined = typeof meta.memberCount === 'number' ? meta.memberCount : (team?.length || undefined);
        const publicationsCount: number | undefined = typeof meta.publications === 'number' ? meta.publications : (contentWithMetadata.length || undefined);

        // Derive a paper URL from first child markdown's link or explicit field
        if (!paperUrlVal && discoveredPaperUrl) {
          paperUrlVal = discoveredPaperUrl;
        }
        if (!paperUrlVal && contentWithMetadata.length > 0) {
          const firstId = Object.keys(contentWithMetadata[0])[0];
          const firstMeta = contentWithMetadata[0][firstId];
          if (firstMeta?.link) paperUrlVal = firstMeta.link;
        }

        return {
          title: meta.title || "",
          tags,
          type: "descriptive",
          content_ids: contentWithMetadata,
          img: meta.image ? getRawFileUrl(normalizeImageAssetPath(meta.image)) : "",
          date: meta.date || "",
          description: meta.summary || "",
          authors: meta.authors || "",
          progress,
          status,
          featured,
          team,
          repoUrl,
          paperUrl: paperUrlVal,
          membersCount,
          publicationsCount,
        };
      })
    );

    return researchModals.filter(Boolean);
  }

  // Handle other subsections
  const top = await getDirectoryContents(`${subsectionName.toLowerCase()}`);
  const tags = top?.filter((item) => item.type === "dir");
  if (!tags) return [];

  const allFiles = await getAllFiles();

  const subsectionModals = await Promise.all(
    tags.map(async (tag) => {
      const contentIds = allFiles
        .filter((p) => p.startsWith(`${tag.path}/`) && p.endsWith(".md"))
        .map((p) => p.split("/").pop() as string)
        .map((name) => name.replace(/\.md$/i, ""));

      const contentWithMetadata = await Promise.all(
        contentIds.map(async (id) => {
          const metadata = await getContentMetadata(id);
          return { [id]: metadata } as ModalContent;
        })
      );

      return {
        title: tag.name,
        tags: [],
        content_ids: contentWithMetadata,
        type: "default",
      };
    })
  );

  return subsectionModals;
}

// ---------- Aggregation helpers for Library landing ----------

export async function getTotalResourceCount(): Promise<number> {
  const files = await getAllFiles();
  // Count all markdown content items
  return files.filter((p) => p.endsWith(".md")).length;
}

// Articles helpers
export async function getArticlesByType(type: string): Promise<ModalContent[]> {
  if (!type) return [];
  const files = await getAllFiles();
  const filtered = files.filter((p) => p.startsWith(`articles/${type}/`) && p.endsWith('.md'));
  const out: ModalContent[] = [];
  for (const p of filtered) {
    const id = p.split('/').pop()?.replace(/\.md$/i, '') || '';
    if (!id) continue;
    const meta = await getContentMetadata(id);
    if (meta) out.push({ [id]: meta });
  }
  // Sort by date desc when available
  out.sort((a, b) => {
    const aId = Object.keys(a)[0];
    const bId = Object.keys(b)[0];
    const ad = parseDateToMillis(a[aId]?.date);
    const bd = parseDateToMillis(b[bId]?.date);
    return bd - ad;
  });
  return out;
}

export async function getAllArticles(): Promise<ModalContent[]> {
  const files = await getAllFiles();
  const filtered = files.filter((p) =>
    p.startsWith("articles/") &&
    !p.startsWith("articles/research/") &&
    p.endsWith(".md")
  );
  const out: ModalContent[] = [];
  for (const p of filtered) {
    const id = p.split('/').pop()?.replace(/\.md$/i, '') || '';
    if (!id) continue;
    const meta = await getContentMetadata(id);
    if (meta) out.push({ [id]: meta });
  }
  out.sort((a, b) => {
    const aId = Object.keys(a)[0];
    const bId = Object.keys(b)[0];
    const ad = parseDateToMillis(a[aId]?.date);
    const bd = parseDateToMillis(b[bId]?.date);
    return bd - ad;
  });
  return out;
}

async function countMarkdownUnder(prefix: string): Promise<number> {
  const files = await getAllFiles();
  return files.filter((p) => p.startsWith(prefix) && p.endsWith(".md")).length;
}

export async function getVideosCount(): Promise<number> {
  return countMarkdownUnder("videos/");
}

export async function getWorkshopsCount(): Promise<number> {
  return countMarkdownUnder("workshops/");
}

export async function getEventArticlesCount(): Promise<number> {
  // Event articles are stored under articles/news
  return countMarkdownUnder("articles/news/");
}

export async function getMemberLearningsCount(): Promise<number> {
  const files = await getAllFiles();
  return files.filter((p) =>
    p.startsWith("articles/") &&
    p.endsWith(".md") &&
    !p.startsWith("articles/research/") &&
    !p.startsWith("articles/news/")
  ).length;
}

// Count of top-level articles (non-news, non-research)
// Total markdown articles across all article sections including research publications
export async function getArticlesCount(): Promise<number> {
  const files = await getAllFiles();
  return files.filter((p) => p.startsWith("articles/") && p.endsWith(".md")).length;
}

// Count of competition markdowns under competitions/*/*
export async function getCompetitionsCount(): Promise<number> {
  const files = await getAllFiles();
  return files.filter((p) => p.startsWith("competitions/") && p.endsWith(".md")).length;
}

export async function getResearchProjectCount(): Promise<number> {
  const files = await getAllFiles();
  // Count both legacy Anchor-style projects and flat per-project metadata.json entries
  const legacyAnchorPaths = files.filter(
    (p) => p.startsWith("articles/research/") && p.endsWith("/Anchor/metadata.json")
  );
  const flatProjectAnchors = files.filter(
    (p) =>
      p.startsWith("articles/research/") &&
      p.endsWith("/metadata.json") &&
      !p.includes("/Anchor/") &&
      !p.includes("/Markdown/") &&
      !/\/Team-\d+\//.test(p)
  );
  return legacyAnchorPaths.length + flatProjectAnchors.length;
}

// Count research projects for the most recent school year found in metadata
export async function getLatestSchoolYearResearchProjectCount(): Promise<number> {
  const files = await getAllFiles();
  const anchorMetadataPaths = files.filter(
    (p) => p.startsWith("articles/research/") && p.endsWith("/Anchor/metadata.json")
  );
  if (anchorMetadataPaths.length === 0) return 0;

  const yearToCount = new Map<number, number>();

  function extractStartYear(dateStr?: string, fallbackPath?: string): number {
    if (typeof dateStr === "string" && dateStr.trim().length > 0) {
      const s = dateStr.trim();
      const mRange = s.match(/(\d{4})\s*-\s*(\d{4})/);
      if (mRange) {
        return parseInt(mRange[1], 10);
      }
      const mYear = s.match(/(\d{4})/);
      if (mYear) return parseInt(mYear[1], 10);
    }
    // Fallback: try to infer a year segment from path e.g., articles/research/2024-2025/... or /2024/
    if (typeof fallbackPath === 'string') {
      const pr = fallbackPath.match(/articles\/research\/(\d{4})(?:\s*-\s*(\d{4}))?\//);
      if (pr) return parseInt(pr[1], 10);
      const yr = fallbackPath.match(/(\d{4})/);
      if (yr) return parseInt(yr[1], 10);
    }
    return 0;
  }

  for (const metaPath of anchorMetadataPaths) {
    const raw = await getFileContent(metaPath);
    if (!raw) continue;
    try {
      const meta = JSON.parse(raw);
      const startYear = extractStartYear(meta?.date, metaPath);
      if (startYear > 0) {
        yearToCount.set(startYear, (yearToCount.get(startYear) || 0) + 1);
      }
    } catch {
      // ignore malformed json
    }
  }

  if (yearToCount.size === 0) {
    // Fallback to total if we couldn't extract any years
    return anchorMetadataPaths.length;
  }

  const latestStartYear = Array.from(yearToCount.keys()).sort((a, b) => b - a)[0];
  return yearToCount.get(latestStartYear) || 0;
}

export interface ClubEventItem {
  title: string;
  type: string;
  date: string; // ISO date string
}

export async function getRecentEvents(limit = 3): Promise<ClubEventItem[]> {
  try {
    const content = await getFileContent("data/events/events.json");
    if (!content) return [];
    const json = JSON.parse(content) as ClubEventItem[];
    return json
      .filter((e) => !!e.date)
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
      .slice(0, limit);
  } catch (_) {
    return [];
  }
}

// Count of E-Board members from data/contact/eboard.json
export async function getEboardMembersCount(): Promise<number> {
  try {
    const content = await getFileContent("data/contact/eboard.json");
    if (!content) return 0;
    const arr = JSON.parse(content);
    return Array.isArray(arr) ? arr.length : 0;
  } catch (_) {
    return 0;
  }
}