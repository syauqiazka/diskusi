import { prisma } from "@/lib/db";

export const DEFAULT_AVATAR_FRAMES = [
  {
    slug: "frame-caution",
    name: "Kuning Rambu BAZMA",
    description: "Aksen kuning khas rambu dan pita keselamatan lorong sekolah tengah malam.",
    assetUrl: "/frames/caution.svg",
  },
  {
    slug: "frame-cyan",
    name: "Terminal SIJA Cyan",
    description: "Pendaran terminal konsol jaringan dan server kejuruan SIJA.",
    assetUrl: "/frames/cyan.svg",
  },
  {
    slug: "frame-fluor",
    name: "Neon Kehijauan Lorong",
    description: "Cahaya tabung neon redup yang menerangi ubin sekolah jam dua pagi.",
    assetUrl: "/frames/fluor.svg",
  },
  {
    slug: "frame-chrome",
    name: "Krom Klasik Retro",
    description: "Gaya material krom retro ala VHS camera body.",
    assetUrl: "/frames/chrome.svg",
  },
];

export const DEFAULT_PROFILE_EFFECTS = [
  {
    slug: "effect-glow",
    name: "Dengung Cahaya Tabung",
    configKey: "glow-pulse",
  },
  {
    slug: "effect-scanline",
    name: "Pendar Tabung CRT",
    configKey: "crt-scan",
  },
  {
    slug: "effect-moon-ring",
    name: "Bulan Cincin GSAP",
    configKey: "moon-ring",
  },
];

/**
 * Utilitas untuk memastikan katalog bingkai dan efek terdaftar di database (idempoten).
 */
export async function ensureCosmeticsSeeded(): Promise<void> {
  const [frameCount, effectCount] = await Promise.all([
    prisma.avatarFrame.count(),
    prisma.profileEffect.count(),
  ]);

  if (frameCount === 0) {
    for (const frame of DEFAULT_AVATAR_FRAMES) {
      await prisma.avatarFrame.upsert({
        where: { slug: frame.slug },
        update: {},
        create: frame,
      });
    }
  }

  if (effectCount === 0) {
    for (const effect of DEFAULT_PROFILE_EFFECTS) {
      await prisma.profileEffect.upsert({
        where: { slug: effect.slug },
        update: {},
        create: effect,
      });
    }
  }
}

