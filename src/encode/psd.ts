import type { FormatMeta, EncodeOptions } from '../types.js';

import { EncodeError } from '../errors.js';

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
 * Phase 2 implementation — ag-psd must be installed.
 */
export async function encode(
  _canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  throw new EncodeError(
    'MISSING_DEPENDENCY',
    'PSD encoder requires ag-psd. Install it: npm install ag-psd. Available in v0.2.0.',
  );
}
