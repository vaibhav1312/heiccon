import { describe, it, expect } from 'vitest';

import {
  HeicconError,
  DecodeError,
  EncodeError,
  TransformError,
} from '../../src/errors.js';

// ─── HeicconError (Base) ─────────────────────────────────────

describe('HeicconError', () => {
  it('is an instance of Error', () => {
    const err = new HeicconError('TEST', 'something broke');
    expect(err).toBeInstanceOf(Error);
  });

  it('stores code and message', () => {
    const err = new HeicconError('TEST_CODE', 'bad thing');
    expect(err.code).toBe('TEST_CODE');
    expect(err.message).toBe('bad thing');
  });

  it('has name HeicconError', () => {
    const err = new HeicconError('X', 'y');
    expect(err.name).toBe('HeicconError');
  });
});

// ─── DecodeError ─────────────────────────────────────────────

describe('DecodeError', () => {
  it('extends HeicconError', () => {
    const err = new DecodeError('NOT_HEIC', 'Not a HEIC file');
    expect(err).toBeInstanceOf(HeicconError);
    expect(err).toBeInstanceOf(Error);
  });

  it('has name DecodeError', () => {
    const err = new DecodeError('DECODE_FAILED', 'broken');
    expect(err.name).toBe('DecodeError');
  });

  it('stores the decode-specific error code', () => {
    const err = new DecodeError('WASM_LOAD_FAILED', 'no wasm');
    expect(err.code).toBe('WASM_LOAD_FAILED');
  });
});

// ─── EncodeError ─────────────────────────────────────────────

describe('EncodeError', () => {
  it('extends HeicconError', () => {
    const err = new EncodeError('ENCODE_FAILED', 'canvas error');
    expect(err).toBeInstanceOf(HeicconError);
    expect(err).toBeInstanceOf(Error);
  });

  it('has name EncodeError', () => {
    const err = new EncodeError('UNSUPPORTED_FORMAT', 'nope');
    expect(err.name).toBe('EncodeError');
  });

  it.each<[string, string]>([
    ['ENCODE_FAILED', 'Canvas blew up'],
    ['UNSUPPORTED_FORMAT', 'Unknown format xyz'],
    ['MISSING_DEPENDENCY', 'Install gifenc'],
  ])('code %s stores correctly', (code, msg) => {
    const err = new EncodeError(code as any, msg);
    expect(err.code).toBe(code);
    expect(err.message).toBe(msg);
  });
});

// ─── TransformError ──────────────────────────────────────────

describe('TransformError', () => {
  it('extends HeicconError', () => {
    const err = new TransformError('RESIZE_FAILED', 'resize boom');
    expect(err).toBeInstanceOf(HeicconError);
    expect(err).toBeInstanceOf(Error);
  });

  it('has name TransformError', () => {
    const err = new TransformError('CANVAS_TOO_LARGE', 'too big');
    expect(err.name).toBe('TransformError');
  });

  it('stores CANVAS_TOO_LARGE code', () => {
    const err = new TransformError('CANVAS_TOO_LARGE', 'max 16384');
    expect(err.code).toBe('CANVAS_TOO_LARGE');
    expect(err.message).toBe('max 16384');
  });
});
