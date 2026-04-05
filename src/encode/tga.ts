import type { FormatMeta, EncodeOptions } from '../types.js';

import { encodeTga } from '@lunapaint/tga-codec';

export const meta: FormatMeta = {
  key: 'tga',
  aliases: [],
  label: 'TGA',
  mime: 'image/x-tga',
  ext: 'tga',
  supportsCompression: false,
  compressionType: 'none',
  defaultQuality: null,
  qualityRange: null,
  qualityHint: 'TGA uses built-in RLE compression',
  requiresAlphaCompositing: false,
  supportsTransparency: true,
};

/**
 * Encode a Canvas to TGA using @lunapaint/tga-codec.
 * Produces 32-bit RGBA TGA.
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

  if (!ctx) throw new Error('Failed to get 2D context for TGA encoding');

  const imageData = ctx.getImageData(0, 0, w, h);

  // tga-codec expects { data: Uint8Array, width, height }
  const rgba = new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength);

  const result = await encodeTga({ data: rgba, width: w, height: h });

  return new Blob([result.data.buffer as ArrayBuffer], { type: meta.mime });
}
