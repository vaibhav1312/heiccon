import type { ResizeOptions } from '../types.js';

import { TransformError } from '../errors.js';
import { createCanvas } from './canvas.js';

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

interface DrawParams {
  /** Destination width */
  dw: number;
  /** Destination height */
  dh: number;
  /** Source x offset */
  sx: number;
  /** Source y offset */
  sy: number;
  /** Source width */
  sw: number;
  /** Source height */
  sh: number;
}

/**
 * Compute resize dimensions based on fit strategy.
 * Exported for testing and UI preview calculations.
 */
export function computeDimensions(
  srcW: number,
  srcH: number,
  opts: ResizeOptions,
): DrawParams {
  const targetW = opts.width ?? 0;
  const targetH = opts.height ?? 0;
  const fit = opts.fit ?? 'contain';

  // No resize requested
  if (!targetW && !targetH) {
    return { dw: srcW, dh: srcH, sx: 0, sy: 0, sw: srcW, sh: srcH };
  }

  if (fit === 'fill') {
    return {
      dw: targetW || srcW,
      dh: targetH || srcH,
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
    };
  }

  if (fit === 'cover') {
    const outW = targetW || srcW;
    const outH = targetH || srcH;
    const scale = Math.max(outW / srcW, outH / srcH);
    const cropW = outW / scale;
    const cropH = outH / scale;
    return {
      dw: outW,
      dh: outH,
      sx: (srcW - cropW) / 2,
      sy: (srcH - cropH) / 2,
      sw: cropW,
      sh: cropH,
    };
  }

  if (fit === 'inside') {
    // Scale down only — never upscale
    const tw = targetW || Infinity;
    const th = targetH || Infinity;
    const scale = Math.min(tw / srcW, th / srcH, 1);
    return {
      dw: Math.round(srcW * scale),
      dh: Math.round(srcH * scale),
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
    };
  }

  if (fit === 'outside') {
    // Scale to fill at least the target box
    const tw = targetW || 0;
    const th = targetH || 0;
    const scale = Math.max(tw / srcW, th / srcH);
    return {
      dw: Math.round(srcW * scale),
      dh: Math.round(srcH * scale),
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
    };
  }

  // Default: contain — scale to fit within target, preserving aspect ratio
  const tw = targetW || Infinity;
  const th = targetH || Infinity;
  const scale = Math.min(tw / srcW, th / srcH, 1);
  return {
    dw: Math.round(srcW * scale),
    dh: Math.round(srcH * scale),
    sx: 0,
    sy: 0,
    sw: srcW,
    sh: srcH,
  };
}

/**
 * Resize an ImageBitmap or Canvas to target dimensions.
 * Returns a new Canvas with the resized image.
 *
 * @throws {TransformError} if the canvas dimensions exceed browser limits
 */
export function resize(
  source: ImageBitmap | AnyCanvas,
  opts: ResizeOptions,
): AnyCanvas {
  const srcW = source.width;
  const srcH = source.height;
  const { dw, dh, sx, sy, sw, sh } = computeDimensions(srcW, srcH, opts);

  // Guard against absurdly large canvas
  const MAX_CANVAS = 16384;
  if (dw > MAX_CANVAS || dh > MAX_CANVAS) {
    throw new TransformError(
      'CANVAS_TOO_LARGE',
      `Resize target ${dw}×${dh} exceeds maximum canvas size of ${MAX_CANVAS}px`,
    );
  }

  const canvas = createCanvas(dw, dh);
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  if (!ctx) {
    throw new TransformError('RESIZE_FAILED', 'Failed to get 2D context for resize canvas');
  }

  ctx.drawImage(source as CanvasImageSource, sx, sy, sw, sh, 0, 0, dw, dh);

  return canvas;
}
