import type { FormatMeta, EncodeOptions } from '../types.js';

import { canvasToBlob } from '../transform/canvas.js';
import { normalizeQuality } from '../compression/normalize.js';
import { EncodeError } from '../errors.js';

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
 * Falls back to @jsquash/avif WASM if browser doesn't support native AVIF encoding.
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

  // WASM fallback: @jsquash/avif
  try {
    const { encode: avifEncode } = await import('@jsquash/avif');

    const ctx = canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D;

    if (!ctx) throw new Error('Failed to get 2D context for AVIF encoding');

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const quality = options?.quality ?? meta.defaultQuality!;

    const arrayBuffer = await avifEncode(imageData, { quality });
    return new Blob([arrayBuffer], { type: meta.mime });
  } catch (err) {
    throw new EncodeError(
      'ENCODE_FAILED',
      `AVIF encoding failed. Ensure @jsquash/avif is installed and WASM can load. ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
