import type { TestType } from '../types/database';

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  placement_test: 'Тест на рівень',
  submodule_quiz: 'Квіз',
  final_test: 'Фінальний тест',
};

export const getTestTypeLabel = (testType: TestType | undefined): string =>
  (testType && TEST_TYPE_LABELS[testType]) || 'Тест';
