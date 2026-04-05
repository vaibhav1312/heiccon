import type { FormatMeta, EncodeOptions } from '../types.js';

import UTIF from 'utif2';

export const meta: FormatMeta = {
  key: 'tiff',
  aliases: ['tif'],
  label: 'TIFF',
  mime: 'image/tiff',
  ext: 'tiff',
  supportsCompression: false,
  compressionType: 'none',
  defaultQuality: null,
  qualityRange: null,
  qualityHint: 'Uncompressed format — no quality control',
  requiresAlphaCompositing: true,
  supportsTransparency: false,
};

/**
 * Encode a Canvas to TIFF using utif2.
 * Produces an uncompressed RGBA TIFF.
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

  if (!ctx) throw new Error('Failed to get 2D context for TIFF encoding');

  const imageData = ctx.getImageData(0, 0, w, h);
  // utif2.encodeImage expects ArrayBuffer of RGBA data
  const rgbaBuffer = imageData.data.buffer.slice(
    imageData.data.byteOffset,
    imageData.data.byteOffset + imageData.data.byteLength,
  );

  const tiffBuffer = UTIF.encodeImage(rgbaBuffer as unknown as Uint8Array, w, h);

  return new Blob([tiffBuffer], { type: meta.mime });
}
