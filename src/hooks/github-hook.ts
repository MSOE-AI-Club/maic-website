// Define constants for repository details
const repoOwner = "MSOE-AI-Club";
const repoName = "maic-content";

export async function getLatestCommitHash(): Promise<string | null> {
  const branchName = import.meta.env.VITE_BRANCH;

  if (!branchName || !repoOwner || !repoName) {
    console.error("Missing environment variables.");
    return null;
  }

  const githubAtomUrl = `https://github.com/${repoOwner}/${repoName}/commits/${branchName}.atom`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(githubAtomUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.error(`Failed to fetch proxied Atom feed: ${response.statusText}`);
      return null;
    }

    const xml = await response.text();
    const match = xml.match(/<id>tag:github\.com,\d+:Grit::Commit\/([0-9a-f]{40})<\/id>/);

    if (match && match[1]) {
      return match[1]; // Latest commit SHA
    } else {
      console.error("Commit hash not found in Atom feed.");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving commit hash:", err);
    return null;
  }
}

// Interface for the manifest.json structure
interface Manifest {
  generated_at: string;
  files: string[];
}

// Cache for the manifest file
let cachedManifest: { commitSha: string; data: Manifest | null } | null = null;

export interface GitHubContentItem {
  name: string;
  path: string;
  sha?: string; // Optional: Not available from manifest
  size?: number; // Optional: Not available from manifest
  type: "file" | "dir";
  download_url: string | null;
  html_url: string;
}

// Helper function to fetch manifest.json for a specific commit
async function fetchManifestForCommit(commitSha: string): Promise<Manifest | null> {
  const manifestUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/manifest.json`;
  try {
    const response = await fetch(manifestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      console.error(
        `Error fetching manifest.json from GitHub: ${response.status} ${response.statusText} for commit: ${commitSha}`
      );
      console.error(`Attempted URL: ${manifestUrl}`);
      const errorBody = await response.text();
      console.error("Error body (if any):", errorBody);
      return null;
    }
    const manifestData = await response.json();
    // Basic validation of manifest structure
    if (!manifestData || !Array.isArray(manifestData.files) || typeof manifestData.generated_at !== 'string') {
        console.error("Invalid manifest format:", manifestData);
        return null;
    }
    return manifestData as Manifest;
  } catch (error) {
    console.error(`An unexpected error occurred while fetching manifest for commit ${commitSha}:`, error);
    return null;
  }
}

// Helper function to get (and cache) the manifest
async function getManifest(): Promise<{ manifest: Manifest; commitSha: string } | null> {
  const currentCommitSha = await getLatestCommitHash();
  if (!currentCommitSha) {
    console.error("Error: Could not retrieve the latest commit hash to fetch manifest.");
    return null;
  }

  // Check cache, but also ensure cached data is not null (which indicates a previous failed fetch for this SHA)
  if (cachedManifest && cachedManifest.commitSha === currentCommitSha && cachedManifest.data) {
    return { manifest: cachedManifest.data, commitSha: currentCommitSha };
  }

  // If cache miss, or cached data was null (failed attempt), fetch new manifest
  const manifestData = await fetchManifestForCommit(currentCommitSha);
  
  // Update cache regardless of success or failure to store the attempt for this commitSha
  cachedManifest = { commitSha: currentCommitSha, data: manifestData };

  if (manifestData) {
    return { manifest: manifestData, commitSha: currentCommitSha };
  } else {
    return null;
  }
}


export async function getDirectoryContents(
  directoryPath: string
): Promise<GitHubContentItem[] | null> {
  const manifestResult = await getManifest();
  if (!manifestResult) {
    console.error(
      "Error: Could not retrieve manifest to list directory contents."
    );
    return null;
  }
  const { manifest, commitSha } = manifestResult;

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
          download_url: `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/${filePath.split("/").map(encodeURIComponent).join("/")}`,
          html_url: `https://github.com/${repoOwner}/${repoName}/blob/${commitSha}/${filePath.split("/").map(encodeURIComponent).join("/")}`,
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
            html_url: `https://github.com/${repoOwner}/${repoName}/tree/${commitSha}/${dirFullPath.split("/").map(encodeURIComponent).join("/")}`,
          });
        }
      }
    }
  }
  return items;
}

export async function getFileContent(filePath: string): Promise<string | null> {
  const manifestResult = await getManifest();
  if (!manifestResult) {
    console.error(
      "Error: Could not retrieve manifest details (and commit hash) to fetch file content."
    );
    return null;
  }
  const { commitSha } = manifestResult;

  // const repoOwner = "MSOE-AI-Club"; // Defined at module level
  // const repoName = "maic-content"; // Defined at module level
  const encodedFilePath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const rawContentUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/${encodedFilePath}`;

  try {
    const response = await fetch(rawContentUrl, {
      method: "GET",
    });

    if (!response.ok) {
      console.error(
        `Error fetching file content from GitHub: ${response.status} ${response.statusText} for path: ${filePath} at commit: ${commitSha}`
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

export async function getRawFileUrl(filePath: string): Promise<string | null> {
  const manifestResult = await getManifest();
  if (!manifestResult) {
    console.error(
      "Error: Could not retrieve manifest details (and commit hash) to construct file URL."
    );
    return null;
  }
  const { commitSha } = manifestResult;

  // const repoOwner = "MSOE-AI-Club"; // Defined at module level
  // const repoName = "maic-content"; // Defined at module level
  const encodedFilePath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/${encodedFilePath}`;
}
