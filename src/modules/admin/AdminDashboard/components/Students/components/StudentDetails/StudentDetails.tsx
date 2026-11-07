import { getAdminPath } from '../../../../../../../utils/getAdminPath';
import { ADMIN_ROUTES } from '../../../../../../../constants/routes';
import { useEffect, useState } from 'react';
import styles from './StudentDetails.module.scss';
import type { StudentWithResults } from '../../../../../../../types/database';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStudentDetails } from '../../../../../../../services/profile';
import { Table } from '../../../common/Table';
import { getStudentDetailsColumns } from './studentDetailsColumns';
import { Loader } from '../../../../../../shared/components/Loader';
import { SearchInput } from '../../../common/SearchInput/SearchInput';
import { formatDate } from '../../../../../../../utils/formatDate';

export const StudentDetails = () => {
  const [student, setStudent] = useState<StudentWithResults | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { studentId } = useParams();
  const navigate = useNavigate();

  const handleCheckDetails = (resultId: number) => {
    navigate(getAdminPath(ADMIN_ROUTES.resultDetails, { resultId }));
  };

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const loadStudentDetailsData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await loadStudentDetails(studentId);

        setStudent(data);
      } catch (error) {
        console.error('Failed to load student details:', error);
        setErrorMessage('Не вдалося завантажити дані учня.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentDetailsData();
  }, [studentId]);

  const columns = getStudentDetailsColumns(navigate);

  if (isLoading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            <span className={styles.sectionLabel}>BETWEEN / STUDENT</span>

            <h1 className={styles.errorTitle}>{errorMessage}</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.sectionLabel}>BETWEEN / STUDENT</span>

            <h2 className={styles.emptyTitle}>Дані учня не знайдено</h2>

            <button
              type='button'
              className={styles.button}
              onClick={() => navigate(-1)}
            >
              Назад →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredResults = student.results.filter((result) =>
    (result.tests?.title ?? '').toLowerCase().includes(query.toLowerCase()),
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
        </div>

        <Table
          columns={columns}
          rows={filteredResults}
          onRowClick={(row) => handleCheckDetails(row.id)}
        />
      </div>
    </div>
  );
};
