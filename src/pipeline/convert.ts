import type { ConvertOptions, ConvertResult } from '../types.js';

import { decode } from '../decode/decode.js';
import { toCanvas } from '../transform/index.js';
import { getEncoder } from '../encode/router.js';

/**
 * Convert a HEIC/HEIF file to any supported format.
 *
 * Full pipeline: HEIC file → decode (WASM) → transform (Canvas) → encode → Blob
 *
 * @example
 * ```typescript
 * import { convert } from 'heiccon';
 *
 * const result = await convert(heicFile, { format: 'jpg', quality: 85 });
 * // result.blob — ready to download or display
 * ```
 */
export async function convert(
  file: Blob,
  options: ConvertOptions,
): Promise<ConvertResult> {
  const { format, quality, resize: resizeOpts } = options;

  // 1. Load encoder (lazy, cached)
  const encoder = await getEncoder(format);

  // 2. Decode HEIC → ImageBitmap
  const bitmap = await decode(file);

  // 3. Transform: ImageBitmap → Canvas (resize + alpha compositing)
  const canvas = toCanvas(bitmap, encoder.meta, resizeOpts);

  // 4. Encode: Canvas → Blob
  const encodeOpt = quality != null ? { quality } : undefined;
  const blob = await encoder.encode(canvas, encodeOpt);

  // 5. Build filename
  const originalName = (file as File).name ?? 'image';
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const filename = `${baseName}.${encoder.meta.ext}`;

  const width = canvas.width;
  const height = canvas.height;

  return {
    blob,
    filename,
    width,
    height,
    format: encoder.meta.key,
    mime: encoder.meta.mime,
    size: blob.size,
  };
}
