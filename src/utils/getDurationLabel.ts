import type { Test } from '../types/database';

export const getDurationLabel = (test: Test) => {
  if (test.timer_type === null) {
    return 'without timer';
  }

  return test.timer_type === 'test' ? 'per test' : 'per question';
};
