import type { FormatMeta, EncodeOptions } from '../types.js';

import { GIFEncoder, quantize, applyPalette } from 'gifenc';

import { normalizeQuality } from '../compression/normalize.js';

export const meta: FormatMeta = {
  key: 'gif',
  aliases: [],
  label: 'GIF',
  mime: 'image/gif',
  ext: 'gif',
  supportsCompression: true,
  compressionType: 'palette',
  defaultQuality: 100,
  qualityRange: [1, 100],
  qualityHint: 'Controls palette size: 100 = 256 colors, 1 = 2 colors',
  requiresAlphaCompositing: false,
  supportsTransparency: true,
};

/**
 * Encode a Canvas to GIF using gifenc.
 * Quality 0-100 controls palette size (2-256 colors).
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options?: EncodeOptions,
): Promise<Blob> {
  const w = canvas.width;
  const h = canvas.height;

  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  if (!ctx) throw new Error('Failed to get 2D context for GIF encoding');

  const imageData = ctx.getImageData(0, 0, w, h);
  const rgba = imageData.data;

  // normalizeQuality returns maxColors (2-256) for GIF
  const maxColors = normalizeQuality('gif', options?.quality ?? meta.defaultQuality!) as number;

  const palette = quantize(rgba, maxColors);
  const index = applyPalette(rgba, palette);

  const gif = GIFEncoder();
  gif.writeFrame(index, w, h, { palette });
  gif.finish();

  return new Blob([gif.bytes().buffer as ArrayBuffer], { type: meta.mime });
}
