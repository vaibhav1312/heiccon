/**
 * Normalize a 0-100 quality value to the library-specific parameter.
 *
 * | Format   | Input 0-100 → Output                    |
 * |----------|------------------------------------------|
 * | jpg/webp | 0.0-1.0 (Canvas quality)                |
 * | avif     | 0.0-1.0 (Canvas quality)                |
 * | png      | OxiPNG level 1-6 (future)               |
 * | gif      | maxColors 2-256                          |
 * | others   | N/A (returns undefined)                  |
 */
export function normalizeQuality(
  format: string,
  quality: number | null | undefined,
): number | undefined {
  if (quality == null) return undefined;

  const key = format.toLowerCase();

  switch (key) {
    // Canvas quality: 0.0 - 1.0
    case 'jpg':
    case 'jpeg':
    case 'jfif':
    case 'webp':
    case 'avif':
      return clamp(quality, 0, 100) / 100;

    // OxiPNG optimization level: 1-6 (inverted scale)
    case 'png':
      return Math.min(6, Math.ceil((100 - clamp(quality, 0, 100)) / 20) + 1);

    // GIF palette size: 2-256
    case 'gif':
      return Math.round((clamp(quality, 0, 100) / 100) * 254) + 2;

    // No quality parameter for these formats
    default:
      return undefined;
  }
}

/**
 * Get compression metadata for a format.
 */
export function getCompressionMeta(format: string): {
  hasQuality: boolean;
  qualityLabel: string;
} {
  const key = format.toLowerCase();

  switch (key) {
    case 'jpg':
    case 'jpeg':
    case 'jfif':
    case 'webp':
    case 'avif':
      return { hasQuality: true, qualityLabel: 'Compression quality' };
    case 'png':
      return { hasQuality: true, qualityLabel: 'Optimization effort' };
    case 'gif':
      return { hasQuality: true, qualityLabel: 'Palette size' };
    default:
      return { hasQuality: false, qualityLabel: '' };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
