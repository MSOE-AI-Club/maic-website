// Base URL for the MAIC Content CDN (configurable via env)
const DEFAULT_CONTENT_BASE_URL = "http://127.0.0.1:8000/";
const FALLBACK_LOCAL_CONTENT_BASE_URL = "/maic-content"; // helpful for local dev where content folder isn't mounted at /content

const RAW_ENV_CONTENT_BASE_URL =
  (import.meta?.env?.VITE_CONTENT_BASE_URL as string | undefined) || undefined;
const ENV_CONTENT_BASE_URL = RAW_ENV_CONTENT_BASE_URL
  ? RAW_ENV_CONTENT_BASE_URL.trim().replace(/\/+$/, "")
  : undefined;

// Lazily resolved and cached content base URL
let resolvedContentBaseUrl: string | null = null;

async function resolveContentBaseUrl(): Promise<string> {
  if (resolvedContentBaseUrl) return resolvedContentBaseUrl;

  // 1) Honor explicit env override first
  if (ENV_CONTENT_BASE_URL && ENV_CONTENT_BASE_URL.length > 0) {
    resolvedContentBaseUrl = ENV_CONTENT_BASE_URL;
    return resolvedContentBaseUrl;
  }

  // 2) Try default "/content"
  try {
    const res = await fetchWithRetry(
      `${DEFAULT_CONTENT_BASE_URL}/manifest.json`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (res.ok) {
      resolvedContentBaseUrl = DEFAULT_CONTENT_BASE_URL;
      return resolvedContentBaseUrl;
    }
  } catch {
    // ignore and try fallback
  }

  // 3) Try local fallback "/maic-content" (useful in development where content is a sibling folder)
  try {
    const res = await fetchWithRetry(
      `${FALLBACK_LOCAL_CONTENT_BASE_URL}/manifest.json`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );
    if (res.ok) {
      resolvedContentBaseUrl = FALLBACK_LOCAL_CONTENT_BASE_URL;
      return resolvedContentBaseUrl;
    }
  } catch {
    // ignore
  }

  // 4) Fall back to default; callers will still see errors if not actually reachable
  resolvedContentBaseUrl = DEFAULT_CONTENT_BASE_URL;
  return resolvedContentBaseUrl;
}
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

  const baseUrl = await resolveContentBaseUrl();
  const manifestUrl = `${baseUrl}/manifest.json`;

  try {
    const response = await fetchWithRetry(manifestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.debug(`Manifest.json not found (404) at: ${manifestUrl}`);
      } else {
        console.error(
          `Error fetching manifest.json from CDN: ${response.status} ${response.statusText}`
        );
        console.error(`Attempted URL: ${manifestUrl}`);
        const errorBody = await response.text();
        console.error("Error body (if any):", errorBody);
      }
      return null;
    }

    const manifestData = await response.json();

    // Validate manifest structure
    if (
      !manifestData ||
      !Array.isArray(manifestData.files) ||
      typeof manifestData.generated_at !== "string"
    ) {
      console.error("Invalid manifest format:", manifestData);
      return null;
    }

    cachedManifest = manifestData as Manifest;
    return cachedManifest;
  } catch (error) {
    console.error(
      "An unexpected error occurred while fetching manifest:",
      error
    );
    return null;
  }
}

export async function getDirectoryContents(
  directoryPath: string
): Promise<GitHubContentItem[] | null> {
  const baseUrl = await resolveContentBaseUrl();
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
  const prefix =
    normalizedPath === "" || normalizedPath === "."
      ? ""
      : normalizedPath.endsWith("/")
      ? normalizedPath
      : normalizedPath + "/";

  for (const filePath of manifest.files) {
    if (filePath.startsWith(prefix)) {
      const relativePath = filePath.substring(prefix.length);
      if (relativePath === "") continue; // Skip if filePath itself is the prefix

      const slashIndex = relativePath.indexOf("/");

      if (slashIndex === -1) {
        // It's a file
        items.push({
          name: relativePath,
          path: filePath,
          type: "file",
          download_url: `${baseUrl}/${filePath
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`,
          html_url: `${baseUrl}/${filePath
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`,
        });
      } else {
        // It's a directory or a file in a subdirectory
        const dirName = relativePath.substring(0, slashIndex);
        if (!foundDirs.has(dirName)) {
          foundDirs.add(dirName);
          const dirFullPath = prefix + dirName;
          items.push({
            name: dirName,
            path: dirFullPath,
            type: "dir",
            download_url: null,
            html_url: `${baseUrl}/${dirFullPath
              .split("/")
              .map(encodeURIComponent)
              .join("/")}/`,
          });
        }
      }
    }
  }
  return items;
}

// Helper function to implement exponential backoff retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If it's a successful response, return it immediately
      if (response.ok) {
        return response;
      }

      // For client errors (400-499), don't retry as these are likely permanent
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // For server errors (500+), retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function getFileContent(filePath: string): Promise<string | null> {
  const baseUrl = await resolveContentBaseUrl();
  const encodedFilePath = filePath.split("/").map(encodeURIComponent).join("/");

  const rawContentUrl = `${baseUrl}/${encodedFilePath}`;

  try {
    const response = await fetchWithRetry(rawContentUrl, {
      method: "GET",
    });

    if (!response.ok) {
      // Log 404s as debug info rather than errors to reduce console noise
      if (response.status === 404) {
        console.debug(`Content not found (404) for path: ${filePath}`);
      } else {
        console.error(
          `Error fetching file content from CDN: ${response.status} ${response.statusText} for path: ${filePath}`
        );
        console.error(`Attempted URL: ${rawContentUrl}`);
        const errorBody = await response.text();
        console.error("Error body (if any):", errorBody);
      }
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
  const baseUrl =
    resolvedContentBaseUrl || ENV_CONTENT_BASE_URL || DEFAULT_CONTENT_BASE_URL;
  const encodedFilePath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/${encodedFilePath}`;
}

// Kick off async resolution early (non-blocking) so cache populates quickly
resolveContentBaseUrl().catch((error) => {
  console.warn("Early content base URL resolution failed:", error);
});
