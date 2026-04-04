import type { FormatMeta, EncodeOptions } from '../types.js';

import { canvasToBlob } from '../transform/canvas.js';

export const meta: FormatMeta = {
  key: 'png',
  aliases: [],
  label: 'PNG',
  mime: 'image/png',
  ext: 'png',
  supportsCompression: true,
  compressionType: 'lossless',
  defaultQuality: 100,
  qualityRange: [1, 100],
  qualityHint: 'Controls optimization effort — no quality loss',
  requiresAlphaCompositing: false,
  supportsTransparency: true,
};

/**
 * Encode a Canvas to PNG via Canvas.toBlob().
 * PNG is lossless — quality controls OxiPNG optimization level (future).
 * For v0.1.0: always outputs unoptimized PNG.
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  // PNG doesn't accept a quality parameter in Canvas API
  return canvasToBlob(canvas, meta.mime);
}
