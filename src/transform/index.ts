import type { ResizeOptions, FormatMeta } from '../types.js';

import { TransformError } from '../errors.js';
import { createCanvas } from './canvas.js';
import { resize } from './resize.js';
import { compositeAlpha } from './alpha.js';

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

/**
 * Full transform: ImageBitmap → Canvas with optional resize + alpha compositing.
 *
 * @param bitmap  - Decoded ImageBitmap from the HEIC decoder
 * @param meta    - Encoder metadata (used to determine alpha compositing needs)
 * @param resizeOpts - Optional resize config
 * @returns A ready-to-encode Canvas
 */
export function toCanvas(
  bitmap: ImageBitmap,
  meta: FormatMeta,
  resizeOpts?: ResizeOptions,
): AnyCanvas {
  let canvas: AnyCanvas;

  // Step 1: Resize if requested, otherwise draw bitmap to canvas 1:1
  if (resizeOpts?.width || resizeOpts?.height) {
    canvas = resize(bitmap, resizeOpts);
  } else {
    canvas = createCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D;

    if (!ctx) {
      throw new TransformError('RESIZE_FAILED', 'Failed to get 2D context');
    }

    ctx.drawImage(bitmap, 0, 0);
  }

  // Step 2: Alpha → white compositing (for JPEG, BMP, etc.)
  canvas = compositeAlpha(canvas, meta);

  // Clean up the source bitmap
  bitmap.close();

  return canvas;
}

export { createCanvas, canvasToBlob } from './canvas.js';
export { resize } from './resize.js';
export { compositeAlpha } from './alpha.js';
