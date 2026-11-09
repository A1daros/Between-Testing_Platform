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
import { Modal } from '../../../../shared/components/Modal';
import { Table } from '../../../components/Table';
import type { ColumnConfig } from '../../../types/table';
import type { StudentAttempts as StudentAttemptsRow } from '../../../../../types/database';
import { captureError } from '../../../../../utils/captureError';

type StudentAttemptsProps = {
  studentId: string;
};

type AttemptsTableRow = StudentAttemptsRow & { id: number };

export const StudentAttempts = ({ studentId }: StudentAttemptsProps) => {
  const [grantingTestId, setGrantingTestId] = useState<number | null>(null);
  const [grantError, setGrantError] = useState('');
  const [confirmRow, setConfirmRow] = useState<StudentAttemptsRow | null>(null);

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
      setConfirmRow(null);
      reload();
    } catch (grantAttemptError) {
      captureError(grantAttemptError);
      setGrantError('Не вдалося додати спробу. Спробуйте ще раз.');
    } finally {
      setGrantingTestId(null);
    }
  };

  const handleGrantClick = (row: StudentAttemptsRow) => {
    setGrantError('');

    if (row.key_open) {
      setConfirmRow(row);
      return;
    }

    handleGrant(row.test_id);
  };

  const handleCloseConfirm = () => {
    if (grantingTestId === null) {
      setConfirmRow(null);
      setGrantError('');
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
          onClick={() => handleGrantClick(row)}
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

      {grantError && !confirmRow && <Alert>{grantError}</Alert>}

      <Table
        columns={columns}
        rows={data.map((row) => ({ ...row, id: row.test_id }))}
      />

      {confirmRow && (
        <Modal labelledBy='grant-attempt-title' onClose={handleCloseConfirm}>
          <div className={styles.confirmBox}>
            <h3 id='grant-attempt-title' className={styles.title}>
              Додати спробу: {confirmRow.title}?
            </h3>

            <p className={styles.description}>
              Учень уже мав доступ до правильних відповідей цього тесту. Результат
              нової спроби буде позначено «Після ключа».
            </p>

            {grantError && <Alert>{grantError}</Alert>}

            <div className={styles.buttons}>
              <button
                type='button'
                className={styles.confirmButton}
                disabled={grantingTestId !== null}
                onClick={() => handleGrant(confirmRow.test_id)}
              >
                {grantingTestId !== null ? 'Додаємо...' : 'Так, додати'}
              </button>

              <button
                type='button'
                className={styles.button}
                disabled={grantingTestId !== null}
                onClick={handleCloseConfirm}
              >
                Скасувати
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
