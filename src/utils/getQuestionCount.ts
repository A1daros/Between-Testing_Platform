import type { Test } from '../types/database';

export const getQuestionCount = (test: Test): number =>
  test.questions[0]?.count ?? 0;
