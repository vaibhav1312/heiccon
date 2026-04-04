import type { FormatMeta, EncodeOptions } from '../types.js';

import { canvasToBlob } from '../transform/canvas.js';
import { normalizeQuality } from '../compression/normalize.js';

export const meta: FormatMeta = {
  key: 'avif',
  aliases: [],
  label: 'AVIF',
  mime: 'image/avif',
  ext: 'avif',
  supportsCompression: true,
  compressionType: 'lossy',
  defaultQuality: 50,
  qualityRange: [1, 100],
  qualityHint: '50 ≈ JPEG 85 — very efficient compression',
  requiresAlphaCompositing: false,
  supportsTransparency: true,
};

/**
 * Encode a Canvas to AVIF.
 * Strategy: try Canvas.toBlob('image/avif') first.
 * If the browser doesn't support AVIF encoding, falls back to @jsquash/avif WASM.
 *
 * Phase 2: WASM fallback will be added. For now, Canvas-only.
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options?: EncodeOptions,
): Promise<Blob> {
  const q = normalizeQuality('avif', options?.quality ?? meta.defaultQuality!);

  // Try Canvas native AVIF encoding first
  try {
    const blob = await canvasToBlob(canvas, meta.mime, q);
    // Canvas may return a PNG fallback if AVIF isn't supported — check MIME
    if (blob.type === meta.mime) return blob;
  } catch {
    // Canvas AVIF not supported — fall through to WASM
  }

  // TODO (Phase 2): @jsquash/avif WASM fallback
  // For now, throw a clear error
  throw new Error(
    'AVIF encoding not supported by this browser. ' +
    '@jsquash/avif WASM fallback will be added in v0.2.0.',
  );
}
