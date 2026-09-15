import type { ColumnConfig } from '../../../../../types/table';
import type { Results } from '../../../../../../../types/database';

export const getResultsColumns = (): ColumnConfig<Results>[] => [
  {
    label: 'Student',
    render: (result) => result.profiles?.display_name ?? '',
  },
  {
    label: 'Test',
    render: (result) => result.tests.title,
  },
  {
    label: 'Score',
    render: (result) => `${result.score} / ${result.total}`,
  },
  {
    label: 'Date',
    render: (result) => new Date(result.created_at).toLocaleDateString(),
  },
];
