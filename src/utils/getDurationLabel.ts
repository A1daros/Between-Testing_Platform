import type { Test } from '../types/database';

export const getDurationLabel = (test: Test) => {
  if (test.timer_type === null) {
    return 'Без таймера';
  }

  return test.timer_type === 'test' ? 'на весь тест' : 'на кожне питання';
};
