export async function getLatestCommitHash(): Promise<string | null> {
  const branchName = import.meta.env.VITE_BRANCH;

  if (!branchName) {
    console.error("Error: VITE_BRANCH environment variable is not set.");
    return null;
  }

  const repoOwner = "MSOE-AI-Club";
  const repoName = "maic-content";
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/branches/${branchName}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching branch data from GitHub: ${response.status} ${response.statusText}`
      );
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      return null;
    }

    const data = await response.json();

    if (data && data.commit && data.commit.sha) {
      return data.commit.sha;
    } else {
      console.error(
        "Error: Could not find commit SHA in the API response.",
        data
      );
      return null;
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return null;
  }
}

export interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
  download_url: string | null; // null for directories
  html_url: string;
  // Add other fields if needed, e.g., _links
}

export async function getDirectoryContents(
  directoryPath: string
): Promise<GitHubContentItem[] | null> {
  const commitSha = await getLatestCommitHash();

  if (!commitSha) {
    console.error(
      "Error: Could not retrieve the latest commit hash to fetch directory contents."
    );
    return null;
  }

  const repoOwner = "MSOE-AI-Club";
  const repoName = "maic-content";
  // Ensure the directory path is properly encoded for the URL
  const encodedPath = directoryPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodedPath}?ref=${commitSha}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching directory contents from GitHub: ${response.status} ${response.statusText} for path: ${directoryPath} at commit: ${commitSha}`
      );
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      return null;
    }

    const data = await response.json();

    // The GitHub API returns an array for directory contents.
    // If the path points to a file, it returns an object. We ensure it's an array.
    if (Array.isArray(data)) {
      return data as GitHubContentItem[];
    } else {
      console.error(
        `Error: Expected an array of contents for directory ${directoryPath}, but received type ${typeof data}. This might happen if the path points to a file. Data:`, data
      );
      // If the path was supposed to be a directory, this is an error.
      // If a single file's metadata was acceptable, one might return [data as GitHubContentItem], but the function is named getDirectoryContents.
      return null;
    }
  } catch (error) {
    console.error(
      `An unexpected error occurred while fetching directory contents for path ${directoryPath}:`,
      error
    );
    return null;
  }
}

export async function getFileContent(filePath: string): Promise<string | null> {
  const commitSha = await getLatestCommitHash();

  if (!commitSha) {
    console.error(
      "Error: Could not retrieve the latest commit hash to fetch file content."
    );
    return null;
  }

  const repoOwner = "MSOE-AI-Club";
  const repoName = "maic-content";
  // Ensure the file path is properly encoded for the URL, though typically not strictly necessary for raw.githubusercontent
  // It's safer for paths that might contain special characters, though less common for this type of URL.
  const encodedFilePath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const rawContentUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/${encodedFilePath}`;

  try {
    const response = await fetch(rawContentUrl, {
      method: "GET",
      // No special headers typically needed for raw.githubusercontent.com
      // However, for private repos, a token might be needed via query param or header depending on setup,
      // but this hook assumes public access or tokenless access to raw content.
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
  const commitSha = await getLatestCommitHash();

  if (!commitSha) {
    console.error(
      "Error: Could not retrieve the latest commit hash to construct file URL."
    );
    return null;
  }

  const repoOwner = "MSOE-AI-Club";
  const repoName = "maic-content";
  // Ensure the file path is properly encoded. While raw.githubusercontent.com is often lenient,
  // it's good practice, especially if paths could contain spaces or special characters.
  const encodedFilePath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${commitSha}/${encodedFilePath}`;
}
