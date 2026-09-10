import {
  Award,
  Crown,
  GraduationCap,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { classifyBadgeIcon } from "../../hooks/dashboard-hook";

/**
 * Renders an ALL dashboard badge icon.
 *
 * The dashboard stores three different things in one `icon` field — an
 * uploaded image URL, a short built-in key, or an emoji — so every surface
 * showing badges needs the same three-way branch. Keeping it here means the
 * achievements wall and the leaderboard can't drift apart, and an unknown key
 * degrades to a generic award everywhere instead of printing itself as text
 * beside a member's name.
 */

const KEY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
  trophy: Trophy,
  award: Award,
  medal: Medal,
  star: Star,
  crown: Crown,
  graduation: GraduationCap,
  "graduation-cap": GraduationCap,
  rocket: Rocket,
  sparkles: Sparkles,
  users: Users,
  eboard: Users,
};

export function BadgeIcon({
  icon,
  name,
  size = 22,
  imgClassName,
  emojiClassName,
}: {
  icon: string | null | undefined;
  name: string;
  size?: number;
  imgClassName?: string;
  emojiClassName?: string;
}) {
  const { kind, value } = classifyBadgeIcon(icon);

  if (kind === "url") {
    return <img src={value} alt={name} title={name} className={imgClassName} />;
  }
  if (kind === "emoji") {
    return (
      <span className={emojiClassName} title={name} role="img" aria-label={name}>
        {value}
      </span>
    );
  }
  // Built-in key, or nothing at all — a generic award beats a stray word.
  const Icon = (kind === "key" && KEY_ICONS[value]) || Award;
  return <Icon size={size} color="#fff" aria-label={name} />;
}

export default BadgeIcon;
