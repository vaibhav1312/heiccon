import type { FormatKey, FormatMeta, EncodeOptions, EncoderModule } from '../types.js';

import { EncodeError } from '../errors.js';

// ─── Encoder Registry ────────────────────────────────────────

type EncoderLoader = () => Promise<EncoderModule>;

const ENCODER_MAP: Record<string, EncoderLoader> = {
  jpg: () => import('./jpg.js'),
  jpeg: () => import('./jpg.js'),
  jfif: () => import('./jpg.js'),
  png: () => import('./png.js'),
  webp: () => import('./webp.js'),
  avif: () => import('./avif.js'),
  gif: () => import('./gif.js'),
  bmp: () => import('./bmp.js'),
  tiff: () => import('./tiff.js'),
  tif: () => import('./tiff.js'),
  psd: () => import('./psd.js'),
  tga: () => import('./tga.js'),
  ppm: () => import('./ppm.js'),
  ico: () => import('./ico.js'),
};

/** Cached encoder modules (loaded once, reused) */
const cache = new Map<string, EncoderModule>();

// ─── Public API ──────────────────────────────────────────────

/**
 * Get the encoder module for a given format key.
 * Lazy-loads on first access, cached thereafter.
 */
export async function getEncoder(formatKey: string): Promise<EncoderModule> {
  const key = formatKey.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const loader = ENCODER_MAP[key];
  if (!loader) {
    throw new EncodeError('UNSUPPORTED_FORMAT', `No encoder for format: ${key}`);
  }

  const mod = await loader();
  cache.set(key, mod);
  return mod;
}

/**
 * Encode a Canvas to the specified format.
 * Convenience wrapper: loads the encoder and calls encode().
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: { format: FormatKey } & EncodeOptions,
): Promise<Blob> {
  const encoder = await getEncoder(options.format);
  return encoder.encode(canvas, options);
}

/**
 * Get format metadata for a specific format key.
 */
export async function getFormatInfo(formatKey: string): Promise<FormatMeta> {
  const encoder = await getEncoder(formatKey);
  return encoder.meta;
}

/**
 * Get metadata for all supported formats.
 * Returns one entry per canonical format (no alias duplicates).
 */
export async function getSupportedFormats(): Promise<FormatMeta[]> {
  // Canonical keys only (skip aliases like jpeg, jfif, tif)
  const canonicalKeys = ['jpg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'psd', 'tga', 'ppm', 'ico'];
  const formats: FormatMeta[] = [];

  for (const key of canonicalKeys) {
    const encoder = await getEncoder(key);
    formats.push(encoder.meta);
  }

  return formats;
}

/**
 * Check if a format key is supported.
 */
export function canEncode(formatKey: string): boolean {
  return formatKey.toLowerCase() in ENCODER_MAP;
}
