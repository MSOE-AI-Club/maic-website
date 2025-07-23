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
}

export interface ModalContent {
  [key: string]: ContentMetadata;
}

const contentRootFolders = ["articles", "data"];
let allFiles: string[] | null = null;

async function getAllFiles() {
  if (allFiles) {
    return allFiles;
  }
  const manifestResult = await getManifest();
  if (manifestResult?.manifest.files) {
    allFiles = manifestResult.manifest.files;
    return allFiles;
  }
  return [];
}

async function findFilePath(contentId: string): Promise<string | null> {
  const files = await getAllFiles();
  const filePath = files.find((path) => path.includes(`${contentId}.md`));
  return filePath || null;
}

export async function getContentMetadata(
  contentId: string
): Promise<ContentMetadata | null> {
  const filePath = await findFilePath(contentId);
  if (!filePath) {
    return null;
  }

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
      const imgPath = line.substring(6).trim();
      metadata.img = (await getRawFileUrl(imgPath)) || "";
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
    const researchFiles = (await getDirectoryContents("articles/research"))?.filter(
      (item) => item.type === "file" && item.path.endsWith(".md")
    );
    if (!researchFiles) {
      return [];
    }

    const researchModals = await Promise.all(
      researchFiles.map(async (file) => {
        const content = await getFileContent(file.path);
        if (!content) return null;

        const lines = content.split("\n");
        const title = lines.find(l => l.startsWith("title:"))?.replace("title:", "").trim() || "";
        const imgPath = lines.find(l => l.startsWith("image:"))?.replace("image:", "").trim() || "";
        const date = lines.find(l => l.startsWith("date:"))?.replace("date:", "").trim() || "";
        const description = lines.find(l => l.startsWith("summary:"))?.replace("summary:", "").trim() || "";
        const authors = lines.find(l => l.startsWith("authors:"))?.replace("authors:", "").trim() || "";
        const filesLine = lines.find(l => l.startsWith("files:"))?.replace("files:", "").trim() || "";
        const contentIds = filesLine ? filesLine.split(",").map(f => f.trim()) : [];
        
        const contentWithMetadata = await Promise.all(
          contentIds.map(async (id) => {
            const metadata = await getContentMetadata(id);
            return { [id]: metadata };
          })
        );
        
        const imageUrl = await getRawFileUrl(imgPath);

        return {
          title,
          tags: [],
          type: "descriptive",
          content_ids: contentWithMetadata,
          img: imageUrl,
          date,
          description,
          authors,
        };
      })
    );
    return researchModals.filter(Boolean);
  }

  // Handle other subsections
  const files = await getDirectoryContents(`${subsectionName.toLowerCase()}`);
  const tags = files?.filter(item => item.type === 'dir');

  if(!tags) return [];

  const subsectionModals = await Promise.all(
    tags.map(async (tag) => {
      const contentItems = await getDirectoryContents(tag.path);
      const contentIds = contentItems?.filter(item => item.type === 'file' && item.path.endsWith('.md')).map(item => item.name.replace('.md', '')) || [];
      
      const contentWithMetadata = await Promise.all(
        contentIds.map(async (id) => {
          const metadata = await getContentMetadata(id);
          return { [id]: metadata };
        })
      );

      return {
        title: tag.name,
        tags: [],
        content_ids: contentWithMetadata,
        type: 'default'
      }
    })
  );

  return subsectionModals;
}

// ... (rest of the content will be added in subsequent steps) 