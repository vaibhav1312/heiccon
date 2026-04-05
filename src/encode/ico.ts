import type { FormatMeta, EncodeOptions } from '../types.js';

import { canvasToBlob, createCanvas } from '../transform/canvas.js';

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

/** Standard ICO sizes to include (largest to smallest) */
const ICO_SIZES = [256, 128, 64, 48, 32, 16] as const;

/**
 * Encode a Canvas to ICO format.
 * Produces a multi-size ICO with PNG-compressed entries.
 * Includes sizes: 256, 128, 64, 48, 32, 16 (all that fit within the source).
 */
export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  _options?: EncodeOptions,
): Promise<Blob> {
  const srcW = canvas.width;
  const srcH = canvas.height;
  const size = Math.min(srcW, srcH);

  // Filter sizes that fit within the source image
  const sizes: number[] = ICO_SIZES.filter((s) => s <= size);
  if (sizes.length === 0) {
    // Source is smaller than 16px — just use its actual size
    sizes.push(Math.min(size, 16));
  }

  // Generate PNG blobs for each size
  const pngEntries: { size: number; data: Uint8Array }[] = [];

  for (const s of sizes) {
    const scaled = createCanvas(s, s);
    const ctx = scaled.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D;

    if (!ctx) throw new Error('Failed to get 2D context for ICO encoding');

    // Draw source scaled to fit
    ctx.drawImage(canvas as HTMLCanvasElement, 0, 0, s, s);

    const pngBlob = await canvasToBlob(scaled, 'image/png');
    const buffer = await pngBlob.arrayBuffer();
    pngEntries.push({ size: s, data: new Uint8Array(buffer) });
  }

  // Build ICO file
  // ICO Header: 6 bytes
  // Each directory entry: 16 bytes
  // Then PNG data blocks
  const numImages = pngEntries.length;
  const headerSize = 6;
  const dirSize = 16 * numImages;
  let dataOffset = headerSize + dirSize;

  // Calculate total file size
  let totalSize = dataOffset;
  for (const entry of pngEntries) {
    totalSize += entry.data.length;
  }

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // ICO Header
  view.setUint16(0, 0, true);              // Reserved: 0
  view.setUint16(2, 1, true);              // Type: 1 = ICO
  view.setUint16(4, numImages, true);      // Number of images

  // Directory entries + PNG data
  for (let i = 0; i < pngEntries.length; i++) {
    const entry = pngEntries[i]!;
    const dirOffset = headerSize + i * 16;

    // ICO directory entry (16 bytes)
    view.setUint8(dirOffset, entry.size >= 256 ? 0 : entry.size);  // Width (0 = 256)
    view.setUint8(dirOffset + 1, entry.size >= 256 ? 0 : entry.size);  // Height
    view.setUint8(dirOffset + 2, 0);       // Color palette: 0
    view.setUint8(dirOffset + 3, 0);       // Reserved: 0
    view.setUint16(dirOffset + 4, 1, true);  // Color planes: 1
    view.setUint16(dirOffset + 6, 32, true); // Bits per pixel: 32
    view.setUint32(dirOffset + 8, entry.data.length, true);  // Image data size
    view.setUint32(dirOffset + 12, dataOffset, true);         // Offset to image data

    // Write PNG data
    bytes.set(entry.data, dataOffset);
    dataOffset += entry.data.length;
  }

  return new Blob([buffer], { type: meta.mime });
}
