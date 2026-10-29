import type { NavigateFunction } from 'react-router-dom';
import type { ColumnConfig } from '../../../../../types/table';
import type { TestWithLevels } from '../../../../../../../types/database';
import styles from '../../../common/Table/Table.module.scss';

export const getTestsColumns = (
  navigate: NavigateFunction,
  onDeleteClick: (id: number) => void,
): ColumnConfig<TestWithLevels>[] => [
  {
    label: 'Назва',
    key: 'title',
  },
  {
    label: 'Рівень',
    render: (test) => test.levels?.code ?? '---',
  },
  {
    label: 'Питань',
    render: (test) =>
      Array.isArray(test.questions) ? (test.questions[0]?.count ?? 0) : 0,
  },
  {
    label: 'Редагувати',
    render: (test) => (
      <button
        className={styles.actionButton}
        onClick={(event) => {
          event.stopPropagation();
          navigate(`/admin/tests/${test.id}/edit`);
        }}
      >
        Редагувати
      </button>
    ),
  },
  {
    label: 'Видалити',
    render: (test) => (
      <button
        className={styles.deleteButton}
        onClick={(event) => {
          event.stopPropagation();
          onDeleteClick(test.id);
        }}
      >
        Видалити
      </button>
    ),
  },
];
