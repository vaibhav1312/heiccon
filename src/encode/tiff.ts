import type { FormatMeta, EncodeOptions } from '../types.js';

import { EncodeError } from '../errors.js';

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
 * Encode a Canvas to TIFF using UTIF.js.
 * Phase 2 implementation — utif must be installed.
 */
export async function encode(
  _canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  throw new EncodeError(
    'MISSING_DEPENDENCY',
    'TIFF encoder requires utif. Install it: npm install utif. Available in v0.2.0.',
  );
}
