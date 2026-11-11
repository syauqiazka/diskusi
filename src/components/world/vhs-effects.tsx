"use client";

import * as React from "react";
import * as THREE from "three";
import { EffectComposer, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useWorldStore } from "@/stores/use-world-store";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function VhsEffects() {
  const graphicsQuality = useWorldStore((s) => s.worldSettings.graphicsQuality);
  const prefersReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  // Jika kualitas grafis rendah atau preferensi reduced motion aktif, nonaktifkan postprocessing
  if (graphicsQuality === "low" || prefersReducedMotion) {
    return null;
  }

  const isHighQuality = graphicsQuality === "high";

  return (
    <EffectComposer multisampling={isHighQuality ? 4 : 0}>
      {/* 1. Vignette (Tepi Gelap Lensa Kamera VHS) */}
      <Vignette
        eskil={false}
        offset={0.25}
        darkness={0.75}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 2. Chromatic Aberration (Aberasi Warna Tepi Lensa Retro) */}
      <ChromaticAberration
        offset={new THREE.Vector2(isHighQuality ? 0.0018 : 0.001, isHighQuality ? 0.0018 : 0.001)}
        radialModulation={true}
        modulationOffset={0.3}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* 3. Butiran Halus VHS Noise */}
      <Noise
        opacity={isHighQuality ? 0.08 : 0.05}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
}
