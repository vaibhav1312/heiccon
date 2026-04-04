import { describe, it, expect } from 'vitest';

import { normalizeQuality, getCompressionMeta } from '../../src/compression/normalize.js';

describe('normalizeQuality', () => {
  // ─── JPG / JPEG / JFIF (0-100 → 0.0-1.0) ─────────────────

  it('normalizes jpg quality 92 → 0.92', () => {
    expect(normalizeQuality('jpg', 92)).toBe(0.92);
  });

  it('normalizes jpeg quality 0 → 0.0', () => {
    expect(normalizeQuality('jpeg', 0)).toBe(0);
  });

  it('normalizes jfif quality 100 → 1.0', () => {
    expect(normalizeQuality('jfif', 100)).toBe(1);
  });

  it('normalizes jpg quality 50 → 0.5', () => {
    expect(normalizeQuality('jpg', 50)).toBe(0.5);
  });

  // ─── WebP (0-100 → 0.0-1.0) ───────────────────────────────

  it('normalizes webp quality 80 → 0.8', () => {
    expect(normalizeQuality('webp', 80)).toBe(0.8);
  });

  // ─── AVIF (0-100 → 0.0-1.0) ───────────────────────────────

  it('normalizes avif quality 50 → 0.5', () => {
    expect(normalizeQuality('avif', 50)).toBe(0.5);
  });

  // ─── PNG (0-100 → OxiPNG level 1-6) ───────────────────────

  it('normalizes png quality 100 → level 1 (minimal effort)', () => {
    expect(normalizeQuality('png', 100)).toBe(1);
  });

  it('normalizes png quality 80 → level 2', () => {
    expect(normalizeQuality('png', 80)).toBe(2);
  });

  it('normalizes png quality 0 → level 6 (max effort)', () => {
    expect(normalizeQuality('png', 0)).toBe(6);
  });

  // ─── GIF (0-100 → maxColors 2-256) ────────────────────────

  it('normalizes gif quality 100 → 256 colors', () => {
    expect(normalizeQuality('gif', 100)).toBe(256);
  });

  it('normalizes gif quality 0 → 2 colors', () => {
    expect(normalizeQuality('gif', 0)).toBe(2);
  });

  it('normalizes gif quality 50 → ~129 colors', () => {
    const result = normalizeQuality('gif', 50);
    expect(result).toBeGreaterThanOrEqual(128);
    expect(result).toBeLessThanOrEqual(130);
  });

  // ─── Uncompressed formats ─────────────────────────────────

  it('returns undefined for bmp', () => {
    expect(normalizeQuality('bmp', 90)).toBeUndefined();
  });

  it('returns undefined for tiff', () => {
    expect(normalizeQuality('tiff', 90)).toBeUndefined();
  });

  it('returns undefined for psd', () => {
    expect(normalizeQuality('psd', 90)).toBeUndefined();
  });

  it('returns undefined for ppm', () => {
    expect(normalizeQuality('ppm', 90)).toBeUndefined();
  });

  // ─── Edge cases ────────────────────────────────────────────

  it('returns undefined for null quality', () => {
    expect(normalizeQuality('jpg', null)).toBeUndefined();
  });

  it('returns undefined for undefined quality', () => {
    expect(normalizeQuality('jpg', undefined)).toBeUndefined();
  });

  it('clamps quality above 100 to 100', () => {
    expect(normalizeQuality('jpg', 150)).toBe(1);
  });

  it('clamps quality below 0 to 0', () => {
    expect(normalizeQuality('jpg', -10)).toBe(0);
  });
});

describe('getCompressionMeta', () => {
  it('returns quality info for jpg', () => {
    const meta = getCompressionMeta('jpg');
    expect(meta.hasQuality).toBe(true);
    expect(meta.qualityLabel).toBeTruthy();
  });

  it('returns quality info for png', () => {
    const meta = getCompressionMeta('png');
    expect(meta.hasQuality).toBe(true);
    expect(meta.qualityLabel).toBe('Optimization effort');
  });

  it('returns quality info for gif', () => {
    const meta = getCompressionMeta('gif');
    expect(meta.hasQuality).toBe(true);
    expect(meta.qualityLabel).toBe('Palette size');
  });

  it('returns no quality for bmp', () => {
    const meta = getCompressionMeta('bmp');
    expect(meta.hasQuality).toBe(false);
  });

  it('returns no quality for unknown format', () => {
    const meta = getCompressionMeta('xyz');
    expect(meta.hasQuality).toBe(false);
  });
});
