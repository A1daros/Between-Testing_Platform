import type { Test } from '../types/database';

const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} с`;
  }

  return seconds === 0 ? `${minutes} хв` : `${minutes} хв ${seconds} с`;
};

export const getDurationLabel = (test: Test): string => {
  if (test.timer_type === null || !test.timer_duration) {
    return 'Без таймера';
  }

  const scope = test.timer_type === 'test' ? 'на весь тест' : 'на кожне питання';

  return `${formatDuration(test.timer_duration)} ${scope}`;
};
