import { formatDate } from '../../../../utils/formatDate';
import { isResultOutdated } from '../../../../utils/isResultOutdated';
import type { StudentResult } from '../../../../types/database';
import type { ColumnConfig } from '../../types/table';
import { OutdatedBadge } from '../../../shared/components/OutdatedBadge';

export const getStudentDetailsColumns = (): ColumnConfig<StudentResult>[] => [
  {
    label: 'Тест',
    render: (result) => (
      <>
        {result.tests?.title ?? '—'}
        {isResultOutdated(result.created_at, result.tests?.content_updated_at) && (
          <OutdatedBadge inline />
        )}
      </>
    ),
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
