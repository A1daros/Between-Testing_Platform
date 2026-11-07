export const TEST_TYPE_LABELS: Record<string, string> = {
  placement_test: 'Тест на рівень',
  submodule_quiz: 'Квіз',
  final_test: 'Фінальний тест',
};

export const getTestTypeLabel = (testType: string | undefined): string =>
  (testType && TEST_TYPE_LABELS[testType]) ?? 'Тест';
