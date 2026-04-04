import type { FormatMeta, EncodeOptions } from '../types.js';

import { canvasToBlob } from '../transform/canvas.js';
import { normalizeQuality } from '../compression/normalize.js';

export const meta: FormatMeta = {
  key: 'jpg',
  aliases: ['jpeg', 'jfif'],
  label: 'JPEG',
  mime: 'image/jpeg',
  ext: 'jpg',
  supportsCompression: true,
  compressionType: 'lossy',
  defaultQuality: 92,
  qualityRange: [1, 100],
  qualityHint: 'Lower = smaller file, more artifacts',
  requiresAlphaCompositing: true,
  supportsTransparency: false,
};

/**
 * Encode a Canvas to JPEG via Canvas.toBlob().
 * Quality 0-100 is normalized to Canvas's 0.0-1.0.
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options?: EncodeOptions,
): Promise<Blob> {
  const q = normalizeQuality('jpg', options?.quality ?? meta.defaultQuality!);
  return canvasToBlob(canvas, meta.mime, q);
}
