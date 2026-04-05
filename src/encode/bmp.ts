import type { FormatMeta, EncodeOptions } from '../types.js';

import { encode as encodeBmp } from 'fast-bmp';

export const meta: FormatMeta = {
  key: 'bmp',
  aliases: [],
  label: 'BMP',
  mime: 'image/bmp',
  ext: 'bmp',
  supportsCompression: false,
  compressionType: 'none',
  defaultQuality: null,
  qualityRange: null,
  qualityHint: 'Uncompressed format — no quality control',
  requiresAlphaCompositing: true,
  supportsTransparency: false,
};

/**
 * Encode a Canvas to BMP using fast-bmp.
 * Produces a 24-bit RGB BMP (alpha is dropped since BMP has no transparency).
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  const w = canvas.width;
  const h = canvas.height;

  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  if (!ctx) throw new Error('Failed to get 2D context for BMP encoding');

  const imageData = ctx.getImageData(0, 0, w, h);
  const rgba = imageData.data;

  // Convert RGBA → RGB for 24-bit BMP (no alpha)
  const pixelCount = w * h;
  const rgb = new Uint8Array(pixelCount * 3);
  for (let i = 0; i < pixelCount; i++) {
    rgb[i * 3] = rgba[i * 4]!;
    rgb[i * 3 + 1] = rgba[i * 4 + 1]!;
    rgb[i * 3 + 2] = rgba[i * 4 + 2]!;
  }

  const bmpData = encodeBmp({
    data: rgb,
    width: w,
    height: h,
    bitsPerPixel: 24,
    components: 3,
    channels: 3,
  });

  return new Blob([bmpData.buffer as ArrayBuffer], { type: meta.mime });
}
