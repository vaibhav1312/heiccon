import type { FormatMeta, EncodeOptions } from '../types.js';

import { canvasToBlob } from '../transform/canvas.js';
import { normalizeQuality } from '../compression/normalize.js';

export const meta: FormatMeta = {
  key: 'webp',
  aliases: [],
  label: 'WebP',
  mime: 'image/webp',
  ext: 'webp',
  supportsCompression: true,
  compressionType: 'lossy',
  defaultQuality: 92,
  qualityRange: [1, 100],
  qualityHint: 'Lower = smaller file, more artifacts',
  requiresAlphaCompositing: false,
  supportsTransparency: true,
};

/**
 * Encode a Canvas to WebP via Canvas.toBlob().
 * Quality 0-100 is normalized to Canvas's 0.0-1.0.
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options?: EncodeOptions,
): Promise<Blob> {
  const q = normalizeQuality('webp', options?.quality ?? meta.defaultQuality!);
  return canvasToBlob(canvas, meta.mime, q);
}
