// ─── Format Keys ─────────────────────────────────────────────

/** All supported output format keys */
export type FormatKey =
  | 'jpg'
  | 'jpeg'
  | 'jfif'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'bmp'
  | 'tiff'
  | 'tif'
  | 'psd'
  | 'tga'
  | 'ppm'
  | 'ico';

// ─── Convert Options ─────────────────────────────────────────

export interface ConvertOptions {
  /** Target format key */
  format: FormatKey;

  /** Quality 0-100. If omitted, uses format-specific default. */
  quality?: number;

  /** Resize options. If omitted, output matches input dimensions. */
  resize?: ResizeOptions;

  /** Strip EXIF/metadata. Default: false */
  stripMetadata?: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  /** Resize strategy. Default: 'contain' */
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
}

// ─── Convert Result ──────────────────────────────────────────

export interface ConvertResult {
  /** The converted image as a Blob */
  blob: Blob;
  /** Suggested filename (e.g., 'photo.jpg') */
  filename: string;
  /** Output width in pixels */
  width: number;
  /** Output height in pixels */
  height: number;
  /** Format key used */
  format: FormatKey;
  /** MIME type of the output */
  mime: string;
  /** Output file size in bytes */
  size: number;
}

// ─── Batch ───────────────────────────────────────────────────

export interface BatchOptions extends ConvertOptions {
  /** Max concurrent conversions. Default: 4 */
  concurrency?: number;
  /** Progress callback — called after each file completes */
  onProgress?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
  completed: number;
  total: number;
  current: ConvertResult;
}

// ─── Encoder Module ──────────────────────────────────────────

export interface EncodeOptions {
  /** Quality 0-100 */
  quality?: number;
}

export interface EncoderModule {
  meta: FormatMeta;
  encode: (
    canvas: HTMLCanvasElement | OffscreenCanvas,
    options?: EncodeOptions,
  ) => Promise<Blob>;
}

// ─── Format Metadata ─────────────────────────────────────────

export interface FormatMeta {
  /** Canonical format key */
  key: FormatKey;
  /** Alias keys that resolve to this encoder */
  aliases: FormatKey[];
  /** Human-readable label: "JPEG", "AVIF", "BMP" */
  label: string;
  /** MIME type: 'image/jpeg', 'image/avif', etc. */
  mime: string;
  /** File extension: 'jpg', 'avif', etc. */
  ext: string;
  /** Whether this format supports quality control */
  supportsCompression: boolean;
  /** Compression strategy */
  compressionType: 'lossy' | 'lossless' | 'palette' | 'none';
  /** Default quality when compression is enabled (null for uncompressible) */
  defaultQuality: number | null;
  /** Quality range [min, max] or null */
  qualityRange: [number, number] | null;
  /** UI hint text for quality slider */
  qualityHint: string;
  /** true for formats without alpha (JPEG, BMP) — need white bg compositing */
  requiresAlphaCompositing: boolean;
  /** Whether the format supports transparency */
  supportsTransparency: boolean;
}
