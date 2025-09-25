/* This is a patch utility for redirecting some old links that need to be maintained to new paths */

export interface AliasEntry {
  /** path matcher: pathname string like "/" or "/library" */
  path: string;
  /** normalize function: given current URLSearchParams, returns normalized target URL string or null if no match */
  normalize: (params: URLSearchParams) => string | null;
}

/**
 * Known aliases mapping legacy Articles links to Competitions targets.
 * Extend here as needed.
 */
const aliasEntries: AliasEntry[] = [
  {
    path: "/library",
    normalize: (params) => {
      const nav = (params.get("nav") || "").trim();
      const article = (params.get("article") || "").trim();
      // Articles alias → Competitions
      if (nav === "Articles" && article === "Fintech Startup") {
        return "/library?nav=Competitions&article=" + encodeURIComponent("Juno-Spring-2025");
      }
      return null;
    },
  },
  {
    path: "/library",
    normalize: (params) => {
      const nav = (params.get("nav") || "").trim();
      const article = (params.get("article") || "").trim();
      if (nav === "Articles" && article === "Fun with Liquids") {
        return "/library?nav=Competitions&article=" + encodeURIComponent("Brady-Fall-2024");
      }
      return null;
    },
  },
];

/**
 * Returns the alias target URL for a given location, or null if none.
 */
export function getAliasRedirectTarget(pathname: string, search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    const normalizedPathname = (pathname || "").replace(/\/+$/, "") || "/";
    for (const entry of aliasEntries) {
      const entryPathNormalized = (entry.path || "").replace(/\/+$/, "") || "/";
      if (entryPathNormalized === normalizedPathname) {
        const target = entry.normalize(params);
        if (target) return target;
      }
    }
  } catch (_) {
    // ignore errors
  }
  return null;
}

/**
 * Deprecated: side-effecting redirect helper kept for compatibility. Prefer getAliasRedirectTarget
 */
export function performAliasRedirect(pathname: string, search: string): string | null {
  const target = getAliasRedirectTarget(pathname, search);
  if (target) {
    try { window.history.replaceState({}, "", target); } catch (_) {}
    return target;
  }
  return null;
}


