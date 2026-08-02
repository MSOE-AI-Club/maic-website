/**
 * ALL Applied AI Network dashboard — live chapter data.
 *
 * The eboard edits events, badges, merch, the leaderboard, research projects
 * and the learning tree in dashboard.all-ai-network.org. This module reads
 * them so the site reflects those edits on the next page load, with no
 * redeploy and no second copy of the data in maic-content.
 *
 * NO API KEY, deliberately. This site is a static Vite build served from S3 —
 * there is no server, and every `VITE_*` variable is inlined into the
 * JavaScript shipped to visitors, so a key placed there would be public. The
 * dashboard exposes a keyless, CORS-open endpoint for exactly this case. If
 * you ever find yourself adding an API key here, that is the wrong turn.
 *
 * Docs: https://dashboard.all-ai-network.org/docs
 *
 * Everything fails SOFT. A dashboard outage must leave the site rendering
 * whatever it rendered before, never a broken section — hence the null
 * returns and the single in-flight promise rather than throwing.
 */

const DASHBOARD_BASE = "https://dashboard.all-ai-network.org";
const CHAPTER_SLUG = "msoe-ai-club";

/* ── Response types (only the fields this site reads) ─────────────── */

export interface DashboardEvent {
  id: string;
  title: string;
  description: string | null;
  /** Free text set by officers: "Speaker Event", "Workshop", "Hackathon"… */
  type: string | null;
  date: string;
  end_date: string | null;
  timezone: string | null;
  location: string | null;
  virtual_url: string | null;
  image_url: string | null;
  points_attend: number | null;
}

export interface DashboardBadge {
  id: string;
  name: string;
  description: string | null;
  /** Either an https URL (uploaded image) or a short string — often an emoji. */
  icon: string | null;
  award_count: number;
}

export interface DashboardMerchItem {
  id: string;
  name: string;
  description: string | null;
  cost_points: number | null;
  cost_text: string | null;
  images: string[];
  image_url: string | null;
  /** null = unlimited, 0 = out of stock, >0 = that many left. */
  stock: number | null;
}

export interface DashboardLeader {
  rank: number;
  name: string;
  points: number;
  events_attended: number;
  badges: Array<{ id: string; name: string; icon: string | null }>;
}

export interface DashboardProject {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  year: string | null;
  members: Array<{ name: string; role: string }>;
  files: Array<{ id: string; kind: string; title: string; url: string }>;
}

export interface DashboardChapter {
  slug: string;
  name: string;
  university: string;
  member_count: number;
  event_count: number;
}

export interface DashboardBundle {
  chapter: DashboardChapter;
  events: DashboardEvent[];
  events_scope?: string;
  leaderboard: DashboardLeader[];
  badges: DashboardBadge[];
  merch: DashboardMerchItem[];
  projects: DashboardProject[];
}

export interface TreeNode {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  parent_ref: string | null;
  prereqs: string[];
  tags: string[];
  thumbnail: string | null;
  difficulty: string | null;
  /** CSS color set on the node in the dashboard, or inherited per category. */
  color: string | null;
  pos_x: number | null;
  pos_y: number | null;
  /** "base" for the network's shared nodes, "chapter" for this club's own. */
  source: string;
}

export interface TreePayload {
  nodes: TreeNode[];
  edges: Array<{ from: string; to: string }>;
}

/* ── Fetching ─────────────────────────────────────────────────────── */

/**
 * One in-flight request per resource, shared across every component that
 * asks. Several pages want the bundle at once (stats in the hero, events in
 * the list) and the browser shouldn't make the same call three times.
 *
 * Not a long-lived cache: the response is edge-cached ~30s server-side
 * already, and holding it here would mean a visitor who leaves a tab open
 * never sees an update.
 */
let bundlePromise: Promise<DashboardBundle | null> | null = null;
let treePromise: Promise<TreePayload | null> | null = null;

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[dashboard] ${res.status} from ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn("[dashboard] fetch failed:", err);
    return null;
  }
}

/**
 * The whole chapter payload in one request.
 *
 * `events=all` matters: the bundle returns only UPCOMING events by default,
 * and every one of this chapter's events is in the past, so the default would
 * hand back an empty array and the events page would look broken.
 */
export function getDashboardBundle(): Promise<DashboardBundle | null> {
  if (!bundlePromise) {
    bundlePromise = getJson<DashboardBundle>(
      `${DASHBOARD_BASE}/api/public/chapter/${CHAPTER_SLUG}/bundle?events=all&events_limit=200`,
    ).finally(() => {
      // Allow a later navigation to refetch rather than pinning the first
      // response for the life of the tab.
      setTimeout(() => {
        bundlePromise = null;
      }, 30_000);
    }) as Promise<DashboardBundle | null>;
  }
  return bundlePromise;
}

/** The network's shared learning tree merged with this chapter's own nodes. */
export function getDashboardTree(): Promise<TreePayload | null> {
  if (!treePromise) {
    treePromise = getJson<TreePayload>(
      `${DASHBOARD_BASE}/api/public/learning-tree/${CHAPTER_SLUG}`,
    ).finally(() => {
      setTimeout(() => {
        treePromise = null;
      }, 30_000);
    }) as Promise<TreePayload | null>;
  }
  return treePromise;
}

/* ── Helpers the pages share ──────────────────────────────────────── */

/**
 * Officers type event types freely ("Speaker Event - Intro Series",
 * "ROSIE Competition", "NVIDIA"), but this site's filter bar has four fixed
 * buckets. Map onto those and default to workshop so a new type the eboard
 * invents still appears rather than vanishing from every filter.
 */
export type SiteEventType = "workshop" | "speaker" | "competition" | "intro";

export function toSiteEventType(raw: string | null): SiteEventType {
  const t = (raw || "").toLowerCase();
  if (t.includes("intro")) return "intro";
  if (t.includes("speaker") || t.includes("panel") || t.includes("conference"))
    return "speaker";
  if (
    t.includes("hackathon") ||
    t.includes("competition") ||
    t.includes("lab") ||
    t.includes("challenge")
  )
    return "competition";
  return "workshop";
}

/**
 * A badge `icon` arrives in one of three forms and they render differently:
 *   - an https URL          → an uploaded image
 *   - a short built-in key  → "trophy", "crown", "graduation" — map to an
 *                             icon component
 *   - an emoji              → render as text
 *
 * Distinguishing the last two matters: rendering the key "graduation" as text
 * puts the literal word next to a member's name on the leaderboard. Emoji
 * carry no ASCII letters, which separates them cleanly from key names.
 */
export type BadgeIconKind = "url" | "key" | "emoji" | "none";

export function classifyBadgeIcon(icon: string | null | undefined): {
  kind: BadgeIconKind;
  value: string;
} {
  const v = (icon || "").trim();
  if (!v) return { kind: "none", value: "" };
  if (isHttpUrl(v)) return { kind: "url", value: v };
  if (/[a-z]/i.test(v)) return { kind: "key", value: v.toLowerCase() };
  return { kind: "emoji", value: v };
}

/** True for values safe to use as an <img src> or link href. */
export function isHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Dates come back as UTC ISO with the event's timezone alongside. */
export function formatEventDate(iso: string, timezone?: string | null): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(timezone ? { timeZone: timezone } : {}),
    });
  } catch {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
