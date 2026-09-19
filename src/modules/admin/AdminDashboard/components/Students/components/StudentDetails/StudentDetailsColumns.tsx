import type { NavigateFunction } from 'react-router-dom';
import type { StudentResults } from '../../../../../../../types/database';
import type { ColumnConfig } from '../../../../../types/table';
import styles from '../../../common/Table/Table.module.scss';

export const getStudentDetailsColumns = (
  navigate: NavigateFunction,
): ColumnConfig<StudentResults>[] => [
  {
    label: 'Test',
    render: (result) => result.tests?.title,
  },
  {
    label: 'Score',
    render: (result) => `${result.score} / ${result.total}`,
  },
  {
    label: 'Date',
    render: (result) => new Date(result.created_at).toLocaleDateString(),
  },
  {
    label: 'Action',
    render: (result) => (
      <button
        className={styles.actionButton}
        onClick={(event) => {
          event.stopPropagation();
          navigate(`/admin/results/result-details/${result.id}`);
        }}
      >
        View result
      </button>
    ),
  },
];
