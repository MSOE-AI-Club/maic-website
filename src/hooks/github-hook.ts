// Base URL for the MAIC Content CDN
const CDN_BASE_URL = "https://msoe-ai-club.github.io/maic-content";
// Interface for the manifest.json structure
interface Manifest {
  generated_at: string;
  files: string[];
}

// Simple in-memory cache so we only fetch the manifest once per session
let cachedManifest: Manifest | null = null;

export interface GitHubContentItem {
  name: string;
  path: string;
  sha?: string; // Optional: Not available from manifest
  size?: number; // Optional: Not available from manifest
  type: "file" | "dir";
  download_url: string | null;
  html_url: string;
}

// Fetch (and cache) the manifest.json from the CDN
export async function getManifest(): Promise<Manifest | null> {
  if (cachedManifest) {
    return cachedManifest;
  }

  const manifestUrl = `${CDN_BASE_URL}/manifest.json`;

  try {
    const response = await fetch(manifestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error(
        `Error fetching manifest.json from CDN: ${response.status} ${response.statusText}`
      );
      console.error(`Attempted URL: ${manifestUrl}`);
      const errorBody = await response.text();
      console.error("Error body (if any):", errorBody);
      return null;
    }

    const manifestData = await response.json();

    // Validate manifest structure
    if (!manifestData || !Array.isArray(manifestData.files) || typeof manifestData.generated_at !== "string") {
      console.error("Invalid manifest format:", manifestData);
      return null;
    }

    cachedManifest = manifestData as Manifest;
    return cachedManifest;
  } catch (error) {
    console.error("An unexpected error occurred while fetching manifest:", error);
    return null;
  }
}


export async function getDirectoryContents(
  directoryPath: string
): Promise<GitHubContentItem[] | null> {
  const manifest = await getManifest();
  if (!manifest) {
    console.error(
      "Error: Could not retrieve manifest to list directory contents."
    );
    return null;
  }

  const items: GitHubContentItem[] = [];
  const foundDirs = new Set<string>();

  const normalizedPath = directoryPath.trim();
  // Ensure prefix ends with a slash if it's not the root path.
  // For root path (empty string or "."), prefix should be empty to match files at the root.
  const prefix = (normalizedPath === "" || normalizedPath === ".") ? "" : (normalizedPath.endsWith("/") ? normalizedPath : normalizedPath + "/");

  for (const filePath of manifest.files) {
    if (filePath.startsWith(prefix)) {
      const relativePath = filePath.substring(prefix.length);
      if (relativePath === "") continue; // Skip if filePath itself is the prefix

      const slashIndex = relativePath.indexOf("/");

      if (slashIndex === -1) { // It's a file
        items.push({
          name: relativePath,
          path: filePath,
          type: "file",
          download_url: `${CDN_BASE_URL}/${filePath.split("/").map(encodeURIComponent).join("/")}`,
          html_url: `${CDN_BASE_URL}/${filePath.split("/").map(encodeURIComponent).join("/")}`,
        });
      } else { // It's a directory or a file in a subdirectory
        const dirName = relativePath.substring(0, slashIndex);
        if (!foundDirs.has(dirName)) {
          foundDirs.add(dirName);
          const dirFullPath = prefix + dirName;
          items.push({
            name: dirName,
            path: dirFullPath,
            type: "dir",
            download_url: null,
            html_url: `${CDN_BASE_URL}/${dirFullPath.split("/").map(encodeURIComponent).join("/")}/`,
          });
        }
      }
    }
  }
  return items;
}

export async function getFileContent(filePath: string): Promise<string | null> {
  const encodedFilePath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const rawContentUrl = `${CDN_BASE_URL}/${encodedFilePath}`;

  try {
    const response = await fetch(rawContentUrl, {
      method: "GET",
    });

    if (!response.ok) {
      console.error(
        `Error fetching file content from CDN: ${response.status} ${response.statusText} for path: ${filePath}`
      );
      console.error(`Attempted URL: ${rawContentUrl}`);
      const errorBody = await response.text();
      console.error("Error body (if any):", errorBody);
      return null;
    }

    const textContent = await response.text();
    return textContent;
  } catch (error) {
    console.error(
      `An unexpected error occurred while fetching file content for path ${filePath}:`,
      error
    );
    return null;
  }
}

export function getRawFileUrl(filePath: string): string {
  const encodedFilePath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${CDN_BASE_URL}/${encodedFilePath}`;
}
