import styles from './StudentAttempts.module.scss';
import { useCallback, useState } from 'react';
import {
  getStudentAttempts,
  grantExtraAttempt,
} from '../../../../../services/quizAttempts';
import { useAsyncData } from '../../../../../hooks/useAsyncData';
import { Alert } from '../../../../shared/components/Alert';
import { ErrorState } from '../../../../shared/components/ErrorState';
import { Loader } from '../../../../shared/components/Loader';
import { Table } from '../../../components/Table';
import type { ColumnConfig } from '../../../types/table';
import type { StudentAttempts as StudentAttemptsRow } from '../../../../../types/database';

type StudentAttemptsProps = {
  studentId: string;
};

type AttemptsTableRow = StudentAttemptsRow & { id: number };

export const StudentAttempts = ({ studentId }: StudentAttemptsProps) => {
  const [grantingTestId, setGrantingTestId] = useState<number | null>(null);
  const [grantError, setGrantError] = useState('');

  const loadAttempts = useCallback(
    () => getStudentAttempts(studentId),
    [studentId],
  );

  const { data, loading, error, reload } = useAsyncData(loadAttempts);

  const handleGrant = async (testId: number) => {
    setGrantingTestId(testId);
    setGrantError('');

    try {
      await grantExtraAttempt(studentId, testId);
      reload();
    } catch (grantAttemptError) {
      console.error('Failed to grant extra attempt:', grantAttemptError);
      setGrantError('Не вдалося додати спробу. Спробуйте ще раз.');
    } finally {
      setGrantingTestId(null);
    }
  };

  if (loading && !data) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState message='Не вдалося завантажити спроби.' onAction={reload} />
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const columns: ColumnConfig<AttemptsTableRow>[] = [
    { label: 'Тест', key: 'title' },
    {
      label: 'Спроби',
      render: (row) =>
        row.attempts_allowed === null
          ? `${row.attempts_used}`
          : `${row.attempts_used} з ${row.attempts_allowed}`,
    },
    {
      label: 'Дія',
      render: (row) => (
        <button
          type='button'
          className={styles.button}
          disabled={grantingTestId !== null}
          onClick={() => handleGrant(row.test_id)}
        >
          {grantingTestId === row.test_id ? 'Додаємо...' : 'Додати спробу'}
        </button>
      ),
    },
  ];

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Спроби за тестами</h3>

      <p className={styles.note}>
        Нова спроба знову закриває правильні відповіді, доки учень її не
        використає. Те, що учень уже бачив у розборі, це не приховає.
      </p>

      {grantError && <Alert>{grantError}</Alert>}

      <Table
        columns={columns}
        rows={data.map((row) => ({ ...row, id: row.test_id }))}
      />
    </section>
  );
};
