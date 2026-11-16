/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let cachedSoftwareGl: boolean | null = null;

/**
 * Mendeteksi software WebGL (SwiftShader, llvmpipe, WARP) dari string GPU renderer.
 * Hanya digunakan untuk menyesuaikan biaya render (pixelRatio, antialias, shadow map),
 * bukan untuk mengubah isi scene, jumlah objek, tata letak, atau logika aplikasi.
 */
export function detectSoftwareWebGL(): boolean {
  if (cachedSoftwareGl !== null) return cachedSoftwareGl;
  if (typeof document === 'undefined') {
    cachedSoftwareGl = false;
    return false;
  }

  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedSoftwareGl;
  } catch {
    cachedSoftwareGl = false;
    return false;
  }
}
