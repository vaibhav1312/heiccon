import type { FormatMeta, EncodeOptions } from '../types.js';

import { writePsd } from 'ag-psd';

export const meta: FormatMeta = {
  key: 'psd',
  aliases: [],
  label: 'PSD',
  mime: 'application/psd',
  ext: 'psd',
  supportsCompression: false,
  compressionType: 'none',
  defaultQuality: null,
  qualityRange: null,
  qualityHint: 'PSD uses built-in RLE compression',
  requiresAlphaCompositing: true,
  supportsTransparency: false,
};

/**
 * Encode a Canvas to PSD using ag-psd.
 * Produces a single-layer PSD with flattened composite image.
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

  if (!ctx) throw new Error('Failed to get 2D context for PSD encoding');

  const imageData = ctx.getImageData(0, 0, w, h);

  const pixelData = {
    data: imageData.data,
    width: w,
    height: h,
  };

  const psd = {
    width: w,
    height: h,
    imageData: pixelData,
    children: [
      {
        name: 'Layer 1',
        imageData: pixelData,
        top: 0,
        left: 0,
      },
    ],
  };

  const arrayBuffer = writePsd(psd);

  return new Blob([arrayBuffer], { type: meta.mime });
}
