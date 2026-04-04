// ─── heiccon — Main Entry Point ──────────────────────────────
// Re-exports the full public API.

// Pipeline (high-level)
export { convert } from './pipeline/convert.js';
export { convertBatch } from './pipeline/batch.js';

// Decode
export { decode, isHeic } from './decode/decode.js';

// Encode
export { encode, getEncoder, getFormatInfo, getSupportedFormats, canEncode } from './encode/router.js';

// Transform
export { toCanvas, resize, compositeAlpha, createCanvas, canvasToBlob } from './transform/index.js';

// Compression
export { normalizeQuality, getCompressionMeta } from './compression/normalize.js';

// Types
export type {
  FormatKey,
  ConvertOptions,
  ConvertResult,
  ResizeOptions,
  BatchOptions,
  BatchProgress,
  EncodeOptions,
  EncoderModule,
  FormatMeta,
} from './types.js';

// Errors
export {
  HeicconError,
  DecodeError,
  EncodeError,
  TransformError,
} from './errors.js';
