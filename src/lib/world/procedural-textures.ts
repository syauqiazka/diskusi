/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Membuat tekstur batu kali terstruktur secara prosedural untuk talud terasering.
 * Menggunakan SRGBColorSpace agar tidak tampil sebagai kotak kelabu polos.
 */
export function createRiverStoneTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Latar adukan semen netral hangat
  ctx.fillStyle = '#5c636b';
  ctx.fillRect(0, 0, size, size);

  let seed = 4099;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const rows = 8;
  const rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    const cols = 6;
    const colW = size / cols;
    const offset = (r % 2) * (colW * 0.45);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset + (rand() - 0.5) * 4;
      const y = r * rowH + (rand() - 0.5) * 2;
      const w = colW - 5 - rand() * 3;
      const h = rowH - 5 - rand() * 3;
      const shade = Math.round(108 + (rand() - 0.5) * 28);
      const warm = Math.round(shade + 4 * rand());
      ctx.fillStyle = `rgb(${warm}, ${shade + 2}, ${shade - 2})`;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, w, h, 5);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1.5);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Membuat tekstur anyaman jaring transparan untuk net lapangan olahraga.
 */
export function createSportsNetTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(28, 34, 42, 0.85)';
  ctx.lineWidth = 2;

  const step = 16;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Pita putih tipis bagian paling atas net
  ctx.fillStyle = '#e9f2e3';
  ctx.fillRect(0, 0, size, 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(8, 1);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Membuat tekstur beton blok halus untuk jalur sirkulasi & trotoar kampus.
 */
export function createPaverWalkwayTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#8b949e';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(62, 70, 80, 0.28)';
  ctx.lineWidth = 2;

  const step = 64;
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  for (let r = 0; r < 4; r++) {
    const offset = (r % 2) * 32;
    for (let x = offset; x <= size; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, r * step);
      ctx.lineTo(x, (r + 1) * step);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  tex.needsUpdate = true;
  return tex;
}
