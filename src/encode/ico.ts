import type { FormatMeta, EncodeOptions } from '../types.js';

import { EncodeError } from '../errors.js';

export const meta: FormatMeta = {
  key: 'ico',
  aliases: [],
  label: 'ICO',
  mime: 'image/x-icon',
  ext: 'ico',
  supportsCompression: false,
  compressionType: 'none',
  defaultQuality: null,
  qualityRange: null,
  qualityHint: 'ICO uses PNG compression internally for ≥256px',
  requiresAlphaCompositing: false,
  supportsTransparency: true,
};

/**
 * Encode a Canvas to ICO (multi-size BMP/PNG container).
 * Phase 2 implementation — manual encoder.
 */
export async function encode(
  _canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  throw new EncodeError(
    'MISSING_DEPENDENCY',
    'ICO encoder will be available in v0.2.0.',
  );
}
