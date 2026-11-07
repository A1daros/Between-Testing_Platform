import { formatDate } from '../../../../../../../utils/formatDate';
import type { ColumnConfig } from '../../../../../types/table';
import type { Result } from '../../../../../../../types/database';

export const getResultsColumns = (): ColumnConfig<Result>[] => [
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
    render: (result) => formatDate(result.created_at),
  },
];
