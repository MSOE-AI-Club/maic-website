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
    path: "/",
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
 * Checks for an alias for the given location and performs a 308-style redirect
 * using history.replaceState to avoid an extra entry, and returns the target
 * URL if a redirect was performed.
 */
export function performAliasRedirect(pathname: string, search: string): string | null {
  try {
    const params = new URLSearchParams(search);
    const normalizedPathname = (pathname || "").replace(/\/+$/, "") || "/";
    for (const entry of aliasEntries) {
      const entryPathNormalized = (entry.path || "").replace(/\/+$/, "") || "/";
      if (entryPathNormalized === normalizedPathname) {
        const target = entry.normalize(params);
        if (target) {
          // emulate 308 Permanent Redirect client-side via replace
          window.history.replaceState({}, "", target);
          return target;
        }
      }
    }
  } catch (_) {
    // ignore errors
  }
  return null;
}


