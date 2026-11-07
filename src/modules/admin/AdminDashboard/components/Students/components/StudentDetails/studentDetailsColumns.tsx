import { formatDate } from '../../../../../../../utils/formatDate';
import { getAdminPath } from '../../../../../../../utils/getAdminPath';
import { ADMIN_ROUTES } from '../../../../../../../constants/routes';
import type { NavigateFunction } from 'react-router-dom';
import type { StudentResults } from '../../../../../../../types/database';
import type { ColumnConfig } from '../../../../../types/table';
import styles from '../../../common/Table/Table.module.scss';

export const getStudentDetailsColumns = (
  navigate: NavigateFunction,
): ColumnConfig<StudentResults>[] => [
  {
    label: 'Тест',
    render: (result) => result.tests?.title,
  },
  {
    label: 'Бал',
    render: (result) => `${result.score} / ${result.total}`,
  },
  {
    label: 'Дата',
    render: (result) => formatDate(result.created_at),
  },
  {
    label: 'Дія',
    render: (result) => (
      <button
        className={styles.actionButton}
        onClick={(event) => {
          event.stopPropagation();
          navigate(getAdminPath(ADMIN_ROUTES.resultDetails, { resultId: result.id }));
        }}
      >
        Переглянути
      </button>
    ),
  },
];
