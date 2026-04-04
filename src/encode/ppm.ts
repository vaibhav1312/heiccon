import type { FormatMeta, EncodeOptions } from '../types.js';

export const meta: FormatMeta = {
  key: 'ppm',
  aliases: [],
  label: 'PPM',
  mime: 'image/x-portable-pixmap',
  ext: 'ppm',
  supportsCompression: false,
  compressionType: 'none',
  defaultQuality: null,
  qualityRange: null,
  qualityHint: 'Raw pixel format — no compression',
  requiresAlphaCompositing: true,
  supportsTransparency: false,
};

/**
 * Encode a Canvas to PPM (P6 binary format).
 * Manual encoder — no dependencies, ~30 lines.
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

  if (!ctx) throw new Error('Failed to get 2D context for PPM encoding');

  const imageData = ctx.getImageData(0, 0, w, h);
  const rgba = imageData.data;

  // P6 header: "P6\n{width} {height}\n255\n"
  const header = `P6\n${w} ${h}\n255\n`;
  const headerBytes = new TextEncoder().encode(header);

  // RGB pixels (drop alpha channel)
  const pixelCount = w * h;
  const rgb = new Uint8Array(pixelCount * 3);

  for (let i = 0; i < pixelCount; i++) {
    rgb[i * 3] = rgba[i * 4]!;     // R
    rgb[i * 3 + 1] = rgba[i * 4 + 1]!; // G
    rgb[i * 3 + 2] = rgba[i * 4 + 2]!; // B
  }

  return new Blob([headerBytes, rgb], { type: meta.mime });
}
