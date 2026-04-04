/**
 * Canvas abstraction: works in both main thread (HTMLCanvasElement)
 * and Web Worker (OffscreenCanvas).
 */

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const isWorkerEnv = /*@__PURE__*/ (() => {
  try {
    return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
  } catch {
    return false;
  }
})();

/** Create a Canvas of the given dimensions (auto-detects Worker vs main thread) */
export function createCanvas(width: number, height: number): AnyCanvas {
  if (isWorkerEnv) {
    return new OffscreenCanvas(width, height);
  }
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

/**
 * Convert a Canvas to a Blob. Handles both HTMLCanvasElement.toBlob()
 * and OffscreenCanvas.convertToBlob() transparently.
 */
export function canvasToBlob(
  canvas: AnyCanvas,
  type: string,
  quality?: number,
): Promise<Blob> {
  // OffscreenCanvas (Worker context)
  if ('convertToBlob' in canvas && typeof canvas.convertToBlob === 'function') {
    const opts: ImageEncodeOptions = { type };
    if (quality !== undefined) opts.quality = quality;
    return canvas.convertToBlob(opts);
  }

  // HTMLCanvasElement (main thread)
  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`${type} encoding failed`))),
      type,
      quality,
    );
  });
}
