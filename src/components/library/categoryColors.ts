// Category color utilities
// Normalizes category labels and returns a consistent set of colors

export interface TagColors {
  text: string;
  bg: string;
  border: string;
}

function normalize(label: string): string {
  return label
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Base palette — add any categories your content uses regularly
const CATEGORY_PALETTE: Record<string, string> = {
  // Learning levels / general
  "tutorial": "#60a5fa", // blue-400
  "getting started": "#34d399", // emerald-400
  "beginner": "#86efac", // green-300
  "intermediate": "#f59e0b", // amber-500
  "advanced": "#f87171", // red-400
  // Club / community
  "ai club": "#a78bfa", // violet-400
  "ai-club": "#a78bfa",
  // Topics
  "python": "#fbbf24", // amber-400
  "webscraping": "#22d3ee", // cyan-400
  "nlp": "#fb7185", // rose-400
  "natural language processing": "#fb7185",
  "computer vision": "#60a5fa",
  "vision": "#60a5fa",
  "transformers": "#c084fc", // fuchsia-400
  "deep learning": "#f472b6", // pink-400
  "machine learning": "#2dd4bf", // teal-400
  "data": "#93c5fd", // blue-300
  "jupyter": "#f97316", // orange-500
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function hslToHex(h: number, s: number, l: number): string {
  // h[0..360], s & l [0..1]
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = (v: number) => {
    const n = Math.round((v + m) * 255);
    return n.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getCategoryColors(label: string): TagColors {
  const key = normalize(label);
  const base = CATEGORY_PALETTE[key] || hslToHex(hashHue(key), 0.6, 0.6);
  return {
    text: base,
    border: hexToRgba(base, 0.6),
    bg: hexToRgba(base, 0.15),
  };
}

export default getCategoryColors;


