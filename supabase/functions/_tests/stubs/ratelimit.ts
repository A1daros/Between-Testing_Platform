import { vi } from 'vitest';

export const limit = vi.fn();

export class Ratelimit {
  static slidingWindow = () => ({});

  limit = limit;
}
