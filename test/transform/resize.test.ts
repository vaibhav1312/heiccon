import { describe, it, expect } from 'vitest';

import { computeDimensions } from '../../src/transform/resize.js';

// ─── No resize (passthrough) ─────────────────────────────────

describe('computeDimensions — no resize', () => {
  it('returns original dimensions when no width/height given', () => {
    const d = computeDimensions(4000, 3000, {});
    expect(d.dw).toBe(4000);
    expect(d.dh).toBe(3000);
    expect(d.sx).toBe(0);
    expect(d.sy).toBe(0);
  });
});

// ─── Fill ────────────────────────────────────────────────────

describe('computeDimensions — fill', () => {
  it('stretches to exact target dimensions', () => {
    const d = computeDimensions(4000, 3000, { width: 800, height: 600, fit: 'fill' });
    expect(d.dw).toBe(800);
    expect(d.dh).toBe(600);
    expect(d.sw).toBe(4000);
    expect(d.sh).toBe(3000);
  });

  it('uses source dimension when only one target is given', () => {
    const d = computeDimensions(4000, 3000, { width: 800, fit: 'fill' });
    expect(d.dw).toBe(800);
    expect(d.dh).toBe(3000);
  });
});

// ─── Cover ───────────────────────────────────────────────────

describe('computeDimensions — cover', () => {
  it('crops to fill a square from landscape source', () => {
    const d = computeDimensions(4000, 3000, { width: 500, height: 500, fit: 'cover' });
    expect(d.dw).toBe(500);
    expect(d.dh).toBe(500);
    // Should crop from center — source crop should be square from the shorter side
    expect(d.sw).toBe(3000);
    expect(d.sh).toBe(3000);
    expect(d.sx).toBe(500); // (4000 - 3000) / 2
    expect(d.sy).toBe(0);
  });

  it('fills target without distortion', () => {
    const d = computeDimensions(1920, 1080, { width: 400, height: 300, fit: 'cover' });
    expect(d.dw).toBe(400);
    expect(d.dh).toBe(300);
    // Cover scale = max(400/1920, 300/1080) = max(0.2083, 0.2778) = 0.2778
    // cropW = 400/0.2778 ≈ 1440, cropH = 300/0.2778 ≈ 1080
    expect(d.sw).toBeCloseTo(1440, 0);
    expect(d.sh).toBeCloseTo(1080, 0);
  });
});

// ─── Inside (scale down only) ────────────────────────────────

describe('computeDimensions — inside', () => {
  it('scales down when source is larger', () => {
    const d = computeDimensions(4000, 3000, { width: 800, height: 600, fit: 'inside' });
    expect(d.dw).toBe(800);
    expect(d.dh).toBe(600);
  });

  it('never upscales', () => {
    const d = computeDimensions(400, 300, { width: 800, height: 600, fit: 'inside' });
    // Source is smaller than target — should stay same size
    expect(d.dw).toBe(400);
    expect(d.dh).toBe(300);
  });

  it('scales down to fit width', () => {
    const d = computeDimensions(2000, 1000, { width: 400, fit: 'inside' });
    expect(d.dw).toBe(400);
    expect(d.dh).toBe(200); // Maintains 2:1 aspect ratio
  });
});

// ─── Outside ─────────────────────────────────────────────────

describe('computeDimensions — outside', () => {
  it('scales so both dimensions are at least the target', () => {
    const d = computeDimensions(1000, 500, { width: 300, height: 300, fit: 'outside' });
    // scale = max(300/1000, 300/500) = max(0.3, 0.6) = 0.6
    // dw = 1000 * 0.6 = 600, dh = 500 * 0.6 = 300
    expect(d.dw).toBe(600);
    expect(d.dh).toBe(300);
  });
});

// ─── Contain (default) ───────────────────────────────────────

describe('computeDimensions — contain (default)', () => {
  it('fits within target, preserving aspect ratio', () => {
    const d = computeDimensions(4000, 3000, { width: 800, height: 800 });
    // scale = min(800/4000, 800/3000, 1) = min(0.2, 0.2667, 1) = 0.2
    expect(d.dw).toBe(800);
    expect(d.dh).toBe(600);
  });

  it('never upscales when source fits within target', () => {
    const d = computeDimensions(400, 300, { width: 800, height: 800 });
    // scale = min(800/400, 800/300, 1) = min(2, 2.667, 1) = 1
    expect(d.dw).toBe(400);
    expect(d.dh).toBe(300);
  });

  it('uses contain when fit is not specified', () => {
    const d = computeDimensions(4000, 3000, { width: 800, height: 800, fit: 'contain' });
    const dDefault = computeDimensions(4000, 3000, { width: 800, height: 800 });
    expect(d.dw).toBe(dDefault.dw);
    expect(d.dh).toBe(dDefault.dh);
  });

  it('fits to width-only constraint', () => {
    const d = computeDimensions(2000, 1000, { width: 400 });
    // scale = min(400/2000, Inf/1000, 1) = min(0.2, Inf, 1) = 0.2
    expect(d.dw).toBe(400);
    expect(d.dh).toBe(200);
  });

  it('fits to height-only constraint', () => {
    const d = computeDimensions(2000, 1000, { height: 300 });
    // scale = min(Inf/2000, 300/1000, 1) = min(Inf, 0.3, 1) = 0.3
    expect(d.dw).toBe(600);
    expect(d.dh).toBe(300);
  });
});
