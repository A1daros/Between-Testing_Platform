import { formatDate } from '../../../../../utils/formatDate';
import { isResultOutdated } from '../../../../../utils/isResultOutdated';
import type { ColumnConfig } from '../../../types/table';
import type { Result } from '../../../../../types/database';
import { OutdatedBadge } from '../../../../shared/components/OutdatedBadge';
import { AfterKeyBadge } from '../../../components/AfterKeyBadge';

export const getResultsColumns = (): ColumnConfig<Result>[] => [
  {
    label: 'Учень',
    render: (result) => result.profiles?.display_name ?? '—',
  },
  {
    label: 'Тест',
    render: (result) => (
      <>
        {result.tests.title}
        {isResultOutdated(result.created_at, result.tests.content_updated_at) && (
          <OutdatedBadge inline />
        )}
        {result.after_key && <AfterKeyBadge inline />}
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
