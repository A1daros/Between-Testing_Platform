import styles from './StudentDetails.module.scss';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStudentDetails } from '../../../../services/profile';
import { ADMIN_ROUTES } from '../../../../constants/routes';
import { getAdminPath } from '../../../../utils/getAdminPath';
import { formatDate } from '../../../../utils/formatDate';
import { useAsyncData } from '../../../../hooks/useAsyncData';
import { Table } from '../../components/Table';
import { SearchInput } from '../../components/SearchInput';
import { Loader } from '../../../shared/components/Loader';
import { ErrorState } from '../../../shared/components/ErrorState';
import { DeleteStudent } from '../components/DeleteStudent';
import { StudentAttempts } from '../components/StudentAttempts';
import { getStudentDetailsColumns } from './studentDetailsColumns';

export const StudentDetails = () => {
  const [query, setQuery] = useState('');

  const { studentId } = useParams();
  const navigate = useNavigate();

  const loadDetails = useCallback(
    () => loadStudentDetails(studentId as string),
    [studentId],
  );

  const {
    data: student,
    loading,
    error,
    reload,
  } = useAsyncData(studentId ? loadDetails : null);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        message='Не вдалося завантажити дані учня.'
        onAction={reload}
      />
    );
  }

  if (!student) {
    return (
      <ErrorState
        message='Дані учня не знайдено.'
        actionLabel='Назад'
        onAction={() => navigate(-1)}
      />
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredResults = student.results.filter((result) =>
    (result.tests?.title ?? '').toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / STUDENT DETAILS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Пошук за тестом...'
            value={query}
            onChange={setQuery}
          />

          <div className={styles.searchSection}>
            <button
              type='button'
              className={styles.searchInfo}
              onClick={() => navigate(-1)}
            >
              Назад
            </button>
          </div>
        </div>
      </div>

      <div className={styles.studentInfo}>
        <div className={styles.infoContainer}>
          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Імʼя:</h3>
            <p className={styles.infoDescription}>{student.name}</p>
          </div>

          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Прізвище:</h3>
            <p className={styles.infoDescription}>{student.surname}</p>
          </div>

          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Пошта:</h3>
            <p className={styles.infoDescription}>{student.email}</p>
          </div>

          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Дата народження:</h3>
            <p className={styles.infoDescription}>
              {student.birth_date ? formatDate(student.birth_date) : '—'}
            </p>
          </div>

          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Згода з умовами:</h3>
            <p className={styles.infoDescription}>
              {student.terms_accepted_at
                ? `${formatDate(student.terms_accepted_at)}, версія ${student.terms_version}`
                : 'Не зафіксована'}
            </p>
          </div>
        </div>

        <StudentAttempts studentId={student.id} />

        <Table
          columns={getStudentDetailsColumns()}
          rows={filteredResults}
          onRowClick={(result) =>
            navigate(
              getAdminPath(ADMIN_ROUTES.resultDetails, { resultId: result.id }),
            )
          }
          getRowLabel={(result) =>
            `Відкрити результат: ${result.tests?.title ?? 'тест'}`
          }
        />

        <DeleteStudent
          studentId={student.id}
          studentName={`${student.name} ${student.surname}`}
        />
      </div>
    </div>
  );
};
