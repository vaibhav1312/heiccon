import { describe, it, expect } from 'vitest';

import { canEncode } from '../../src/encode/router.js';
import { EncodeError } from '../../src/errors.js';

// ─── canEncode (synchronous, no Canvas needed) ──────────────

describe('canEncode', () => {
  it.each([
    'jpg', 'jpeg', 'jfif',
    'png',
    'webp',
    'avif',
    'gif',
    'bmp',
    'tiff', 'tif',
    'psd',
    'tga',
    'ppm',
    'ico',
  ])('supports format "%s"', (key) => {
    expect(canEncode(key)).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(canEncode('JPG')).toBe(true);
    expect(canEncode('Png')).toBe(true);
    expect(canEncode('WEBP')).toBe(true);
  });

  it('returns false for unsupported formats', () => {
    expect(canEncode('svg')).toBe(false);
    expect(canEncode('pdf')).toBe(false);
    expect(canEncode('')).toBe(false);
    expect(canEncode('heic')).toBe(false);
  });
});

// ─── getEncoder error path ───────────────────────────────────

describe('getEncoder', () => {
  it('throws UNSUPPORTED_FORMAT for unknown format', async () => {
    // Dynamic import to test the async getEncoder
    const { getEncoder } = await import('../../src/encode/router.js');
    await expect(getEncoder('xyz')).rejects.toThrow(EncodeError);
    await expect(getEncoder('xyz')).rejects.toMatchObject({
      code: 'UNSUPPORTED_FORMAT',
    });
  });
});

// ─── Format metadata (static, no Canvas) ────────────────────

describe('encoder meta (static imports)', () => {
  it('jpg meta has correct canonical fields', async () => {
    const { meta } = await import('../../src/encode/jpg.js');
    expect(meta.key).toBe('jpg');
    expect(meta.aliases).toEqual(['jpeg', 'jfif']);
    expect(meta.mime).toBe('image/jpeg');
    expect(meta.ext).toBe('jpg');
    expect(meta.supportsCompression).toBe(true);
    expect(meta.compressionType).toBe('lossy');
    expect(meta.defaultQuality).toBe(92);
    expect(meta.requiresAlphaCompositing).toBe(true);
    expect(meta.supportsTransparency).toBe(false);
  });

  it('png meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/png.js');
    expect(meta.key).toBe('png');
    expect(meta.mime).toBe('image/png');
    expect(meta.supportsCompression).toBe(true);
    expect(meta.compressionType).toBe('lossless');
    expect(meta.supportsTransparency).toBe(true);
    expect(meta.requiresAlphaCompositing).toBe(false);
  });

  it('webp meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/webp.js');
    expect(meta.key).toBe('webp');
    expect(meta.mime).toBe('image/webp');
    expect(meta.compressionType).toBe('lossy');
    expect(meta.supportsTransparency).toBe(true);
  });

  it('gif meta marks as palette compression', async () => {
    const { meta } = await import('../../src/encode/gif.js');
    expect(meta.key).toBe('gif');
    expect(meta.compressionType).toBe('palette');
    expect(meta.supportsTransparency).toBe(true);
  });

  it('bmp meta has no compression', async () => {
    const { meta } = await import('../../src/encode/bmp.js');
    expect(meta.key).toBe('bmp');
    expect(meta.supportsCompression).toBe(false);
    expect(meta.compressionType).toBe('none');
    expect(meta.requiresAlphaCompositing).toBe(true);
  });

  it('ppm meta has no compression', async () => {
    const { meta } = await import('../../src/encode/ppm.js');
    expect(meta.key).toBe('ppm');
    expect(meta.supportsCompression).toBe(false);
    expect(meta.compressionType).toBe('none');
  });
});

// ─── Phase 2 encoder meta (all formats now implemented) ──────

describe('Phase 2 encoder meta', () => {
  it('tiff meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/tiff.js');
    expect(meta.key).toBe('tiff');
    expect(meta.aliases).toEqual(['tif']);
    expect(meta.mime).toBe('image/tiff');
    expect(meta.ext).toBe('tiff');
    expect(meta.supportsCompression).toBe(false);
    expect(meta.compressionType).toBe('none');
    expect(meta.supportsTransparency).toBe(false);
    expect(meta.requiresAlphaCompositing).toBe(true);
  });

  it('psd meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/psd.js');
    expect(meta.key).toBe('psd');
    expect(meta.mime).toBe('application/psd');
    expect(meta.ext).toBe('psd');
    expect(meta.supportsCompression).toBe(false);
    expect(meta.compressionType).toBe('none');
  });

  it('tga meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/tga.js');
    expect(meta.key).toBe('tga');
    expect(meta.mime).toBe('image/x-tga');
    expect(meta.ext).toBe('tga');
    expect(meta.supportsCompression).toBe(false);
    expect(meta.supportsTransparency).toBe(true);
  });

  it('ico meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/ico.js');
    expect(meta.key).toBe('ico');
    expect(meta.mime).toBe('image/x-icon');
    expect(meta.ext).toBe('ico');
    expect(meta.supportsCompression).toBe(false);
    expect(meta.supportsTransparency).toBe(true);
  });

  it('avif meta has correct fields', async () => {
    const { meta } = await import('../../src/encode/avif.js');
    expect(meta.key).toBe('avif');
    expect(meta.mime).toBe('image/avif');
    expect(meta.ext).toBe('avif');
    expect(meta.supportsCompression).toBe(true);
    expect(meta.compressionType).toBe('lossy');
    expect(meta.defaultQuality).toBe(50);
    expect(meta.supportsTransparency).toBe(true);
  });

  it('all format encoders export encode function', async () => {
    const formats = ['gif', 'bmp', 'tiff', 'psd', 'tga', 'ico', 'avif'];
    for (const fmt of formats) {
      const { getEncoder } = await import('../../src/encode/router.js');
      const mod = await getEncoder(fmt);
      expect(typeof mod.encode).toBe('function');
      expect(mod.meta).toBeDefined();
      expect(mod.meta.key).toBeDefined();
    }
  });
});
