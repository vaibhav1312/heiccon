import type { FormatMeta, EncodeOptions } from '../types.js';

import { EncodeError } from '../errors.js';

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
 * Phase 2 implementation — gifenc must be installed.
 */
export async function encode(
  _canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  throw new EncodeError(
    'MISSING_DEPENDENCY',
    'GIF encoder requires gifenc. Install it: npm install gifenc. Available in v0.2.0.',
  );
}
