import type { FormatMeta } from '../types.js';

import { createCanvas } from './canvas.js';

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

/**
 * Composite an image onto a white background.
 * Required for formats that don't support transparency (JPEG, BMP).
 *
 * If the target format supports transparency, returns the original canvas unchanged.
 */
export function compositeAlpha(
  canvas: AnyCanvas,
  meta: FormatMeta,
): AnyCanvas {
  if (!meta.requiresAlphaCompositing) return canvas;

  const w = 'width' in canvas ? canvas.width : 0;
  const h = 'height' in canvas ? canvas.height : 0;
  const out = createCanvas(w, h);
  const ctx = out.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  if (!ctx) return canvas;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(canvas as CanvasImageSource, 0, 0);

  return out;
}
