/**
 * Token warna dan tipografi resmi sesuai DESIGN.md
 * Arah: Friendly Toy-Like & Anime Campus
 * Palet: Fresh Mint & Peach | Font: Fredoka + Nunito
 */

export const THEME_TOKENS = {
  colors: {
    canvas: "#F0FDF4",
    surface: "#FFFFFF",
    primary: "#34D399",
    secondary: "#FDBA74",
    accent: "#4F46E5",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#E2E8F0",
    destructive: "#EF4444",
    success: "#10B981",
  },
  fonts: {
    display: "var(--font-fredoka)",
    body: "var(--font-nunito)",
    mono: "var(--font-jetbrains-mono)",
  },
} as const;
