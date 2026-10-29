import type { ColumnConfig } from '../../../../../types/table';
import type { Results } from '../../../../../../../types/database';

export const getResultsColumns = (): ColumnConfig<Results>[] => [
  {
    label: 'Учень',
    render: (result) => result.profiles?.display_name ?? '',
  },
  {
    label: 'Тест',
    render: (result) => result.tests.title,
  },
  {
    label: 'Бал',
    render: (result) => `${result.score} / ${result.total}`,
  },
  {
    label: 'Дата',
    render: (result) => new Date(result.created_at).toLocaleDateString(),
  },
];
