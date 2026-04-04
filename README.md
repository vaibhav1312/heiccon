<div align="center">

# heiccon

**Convert HEIC/HEIF images to 14 formats — entirely in the browser.** Zero server uploads, one `convert()` call. Supports JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, PSD, TGA, PPM, and ICO. Built with TypeScript, lazy-loaded encoders, unified 0-100 quality scale, resize with fit modes, and batch conversion with progress callbacks.

Built and used in production by **[heiccon.com](https://heiccon.com)** — a free online HEIC converter used by thousands every month. This is the same library that powers the website.

[![npm version](https://img.shields.io/npm/v/heiccon.svg)](https://www.npmjs.com/package/heiccon)
[![bundle size](https://img.shields.io/bundlephobia/minzip/heiccon)](https://bundlephobia.com/package/heiccon)
[![tests](https://img.shields.io/github/actions/workflow/status/vaibhav1312/heiccon/ci.yml?label=tests)](https://github.com/vaibhav1312/heiccon/actions)
[![license](https://img.shields.io/npm/l/heiccon.svg)](./LICENSE)

[Install](#install) · [Quick Start](#quick-start) · [Formats](#supported-formats) · [API Reference](#api-reference) · [Tree Shaking](#tree-shaking) · [Report Bug](https://github.com/vaibhav1312/heiccon/issues)

</div>

---

## Why this library?

|  | heiccon | heic-to | heic2any |
|--|:---:|:---:|:---:|
| Output formats | **14** | 3 | 3 |
| 100% client-side | **Yes** | Yes | Yes |
| Quality control (0-100) | **Yes** | — | — |
| Resize with fit modes | **Yes** | — | — |
| Batch conversion | **Yes** | — | — |
| Progress callbacks | **Yes** | — | — |
| Lazy-loaded encoders | **Yes** | — | — |
| Tree-shakeable sub-paths | **Yes** | — | — |
| TypeScript-first | **Yes** | Partial | — |
| Active maintenance | **Yes** | Limited | Stale (2021) |
| Backed by production site | **Yes** | — | — |

---

## Install

```bash
npm install heiccon
```

Works with npm, yarn, pnpm, and bun.

**Requirements:** Browser environment with Canvas support. Node.js is not supported (Canvas and WASM are browser-only). All modern browsers work — Chrome, Firefox, Safari, Edge.

---

## Quick Start

```ts
import { convert } from 'heiccon';

const result = await convert(heicFile, { format: 'jpg', quality: 85 });

// result.blob     → Blob ready to download or display
// result.filename → 'photo.jpg'
// result.size     → file size in bytes
// result.width    → output width in pixels
// result.height   → output height in pixels
```

Three lines. Pick a file, choose a format, get a Blob.

---

## Usage Examples

### Convert HEIC to JPG

```ts
import { convert } from 'heiccon';

// From a file input
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await convert(file, { format: 'jpg', quality: 92 });

  // Display the converted image
  const url = URL.createObjectURL(result.blob);
  document.querySelector('img').src = url;
});
```

### Convert to any format

```ts
import { convert } from 'heiccon';

// JPG — lossy, smallest files, no transparency
const jpg = await convert(file, { format: 'jpg', quality: 85 });

// PNG — lossless, supports transparency
const png = await convert(file, { format: 'png' });

// WebP — lossy, smaller than JPG, supports transparency
const webp = await convert(file, { format: 'webp', quality: 80 });

// AVIF — best compression, supports transparency
const avif = await convert(file, { format: 'avif', quality: 50 });

// GIF — palette-based, 256 colors max
const gif = await convert(file, { format: 'gif', quality: 100 });

// BMP — uncompressed bitmap
const bmp = await convert(file, { format: 'bmp' });

// TIFF — uncompressed, used in print/publishing
const tiff = await convert(file, { format: 'tiff' });

// PSD — Photoshop format, single flattened layer
const psd = await convert(file, { format: 'psd' });

// TGA — Targa format, used in game development
const tga = await convert(file, { format: 'tga' });

// PPM — raw pixel data, used in scientific imaging
const ppm = await convert(file, { format: 'ppm' });

// ICO — favicon format
const ico = await convert(file, { format: 'ico' });
```

### Resize during conversion

```ts
import { convert } from 'heiccon';

// Fit within 800×600, preserving aspect ratio (never upscales)
const result = await convert(file, {
  format: 'jpg',
  quality: 85,
  resize: { width: 800, height: 600, fit: 'contain' },
});

// Cover 500×500 (crop to fill, no distortion)
const square = await convert(file, {
  format: 'webp',
  resize: { width: 500, height: 500, fit: 'cover' },
});

// Stretch to exact dimensions (may distort)
const stretched = await convert(file, {
  format: 'png',
  resize: { width: 1920, height: 1080, fit: 'fill' },
});
```

**Fit modes explained:**

| Mode | Behavior |
|------|----------|
| `contain` | Fits within target box, preserves aspect ratio. **Never upscales.** (default) |
| `cover` | Fills target box, crops excess. No distortion. |
| `fill` | Stretches to exact dimensions. May distort. |
| `inside` | Like `contain`, but strictly never upscales. |
| `outside` | Scales so both dimensions are at least the target size. |

### Batch conversion

```ts
import { convertBatch } from 'heiccon';

const files = Array.from(fileInput.files); // multiple HEIC files

const results = await convertBatch(files, {
  format: 'jpg',
  quality: 85,
  concurrency: 4, // convert 4 files in parallel (default: 4)
  onProgress: ({ completed, total, current }) => {
    console.log(`${completed}/${total} done — ${current.filename}`);
    progressBar.value = completed / total;
  },
});

// results is an array of ConvertResult objects
results.forEach((r) => console.log(r.filename, r.size));
```

### Trigger a download

```ts
import { convert } from 'heiccon';

const result = await convert(file, { format: 'jpg', quality: 85 });

// Create a download link
const url = URL.createObjectURL(result.blob);
const a = document.createElement('a');
a.href = url;
a.download = result.filename; // 'photo.jpg'
a.click();
URL.revokeObjectURL(url);
```

### Check if a file is HEIC before converting

```ts
import { isHeic } from 'heiccon/decode';

const file = fileInput.files[0];

if (await isHeic(file)) {
  // It's a HEIC file — convert it
  const result = await convert(file, { format: 'jpg' });
} else {
  console.log('Not a HEIC file');
}
```

### Discover supported formats at runtime

```ts
import { getSupportedFormats, getFormatInfo, canEncode } from 'heiccon/encode';

// List all formats
const formats = await getSupportedFormats();
// [{ key: 'jpg', label: 'JPEG', mime: 'image/jpeg', ... }, ...]

// Get info for one format
const info = await getFormatInfo('avif');
// { key: 'avif', label: 'AVIF', supportsCompression: true,
//   compressionType: 'lossy', defaultQuality: 50, ... }

// Check if a format is supported (synchronous)
canEncode('jpg');  // true
canEncode('raw');  // false
```

---

## Supported Formats

| Format | Key(s) | Compression | Transparency | Quality | Library |
|--------|--------|:-----------:|:------------:|:-------:|---------|
| **JPEG** | `jpg`, `jpeg`, `jfif` | Lossy | No | 0-100 | Canvas native |
| **PNG** | `png` | Lossless | Yes | — | Canvas native |
| **WebP** | `webp` | Lossy | Yes | 0-100 | Canvas native |
| **AVIF** | `avif` | Lossy | Yes | 0-100 | Canvas + WASM fallback |
| **GIF** | `gif` | Palette | Yes | 2-256 colors | gifenc |
| **BMP** | `bmp` | None | No | — | fast-bmp |
| **TIFF** | `tiff`, `tif` | None | No | — | UTIF.js |
| **PSD** | `psd` | RLE (auto) | No | — | ag-psd |
| **TGA** | `tga` | RLE (auto) | Yes | — | @lunapaint/tga-codec |
| **PPM** | `ppm` | None | No | — | Built-in |
| **ICO** | `ico` | PNG internal | Yes | — | Built-in |

### Quality Scale

All formats use a universal **0-100** scale. You never need to worry about Canvas `0.0-1.0` vs GIF `maxColors` vs PNG optimization levels — just pass a number from 0 to 100 and heiccon translates it:

| Format | What quality controls | 0 = | 100 = |
|--------|----------------------|-----|-------|
| JPG/WebP/AVIF | Compression ratio | Smallest file, most artifacts | Largest file, best quality |
| PNG | Optimization effort | Maximum effort (slowest) | Minimal effort (fastest) |
| GIF | Palette size | 2 colors | 256 colors |
| BMP/TIFF/PSD/TGA/PPM/ICO | — | No effect | No effect |

---

## Tree Shaking

For minimal bundle size, import from sub-paths. Each encoder is a separate chunk — you only load what you use.

```ts
// ─── Full library (decode + all encoders + pipeline) ────────
import { convert, convertBatch } from 'heiccon';

// ─── Just decode (HEIC → ImageBitmap) ──────────────────────
import { decode, isHeic } from 'heiccon/decode';

// ─── Encoder router (format discovery + encode any) ────────
import { encode, canEncode, getSupportedFormats } from 'heiccon/encode';

// ─── Individual encoder (maximum tree-shaking) ─────────────
import { encode as encodeJpg } from 'heiccon/encode/jpg';
import { encode as encodeAvif } from 'heiccon/encode/avif';
import { meta as jpgMeta } from 'heiccon/encode/jpg';

// ─── Transform utilities ────────────────────────────────────
import { resize, compositeAlpha } from 'heiccon/transform';

// ─── Compression normalization ──────────────────────────────
import { normalizeQuality, getCompressionMeta } from 'heiccon/compression';
```

**CDN deep paths also work:**
```html
<script type="module">
  import { decode } from 'https://esm.sh/heiccon/decode';
  import { encode } from 'https://esm.sh/heiccon/encode/jpg';
</script>
```

---

## API Reference

### `convert(file, options) → Promise<ConvertResult>`

The main entry point. Decodes HEIC, applies transforms, encodes to target format.

```ts
interface ConvertOptions {
  format: FormatKey;         // Target format: 'jpg', 'png', 'webp', 'avif', etc.
  quality?: number;          // 0-100. Omit for format default (92 for lossy, null for lossless).
  resize?: ResizeOptions;    // Resize options. Omit to keep original dimensions.
  stripMetadata?: boolean;   // Strip EXIF/metadata. Default: false.
}

interface ResizeOptions {
  width?: number;            // Target width in pixels.
  height?: number;           // Target height in pixels.
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'; // Default: 'contain'
}

interface ConvertResult {
  blob: Blob;                // The converted image
  filename: string;          // Suggested filename: 'photo.jpg'
  width: number;             // Output width in pixels
  height: number;            // Output height in pixels
  format: FormatKey;         // Format key used: 'jpg'
  mime: string;              // MIME type: 'image/jpeg'
  size: number;              // Output file size in bytes
}
```

### `convertBatch(files, options) → Promise<ConvertResult[]>`

Convert multiple HEIC files in parallel with concurrency control and progress tracking.

```ts
interface BatchOptions extends ConvertOptions {
  concurrency?: number;                        // Max parallel conversions. Default: 4
  onProgress?: (progress: BatchProgress) => void;
}

interface BatchProgress {
  completed: number;         // Files completed so far
  total: number;             // Total files
  current: ConvertResult;    // The result that just finished
}
```

### `decode(file) → Promise<ImageBitmap>`

Low-level HEIC decode. Returns a raw `ImageBitmap` for custom processing.

```ts
import { decode, isHeic } from 'heiccon/decode';

const bitmap = await decode(heicFile);
// bitmap.width, bitmap.height — use with Canvas, WebGL, etc.
```

### `isHeic(file) → Promise<boolean>`

Check whether a file is HEIC/HEIF by reading its magic bytes.

```ts
import { isHeic } from 'heiccon/decode';

if (await isHeic(file)) {
  // Safe to convert
}
```

### `encode(canvas, options) → Promise<Blob>`

Low-level encode. Takes any Canvas (or OffscreenCanvas) and encodes it to the target format. Useful when you already have a Canvas from your own pipeline.

```ts
import { encode } from 'heiccon/encode';

const blob = await encode(canvas, { format: 'avif', quality: 60 });
```

### `canEncode(formatKey) → boolean`

Synchronously check if a format key is supported.

```ts
import { canEncode } from 'heiccon/encode';

canEncode('jpg');   // true
canEncode('raw');   // false
canEncode('jpeg');  // true (alias for jpg)
```

### `getSupportedFormats() → Promise<FormatMeta[]>`

Returns metadata for all supported formats.

### `getFormatInfo(formatKey) → Promise<FormatMeta>`

Returns metadata for a specific format.

```ts
interface FormatMeta {
  key: FormatKey;                  // Canonical key: 'jpg'
  aliases: FormatKey[];            // Alias keys: ['jpeg', 'jfif']
  label: string;                   // Human-readable: 'JPEG'
  mime: string;                    // MIME type: 'image/jpeg'
  ext: string;                     // File extension: 'jpg'
  supportsCompression: boolean;    // Can quality be controlled?
  compressionType: 'lossy' | 'lossless' | 'palette' | 'none';
  defaultQuality: number | null;   // Default when quality is omitted
  qualityRange: [number, number] | null;
  qualityHint: string;             // UI hint text for quality slider
  requiresAlphaCompositing: boolean; // Needs white background (JPEG, BMP)
  supportsTransparency: boolean;   // Can preserve alpha channel
}
```

### Format Keys

All format keys and aliases accepted by the `format` option:

```ts
type FormatKey =
  | 'jpg' | 'jpeg' | 'jfif'   // → JPEG encoder
  | 'png'                      // → PNG encoder
  | 'webp'                     // → WebP encoder
  | 'avif'                     // → AVIF encoder
  | 'gif'                      // → GIF encoder
  | 'bmp'                      // → BMP encoder
  | 'tiff' | 'tif'            // → TIFF encoder
  | 'psd'                      // → PSD encoder
  | 'tga'                      // → TGA encoder
  | 'ppm'                      // → PPM encoder
  | 'ico';                     // → ICO encoder
```

---

## Error Handling

Every failure throws a typed error you can catch and handle:

```ts
import { convert } from 'heiccon';
import { DecodeError, EncodeError, TransformError } from 'heiccon';

try {
  const result = await convert(file, { format: 'avif', quality: 50 });
} catch (error) {
  if (error instanceof DecodeError) {
    switch (error.code) {
      case 'NOT_HEIC':         // File is not HEIC/HEIF
      case 'DECODE_FAILED':    // HEIC file is corrupted or unsupported
      case 'WASM_LOAD_FAILED': // WASM decoder failed to initialize
    }
  }
  if (error instanceof EncodeError) {
    switch (error.code) {
      case 'UNSUPPORTED_FORMAT':   // Unknown format key
      case 'ENCODE_FAILED':        // Canvas encoding failed
      case 'MISSING_DEPENDENCY':   // Optional encoder dep not installed
    }
  }
  if (error instanceof TransformError) {
    switch (error.code) {
      case 'RESIZE_FAILED':     // Canvas resize failed
      case 'CANVAS_TOO_LARGE':  // Dimensions exceed 16384px limit
    }
  }
}
```

---

## How It Works

```
HEIC/HEIF file (Blob or File)
    │
    ▼
┌─ DECODE ─────────────────────────────────────┐
│  heic-to (libheif WASM)                      │
│  → ImageBitmap                                │
└───────────────────────────────────────────────┘
    │
    ▼
┌─ TRANSFORM ──────────────────────────────────┐
│  ImageBitmap → Canvas                         │
│  ├─ Resize (contain/cover/fill) if requested  │
│  └─ Alpha → white composite (for JPEG/BMP)    │
└───────────────────────────────────────────────┘
    │
    ▼
┌─ ENCODE ─────────────────────────────────────┐
│  Canvas → target format Blob                  │
│  (encoder lazy-loaded on first use)           │
└───────────────────────────────────────────────┘
    │
    ▼
ConvertResult { blob, filename, width, height, format, mime, size }
```

Encoders are **lazy-loaded** — the AVIF WASM (3.3 MB) is only fetched when you actually convert to AVIF. If you only convert to JPG, only the tiny JPG encoder (~0.5 KB) is loaded.

---

## Bundler Setup

heiccon uses WASM internally (via `heic-to` for decoding). Most bundlers handle this automatically, but here's the setup if you need it:

### Vite

Works out of the box. No config needed.

### webpack 5

```js
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
};
```

### Next.js

```js
// next.config.js
module.exports = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};
```

---

## Browser Support

| Browser | Minimum Version |
|---------|:--------------:|
| Chrome | 64+ |
| Firefox | 65+ |
| Safari | 14.1+ |
| Edge | 79+ |

Requires `createImageBitmap()`, `Canvas.toBlob()`, and WebAssembly support.

---

## Roadmap

### Phase 1 — Foundation ✅ `v0.1.0`
> Decode + core encoders + pipeline.

- [x] HEIC decode via heic-to (libheif WASM)
- [x] JPG, PNG, WebP encoding via Canvas
- [x] Convert pipeline (single file)
- [x] Batch conversion with concurrency + progress
- [x] Resize with 5 fit modes
- [x] Alpha → white compositing for opaque formats
- [x] Unified 0-100 quality normalization
- [x] 17 sub-path exports for tree shaking
- [x] ESM + CJS + TypeScript declarations
- [x] 82 tests passing

### Phase 2 — Full Format Coverage 🏗️ `v0.2.0`
> All 14 formats fully implemented.

- [ ] AVIF — Canvas + @jsquash/avif WASM fallback
- [ ] GIF — gifenc integration
- [ ] BMP — fast-bmp integration
- [ ] TIFF — UTIF.js integration
- [ ] PSD — ag-psd integration
- [ ] TGA — @lunapaint/tga-codec integration
- [ ] ICO — manual multi-size encoder
- [ ] PPM — ✅ already implemented (built-in P6 encoder)
- [ ] Browser-mode tests for all encoders

### Phase 3 — Polish `v1.0.0`
> Production-ready release.

- [ ] GitHub Actions CI (test, build, size check)
- [ ] GitHub Actions CD (auto-publish on tag)
- [ ] size-limit bundle budget enforcement
- [ ] CHANGELOG.md via changesets
- [ ] npm publish

### Future
- [ ] Web Worker support (offload to background thread)
- [ ] @jsquash/jpeg (MozJPEG) for 10-15% smaller JPEG output
- [ ] @jsquash/oxipng for PNG optimization
- [ ] EXIF preservation (copy HEIC EXIF → JPG/WebP/AVIF)
- [ ] Streaming/progress for large files

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before opening a Pull Request.

```bash
git clone https://github.com/vaibhav1312/heiccon.git
cd heiccon
npm install
npm test          # Run tests
npm run build     # ESM + CJS + DTS
npm run lint      # Type check
```

---

## About

Built and maintained by the team behind **[heiccon.com](https://heiccon.com)** — a free online HEIC converter used by thousands of people every month.

## License

[MIT](./LICENSE) © [heiccon](https://heiccon.com)
