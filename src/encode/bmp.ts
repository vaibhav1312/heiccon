import type { FormatMeta, EncodeOptions } from '../types.js';

import { EncodeError } from '../errors.js';

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
 * Phase 2 implementation — fast-bmp must be installed.
 */
export async function encode(
  _canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  throw new EncodeError(
    'MISSING_DEPENDENCY',
    'BMP encoder requires fast-bmp. Install it: npm install fast-bmp. Available in v0.2.0.',
  );
}
