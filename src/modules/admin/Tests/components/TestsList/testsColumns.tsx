import type { NavigateFunction } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../../../../constants/routes';
import { getAdminPath } from '../../../../../utils/getAdminPath';
import type { Test } from '../../../../../types/database';
import type { ColumnConfig } from '../../../types/table';
import styles from '../../../components/Table/Table.module.scss';

export const getTestsColumns = (
  navigate: NavigateFunction,
  onDeleteClick: (testId: number) => void,
): ColumnConfig<Test>[] => [
  {
    label: 'Назва',
    key: 'title',
  },
  {
    label: 'Рівень',
    render: (test) => test.levels?.code ?? '—',
  },
  {
    label: 'Питань',
    render: (test) => test.question_count,
  },
  {
    label: 'Редагувати',
    render: (test) => (
      <button
        type='button'
        className={styles.actionButton}
        onClick={() =>
          navigate(getAdminPath(ADMIN_ROUTES.testEdit, { testId: test.id }))
        }
      >
        Редагувати
      </button>
    ),
  },
  {
    label: 'Видалити',
    render: (test) => (
      <button
        type='button'
        className={styles.deleteButton}
        onClick={() => onDeleteClick(test.id)}
      >
        Видалити
      </button>
    ),
  },
];
