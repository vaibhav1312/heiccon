import { heicTo, isHeic as heicToIsHeic } from 'heic-to';

import { DecodeError } from '../errors.js';

/**
 * Check whether a file is a HEIC/HEIF image.
 * Inspects magic bytes via heic-to's built-in detection.
 */
export async function isHeic(file: Blob): Promise<boolean> {
  try {
    // heic-to types expect File, but works with any Blob
    return await heicToIsHeic(file as File);
  } catch {
    return false;
  }
}

/**
 * Decode a HEIC/HEIF file to an ImageBitmap.
 * Uses heic-to (libheif WASM) under the hood.
 *
 * @throws {DecodeError} if the file is not HEIC or decoding fails
 */
export async function decode(file: Blob): Promise<ImageBitmap> {
  if (!(await isHeic(file))) {
    throw new DecodeError('NOT_HEIC', 'Input file is not a valid HEIC/HEIF image');
  }

  try {
    const bitmap = await heicTo({
      blob: file,
      type: 'bitmap',
    });

    return bitmap as ImageBitmap;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (
      message.includes('WASM') ||
      message.includes('wasm') ||
      message.includes('WebAssembly')
    ) {
      throw new DecodeError('WASM_LOAD_FAILED', `Failed to load HEIC decoder WASM: ${message}`);
    }

    throw new DecodeError('DECODE_FAILED', `HEIC decode failed: ${message}`);
  }
}
