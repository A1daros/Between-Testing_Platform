import type { MouseEvent } from 'react';
import type {
  ProfileStatus,
  StudentProfile,
} from '../../../../../../../types/database';
import type { ColumnConfig } from '../../../../../types/table';
import tableStyles from '../../../common/Table/Table.module.scss';
import styles from './StudentsList.module.scss';

const STATUS_LABELS: Record<ProfileStatus, string> = {
  pending: 'Очікує',
  approved: 'Схвалено',
  rejected: 'Відхилено',
};

const STATUS_CLASSES: Record<ProfileStatus, string> = {
  pending: '',
  approved: styles.statusApproved,
  rejected: styles.statusRejected,
};

export const getStudentsColumns = (
  onChangeStatus: (studentId: string, status: ProfileStatus) => void,
  updatingId: string | null,
): ColumnConfig<StudentProfile>[] => [
  {
    label: 'Повне імʼя',
    key: 'display_name',
  },
  {
    label: 'Пошта',
    key: 'email',
  },
  {
    label: 'Пройдено тестів',
    render: (student) => student.results?.[0]?.count ?? 0,
  },
  {
    label: 'Статус',
    render: (student) => (
      <span
        className={`${styles.statusBadge} ${STATUS_CLASSES[student.status]}`}
      >
        {STATUS_LABELS[student.status]}
      </span>
    ),
  },
  {
    label: 'Дії',
    render: (student) => {
      const isUpdating = updatingId === student.id;

      const handleClick =
        (status: ProfileStatus) => (event: MouseEvent) => {
          event.stopPropagation();
          onChangeStatus(student.id, status);
        };

      return (
        <div className={styles.actions}>
          {student.status !== 'approved' && (
            <button
              type='button'
              className={tableStyles.actionButton}
              disabled={isUpdating}
              onClick={handleClick('approved')}
            >
              Схвалити
            </button>
          )}

          {student.status !== 'rejected' && (
            <button
              type='button'
              className={tableStyles.deleteButton}
              disabled={isUpdating}
              onClick={handleClick('rejected')}
            >
              {student.status === 'approved' ? 'Закрити доступ' : 'Відхилити'}
            </button>
          )}
        </div>
      );
    },
  },
];
