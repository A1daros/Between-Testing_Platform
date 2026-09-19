import type { NavigateFunction } from 'react-router-dom';
import type { ColumnConfig } from '../../../../../types/table';
import type { TestWithLevels } from '../../../../../../../types/database';
import styles from '../../../common/Table/Table.module.scss';

export const getTestsColumns = (
  navigate: NavigateFunction,
  onDeleteClick: (id: number) => void,
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
    label: 'Action / Edit',
    render: (test) => (
      <button
        className={styles.actionButton}
        onClick={(event) => {
          event.stopPropagation();
          navigate(`/admin/tests/${test.id}/edit`);
        }}
      >
        Edit
      </button>
    ),
  },
  {
    label: 'Action / Delete',
    render: (test) => (
      <button
        className={styles.deleteButton}
        onClick={(event) => {
          event.stopPropagation();
          onDeleteClick(test.id);
        }}
      >
        Delete
      </button>
    ),
  },
];
