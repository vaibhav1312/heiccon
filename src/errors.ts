// ─── Base Error ──────────────────────────────────────────────

export class HeicconError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'HeicconError';
    this.code = code;
  }
}

// ─── Decode Errors ───────────────────────────────────────────

export type DecodeErrorCode = 'NOT_HEIC' | 'DECODE_FAILED' | 'WASM_LOAD_FAILED';

export class DecodeError extends HeicconError {
  override readonly code: DecodeErrorCode;

  constructor(code: DecodeErrorCode, message: string) {
    super(code, message);
    this.name = 'DecodeError';
    this.code = code;
  }
}

// ─── Encode Errors ───────────────────────────────────────────

export type EncodeErrorCode = 'ENCODE_FAILED' | 'UNSUPPORTED_FORMAT' | 'MISSING_DEPENDENCY';

export class EncodeError extends HeicconError {
  override readonly code: EncodeErrorCode;

  constructor(code: EncodeErrorCode, message: string) {
    super(code, message);
    this.name = 'EncodeError';
    this.code = code;
  }
}

// ─── Transform Errors ────────────────────────────────────────

export type TransformErrorCode = 'RESIZE_FAILED' | 'CANVAS_TOO_LARGE';

export class TransformError extends HeicconError {
  override readonly code: TransformErrorCode;

  constructor(code: TransformErrorCode, message: string) {
    super(code, message);
    this.name = 'TransformError';
    this.code = code;
  }
}
