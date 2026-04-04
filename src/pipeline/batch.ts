import type { BatchOptions, BatchProgress, ConvertResult } from '../types.js';

import { convert } from './convert.js';

/**
 * Convert multiple HEIC/HEIF files in parallel with concurrency control.
 *
 * @example
 * ```typescript
 * import { convertBatch } from 'heiccon';
 *
 * const results = await convertBatch(heicFiles, {
 *   format: 'jpg',
 *   quality: 85,
 *   concurrency: 4,
 *   onProgress: ({ completed, total }) => console.log(`${completed}/${total}`),
 * });
 * ```
 */
export async function convertBatch(
  files: Blob[],
  options: BatchOptions,
): Promise<ConvertResult[]> {
  const { concurrency = 4, onProgress, ...convertOpts } = options;
  const total = files.length;
  const results: ConvertResult[] = new Array(total);
  let completed = 0;

  // Process files with concurrency limit
  const queue = files.map((file, index) => ({ file, index }));
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(concurrency, total); i++) {
    workers.push(processQueue());
  }

  async function processQueue(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const result = await convert(item.file, convertOpts);
      results[item.index] = result;
      completed++;

      if (onProgress) {
        const progress: BatchProgress = {
          completed,
          total,
          current: result,
        };
        onProgress(progress);
      }
    }
  }

  await Promise.all(workers);
  return results;
}
