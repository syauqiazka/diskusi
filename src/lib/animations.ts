/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Helper & Preset Animasi GSAP untuk Antarmuka 2D
 * Sesuai aturan AGENTS.md & DESIGN.md:
 * - Animasi HANYA menggunakan transform dan opacity (GPU accelerated).
 * - Wajib menghormati prefers-reduced-motion dari preferensi sistem/OS.
 * - Karakter animasi: Hangat, bersahabat, empuk, seperti mainan (toy-like / bruno-simon inspired).
 */

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Registrasi plugin useGSAP
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

/**
 * Cek apakah pengguna mengaktifkan prefers-reduced-motion di sistem operasinya
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animasi Entrance Elemen Tunggal (Fade in & Slide Up Empuk)
 */
export function animateFadeUp(
  target: gsap.DOMTarget,
  vars?: gsap.TweenVars
): gsap.core.Tween | null {
  if (isReducedMotion()) {
    gsap.set(target, { opacity: 1, y: 0, scale: 1 });
    return null;
  }

  return gsap.fromTo(
    target,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      ...vars,
    }
  );
}

/**
 * Animasi Entrance Stagger untuk Daftar Kartu / Baris Elemen
 */
export function animateStaggerCards(
  targets: gsap.DOMTarget,
  vars?: gsap.TweenVars
): gsap.core.Tween | null {
  if (isReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
    return null;
  }

  return gsap.fromTo(
    targets,
    { opacity: 0, y: 28, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      stagger: 0.08,
      ease: "back.out(1.2)",
      ...vars,
    }
  );
}

/**
 * Animasi Pop-in Membal untuk Modal & Badge Pil Interaktif (Toy-like Bouncy)
 */
export function animateToyPop(
  target: gsap.DOMTarget,
  vars?: gsap.TweenVars
): gsap.core.Tween | null {
  if (isReducedMotion()) {
    gsap.set(target, { opacity: 1, scale: 1 });
    return null;
  }

  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.88 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: "back.out(1.8)",
      ...vars,
    }
  );
}

/**
 * Animasi Efek Profil Kustom (Sinar Pagi, Kelopak Bunga, Pendar Ceria)
 */
export function animateProfileEffect(
  container: HTMLElement,
  effectId: string
): () => void {
  if (isReducedMotion()) return () => {};

  const ctx = gsap.context(() => {
    if (effectId === "effect-sun") {
      // Pendaran hangat membesar-mengecil halus
      gsap.to(".profile-aura", {
        scale: 1.12,
        opacity: 0.85,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else if (effectId === "effect-breeze") {
      // Goyangan melayang kelopak lembut
      gsap.to(".profile-particle", {
        y: "-=10",
        rotation: 15,
        duration: 1.8,
        stagger: 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else if (effectId === "effect-sparkle") {
      // Kerlip pendar ceria bergantian
      gsap.to(".profile-sparkle", {
        scale: 1.3,
        opacity: 0.9,
        duration: 1.2,
        stagger: {
          each: 0.25,
          repeat: -1,
          yoyo: true,
        },
        ease: "power1.inOut",
      });
    }
  }, container);

  return () => ctx.revert();
}

