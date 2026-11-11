import * as THREE from "three";
import { THEME_TOKENS } from "@/lib/tokens";

export const CLASSROOM_COLORS = {
  night: THEME_TOKENS.colors.night,
  fluor: THEME_TOKENS.colors.fluor,
  caution: THEME_TOKENS.colors.caution,
  neonCyan: THEME_TOKENS.colors.neonCyan,
  alert: THEME_TOKENS.colors.alert,
  ok: THEME_TOKENS.colors.ok,

  // Warna Khas Interior Ruang Kelas
  blackboard: "#1A3326", // Hijau tua papan tulis kapur
  blackboardFrame: "#3E2E20", // Kayu bingkai papan tulis
  deskTop: "#33271E", // Kayu meja siswa
  deskLegs: "#181B22", // Besi kaki meja hitam
  chairSeat: "#28201A", // Dudukan kursi kayu
  wall: "#C8C4B7", // Dinding beton krem kelabu
  wallBase: "#2A2420", // Lis kayu bawah dinding
  floor: "#12151D", // Ubin lantai sekolah gelap
  ceiling: "#161922", // Plafon sekolah
  neonCasing: "#222733", // Rumah lampu neon plafon
};

export function createGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = CLASSROOM_COLORS.floor;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = "rgba(233, 242, 227, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);

    ctx.strokeStyle = "rgba(233, 242, 227, 0.03)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 256);
    ctx.moveTo(0, 128);
    ctx.lineTo(256, 128);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 14);
  return texture;
}
