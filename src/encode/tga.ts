import type { FormatMeta, EncodeOptions } from '../types.js';

import { EncodeError } from '../errors.js';

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
 * Phase 2 implementation.
 */
export async function encode(
  _canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  throw new EncodeError(
    'MISSING_DEPENDENCY',
    'TGA encoder requires @lunapaint/tga-codec. Install it: npm install @lunapaint/tga-codec. Available in v0.2.0.',
  );
}
