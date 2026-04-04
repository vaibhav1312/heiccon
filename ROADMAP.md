# heiccon — Roadmap & Architecture

> **Status:** Phase 0 — Architecture & Design
> **npm:** heiccon
> **License:** MIT

---

## Goal

The most complete client-side HEIC/HEIF conversion library on npm. 14 output formats, zero server uploads, one `convert()` call.

---

## Conversion Pipeline

```
HEIC/HEIF file (Blob/File)
    │
    ▼
┌─ DECODE ──────────────────────────────────────┐
│  heic-to v1.4.2 (libheif WASM)               │
│  → ImageBitmap                                 │
└────────────────────────────────────────────────┘
    │
    ▼
┌─ TRANSFORM ───────────────────────────────────┐
│  ImageBitmap → Canvas                          │
│  ├─ EXIF orientation correction               │
│  ├─ Resize (contain/cover/fill)               │
│  └─ Alpha → white composite (for JPG/BMP)     │
└────────────────────────────────────────────────┘
    │
    ▼
┌─ ENCODE (per format) ─────────────────────────┐
│  Canvas native: JPG, PNG, WebP, AVIF          │
│  Library-based: GIF, BMP, TIFF, PSD, TGA,     │
│                 PPM, ICO                        │
│  → Blob                                        │
└────────────────────────────────────────────────┘
```

---

## Architecture

### Sub-path Exports

Each encoder is a separate entry point — import only what you need.

```
heiccon
├── /              — full library
├── /decode        — HEIC → ImageBitmap
├── /encode        — encoder router + metadata
├── /encode/jpg    — JPG encoder only (~0.5 KB)
├── /encode/png    — PNG encoder
├── /encode/webp   — WebP encoder
├── /encode/avif   — AVIF encoder (Canvas + WASM fallback)
├── /encode/gif    — GIF encoder (gifenc)
├── /encode/bmp    — BMP encoder (fast-bmp)
├── /encode/tiff   — TIFF encoder (UTIF.js)
├── /encode/psd    — PSD encoder (ag-psd)
├── /encode/tga    — TGA encoder (@lunapaint/tga-codec)
├── /encode/ppm    — PPM encoder (manual)
├── /encode/ico    — ICO encoder (manual)
├── /transform     — resize, alpha compositing
├── /pipeline      — decode → transform → encode orchestration
└── /compression   — quality normalization
```

### Import Examples

```typescript
// One-call conversion
import { convert } from 'heiccon';
const result = await convert(heicFile, { format: 'jpg', quality: 85 });

// Batch conversion
import { convertBatch } from 'heiccon';
const results = await convertBatch(files, {
  format: 'png',
  onProgress: ({ completed, total }) => updateUI(completed / total),
});

// Just decode
import { decode } from 'heiccon/decode';
const bitmap = await decode(heicFile);

// Just encode (bring your own Canvas)
import { encode } from 'heiccon/encode';
const blob = await encode(canvas, { format: 'avif', quality: 60 });

// Individual encoder (maximum tree-shaking)
import { encode as encodeJpg } from 'heiccon/encode/jpg';
const blob = await encodeJpg(canvas, { quality: 92 });

// Format discovery
import { getSupportedFormats, getFormatInfo } from 'heiccon/encode';
const formats = getSupportedFormats();
```

---

## Supported Formats

### Tier 1 — Canvas Native

| Format | Key(s) | Default Quality | Extra Deps |
|--------|--------|----------------|------------|
| JPEG | jpg, jpeg, jfif | 92 | None |
| PNG | png | N/A (lossless) | @jsquash/oxipng (optional) |
| WebP | webp | 92 | None |
| AVIF | avif | 50 | @jsquash/avif (fallback) |

### Tier 2 — Library-based

| Format | Key(s) | Library | Bundle Size |
|--------|--------|---------|-------------|
| GIF | gif | gifenc | ~5 KB |
| BMP | bmp | fast-bmp | ~2 KB |
| TIFF | tiff, tif | UTIF.js | ~40 KB |
| PSD | psd | ag-psd | ~100 KB |
| TGA | tga | @lunapaint/tga-codec | ~5 KB |
| PPM | ppm | Manual | ~0.5 KB |
| ICO | ico | Manual | ~2 KB |

All Tier 2 encoders are **lazy-loaded** — only fetched when their format is requested.

---

## Quality Scale

Unified 0-100 across all formats. The library normalizes to each encoder's native range internally.

| Format | 0-100 maps to | Notes |
|--------|--------------|-------|
| JPG/WebP | Canvas 0.0-1.0 | 92 = visually lossless |
| AVIF | Canvas 0.0-1.0 or @jsquash raw | 50 ≈ JPEG 85 |
| PNG | OxiPNG optimization level | Lossless — effort only |
| GIF | maxColors 2-256 | Palette size |
| BMP/TIFF/PSD/TGA/PPM/ICO | N/A | No quality parameter |

---

## API Surface

### Core Types

```typescript
type FormatKey =
  | 'jpg' | 'jpeg' | 'jfif' | 'png' | 'webp' | 'avif'
  | 'gif' | 'bmp' | 'tiff' | 'tif' | 'psd' | 'tga' | 'ppm' | 'ico';

interface ConvertOptions {
  format: FormatKey;
  quality?: number;          // 0-100
  resize?: ResizeOptions;
  stripMetadata?: boolean;
}

interface ConvertResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  format: FormatKey;
  mime: string;
  size: number;
}
```

### Error Types

```typescript
class HeicconError extends Error { code: string }
class DecodeError extends HeicconError { /* NOT_HEIC, DECODE_FAILED, WASM_LOAD_FAILED */ }
class EncodeError extends HeicconError { /* ENCODE_FAILED, UNSUPPORTED_FORMAT, MISSING_DEPENDENCY */ }
class TransformError extends HeicconError { /* RESIZE_FAILED, CANVAS_TOO_LARGE */ }
```

---

## Build & Tooling

| Tool | Purpose |
|------|---------|
| TypeScript 5.x | Source language, strict mode |
| tsup | Build (ESM + CJS + DTS) |
| Vitest | Testing (browser mode for Canvas/WASM) |
| changesets | Versioning & changelog |
| GitHub Actions | CI/CD |
| size-limit | Bundle size guard |

---

## Roadmap

### v0.1.0 — Foundation
- [ ] Project scaffolding
- [ ] Types, errors
- [ ] HEIC decode (heic-to wrapper)
- [ ] JPG, PNG, WebP encoders (Canvas native)
- [ ] Transform: Canvas bridge, alpha compositing
- [ ] Pipeline: single file conversion
- [ ] Tests

### v0.2.0 — Full Format Coverage
- [ ] AVIF encoder (Canvas + @jsquash/avif WASM fallback)
- [ ] GIF, BMP, TIFF, PSD, TGA, PPM, ICO encoders
- [ ] Quality normalization (0-100 scale)
- [ ] Tests for all encoders

### v0.3.0 — Batch & Transform
- [ ] Batch conversion with concurrency + progress
- [ ] Resize with fit modes (contain, cover, fill, inside, outside)
- [ ] `isHeic()` file detection
- [ ] Error handling polish

### v1.0.0 — Stable Release
- [ ] Full README with API docs, examples, bundler setup
- [ ] CI/CD pipeline (test → build → publish)
- [ ] size-limit budgets
- [ ] npm publish

### Post-v1
- [ ] Web Worker support
- [ ] MozJPEG via @jsquash/jpeg
- [ ] OxiPNG lossless optimization
- [ ] OffscreenCanvas support
- [ ] EXIF preservation
- [ ] Node.js support via node-canvas

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime target | Browser-only (v1) | Canvas, ImageBitmap, toBlob are browser APIs |
| Canvas type | HTMLCanvasElement | Universal support; OffscreenCanvas post-v1 |
| WASM loading | Dynamic import() | Bundlers auto-split into separate chunks |
| Encoder loading | Lazy dynamic import() | Only load what you use |
| Package structure | Single package + sub-path exports | One install, same tree-shaking as separate packages |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---

## License

MIT
