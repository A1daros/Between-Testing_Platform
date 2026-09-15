import type { NavigateFunction } from 'react-router-dom';
import type { ColumnConfig } from '../../../../../types/table';
import type { TestWithLevels } from '../../../../../../../types/database';

export const getTestsColumns = (
  navigate: NavigateFunction,
): ColumnConfig<TestWithLevels>[] => [
  {
    label: 'Name',
    key: 'title',
  },
  {
    label: 'Level',
    render: (test) => test.levels?.code ?? '---',
  },
  {
    label: 'Q-s',
    render: (test) =>
      Array.isArray(test.questions) ? (test.questions[0]?.count ?? 0) : 0,
  },
  {
    label: 'Action',
    render: (test) => (
      <button
        onClick={(event) => {
          event.stopPropagation();
          navigate(`/admin/tests/${test.id}/edit`);
        }}
      >
        Edit / Delete
      </button>
    ),
  },
];
