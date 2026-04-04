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

// ─── Stub encoders throw MISSING_DEPENDENCY ──────────────────

describe('Phase 2 stub encoders', () => {
  it('gif encode() throws MISSING_DEPENDENCY', async () => {
    const mod = await import('../../src/encode/gif.js');
    await expect(mod.encode(null as any)).rejects.toThrow(EncodeError);
    await expect(mod.encode(null as any)).rejects.toMatchObject({ code: 'MISSING_DEPENDENCY' });
  });

  it('bmp encode() throws MISSING_DEPENDENCY', async () => {
    const mod = await import('../../src/encode/bmp.js');
    await expect(mod.encode(null as any)).rejects.toThrow(EncodeError);
    await expect(mod.encode(null as any)).rejects.toMatchObject({ code: 'MISSING_DEPENDENCY' });
  });

  it('tiff encode() throws MISSING_DEPENDENCY', async () => {
    const mod = await import('../../src/encode/tiff.js');
    await expect(mod.encode(null as any)).rejects.toThrow(EncodeError);
    await expect(mod.encode(null as any)).rejects.toMatchObject({ code: 'MISSING_DEPENDENCY' });
  });

  it('psd encode() throws MISSING_DEPENDENCY', async () => {
    const mod = await import('../../src/encode/psd.js');
    await expect(mod.encode(null as any)).rejects.toThrow(EncodeError);
    await expect(mod.encode(null as any)).rejects.toMatchObject({ code: 'MISSING_DEPENDENCY' });
  });

  it('tga encode() throws MISSING_DEPENDENCY', async () => {
    const mod = await import('../../src/encode/tga.js');
    await expect(mod.encode(null as any)).rejects.toThrow(EncodeError);
    await expect(mod.encode(null as any)).rejects.toMatchObject({ code: 'MISSING_DEPENDENCY' });
  });

  it('ico encode() throws MISSING_DEPENDENCY', async () => {
    const mod = await import('../../src/encode/ico.js');
    await expect(mod.encode(null as any)).rejects.toThrow(EncodeError);
    await expect(mod.encode(null as any)).rejects.toMatchObject({ code: 'MISSING_DEPENDENCY' });
  });
});
