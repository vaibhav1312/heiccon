# Contributing to heiccon

Thanks for your interest in contributing to heiccon! This guide will help you get set up and understand how the project works.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- A modern browser (for running browser-mode tests)

### Setup

```bash
git clone https://github.com/vaibhav1312/heiccon.git
cd heiccon
npm install
```

### Verify everything works

```bash
npm test          # Run all tests
npm run build     # Build ESM + CJS + DTS
npm run lint      # Type check (tsc --noEmit)
```

---

## Project Structure

```
heiccon/
├── src/                    # Source code (TypeScript)
│   ├── index.ts            # Barrel — re-exports everything
│   ├── types.ts            # All shared TypeScript types
│   ├── errors.ts           # Typed error classes
│   ├── decode/             # HEIC decoder (wraps heic-to)
│   │   ├── index.ts
│   │   └── decode.ts
│   ├── encode/             # Encoders — one file per format
│   │   ├── index.ts
│   │   ├── router.ts       # Format key → lazy-loaded encoder
│   │   ├── jpg.ts
│   │   ├── png.ts
│   │   ├── webp.ts
│   │   ├── avif.ts
│   │   ├── gif.ts          # Stubs — Phase 2
│   │   ├── bmp.ts
│   │   ├── tiff.ts
│   │   ├── psd.ts
│   │   ├── tga.ts
│   │   ├── ppm.ts          # Fully implemented (manual P6)
│   │   └── ico.ts
│   ├── transform/          # Canvas operations
│   │   ├── index.ts
│   │   ├── canvas.ts       # Canvas abstraction (main thread + Worker)
│   │   ├── resize.ts       # Resize with fit modes
│   │   └── alpha.ts        # Alpha → white compositing
│   ├── pipeline/           # High-level orchestration
│   │   ├── index.ts
│   │   ├── convert.ts      # Single file conversion
│   │   └── batch.ts        # Batch conversion with concurrency
│   └── compression/        # Quality normalization
│       ├── index.ts
│       └── normalize.ts    # 0-100 → library-specific params
│
├── test/                   # Tests (mirrors src/ structure)
│   ├── compression/
│   ├── encode/
│   ├── errors/
│   └── transform/
│
├── dist/                   # Build output (gitignored)
├── package.json
├── tsconfig.json
├── tsup.config.ts          # Build config — 17 entry points
├── vitest.config.ts        # Test config
├── README.md
└── CONTRIBUTING.md         # This file
```

---

## How It Works

heiccon uses a two-stage pipeline:

```
HEIC file → DECODE (heic-to WASM) → ImageBitmap → Canvas → ENCODE → Blob
```

1. **Decode** — `heic-to` uses libheif compiled to WASM to decode HEIC into an `ImageBitmap`
2. **Transform** — The bitmap is drawn onto a Canvas, optionally resized, and alpha-composited onto white for formats that don't support transparency (JPEG, BMP)
3. **Encode** — The Canvas is encoded to the target format using either native `canvas.toBlob()` (Tier 1: JPG, PNG, WebP, AVIF) or a third-party JS library (Tier 2: GIF, BMP, TIFF, PSD, TGA, PPM, ICO)

Each encoder is **lazy-loaded** via dynamic `import()`. The router in `src/encode/router.ts` maps format keys to their encoder module and caches them after first load.

---

## Development Workflow

### Running tests

```bash
npm test                    # Run all tests once
npx vitest                  # Watch mode (re-runs on save)
npx vitest run --reporter=verbose  # Verbose output
```

### Building

```bash
npm run build               # tsup → dist/ (ESM + CJS + DTS)
```

The build produces 17 entry points matching the package.json `exports` map. Each encoder gets its own chunk file.

### Type checking

```bash
npm run lint                # tsc --noEmit
```

---

## Adding a New Encoder

If you want to implement one of the Phase 2 stub encoders (GIF, BMP, TIFF, PSD, TGA, ICO):

### 1. Install the encoding library

```bash
npm install gifenc          # example for GIF
```

### 2. Implement the encoder

Open the stub file (e.g., `src/encode/gif.ts`). It currently throws `MISSING_DEPENDENCY`. Replace the `encode()` function with the real implementation:

```ts
// src/encode/gif.ts
import type { FormatMeta, EncodeOptions } from '../types.js';
import { normalizeQuality } from '../compression/normalize.js';
import { EncodeError } from '../errors.js';

export const meta: FormatMeta = {
  // ... keep existing meta unchanged
};

export async function encode(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options?: EncodeOptions,
): Promise<Blob> {
  // 1. Get pixel data from canvas
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 2. Import the library
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

  // 3. Encode
  const maxColors = normalizeQuality('gif', options?.quality ?? meta.defaultQuality!) as number;
  const palette = quantize(imageData.data, maxColors);
  const index = applyPalette(imageData.data, palette);

  const gif = GIFEncoder();
  gif.writeFrame(index, canvas.width, canvas.height, { palette });
  gif.finish();

  return new Blob([gif.bytes()], { type: meta.mime });
}
```

### 3. Write tests

Create `test/encode/gif.test.ts`. At minimum, test:
- The `meta` object has correct fields
- `encode()` produces a Blob with the right MIME type (requires browser-mode test or mocked Canvas)

### 4. Verify

```bash
npm run lint     # No TypeScript errors
npm test         # All tests pass
npm run build    # Build succeeds
```

---

## Coding Conventions

- **TypeScript strict mode** — no `any`, no implicit returns, no unused variables
- **ES modules** — all imports use `.js` extension (TypeScript ESM convention)
- **Functional style** — prefer pure functions, avoid classes (except error classes)
- **Descriptive error messages** — every error should tell the user what happened and how to fix it
- **Lazy loading** — encoders are loaded via `import()` on first use, never eagerly
- **One encoder per file** — each format gets its own `src/encode/{format}.ts`
- **Quality normalization** — all quality values go through `normalizeQuality()` — never pass raw values to Canvas or libraries

---

## Commit Messages

Use conventional commits:

```
feat: add GIF encoder via gifenc
fix: handle AVIF fallback when Canvas AVIF is unsupported
test: add browser-mode tests for JPG encoder
docs: update README with GIF usage example
chore: bump heic-to to 1.5.0
```

---

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm run lint && npm test && npm run build` — all must pass
4. Write or update tests for your changes
5. Update README.md if you added a new format or changed API
6. Open a PR with a clear description of what and why

---

## Questions?

Open an [issue](https://github.com/vaibhav1312/heiccon/issues) or start a [discussion](https://github.com/vaibhav1312/heiccon/discussions).
