import { useEffect, useState } from 'react';
import styles from './StudentDetails.module.scss';
import type { StudentDetails } from '../../../../../../../types/database';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStudentDetails } from '../../../../../../../services/profile';
import { Table } from '../../../common/Table';
import { getStudentDetailsColumns } from './StudentDetailsColumns';
import { Loader } from '../../../../../../Loader';
import { SearchInput } from '../../../common/SearchInput/SearchInput';

export const StudentDetailsOverview = () => {
  const [studentDetails, setStudentDetails] = useState<StudentDetails[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { studentId } = useParams();
  const navigate = useNavigate();

  const handleCheckDetails = (resultId: number) => {
    navigate(`/admin/results/result-details/${resultId}`);
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

        setStudentDetails(data);
      } catch (error) {
        console.error('Failed to load student details:', error);
        setErrorMessage('Failed to load student details!');
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
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            <span className={styles.sectionLabel}>BETWEEN / STUDENT</span>

            <h1 className={styles.errorTitle}>{errorMessage}</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!studentDetails.length) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.sectionLabel}>BETWEEN / STUDENT</span>

            <h2 className={styles.emptyTitle}>No student details found</h2>

            <button
              type='button'
              className={styles.button}
              onClick={() => navigate(-1)}
            >
              Go back →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / STUDENT DETAILS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Search for students...'
            value={query}
            onChange={setQuery}
          />

          <div className={styles.searchSection}>
            <button
              type='button'
              className={styles.searchInfo}
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        </div>
      </div>

      <div>
        {studentDetails.map((student) => {
          const mappedStudent = student.results;
          const filteredResults = mappedStudent.filter((result) => {
            const name = result.tests?.title.toLowerCase() ?? '';

            return name.includes(query.toLowerCase());
          });

          return (
            <div key={student.id} className={styles.studentInfo}>
              <div className={styles.infoContainer}>
                <div className={styles.infoBlock}>
                  <h3 className={styles.infoTitle}>Name:</h3>
                  <p className={styles.infoDescription}> {student.name}</p>
                </div>

                <div className={styles.infoBlock}>
                  <h3 className={styles.infoTitle}>Surname:</h3>
                  <p className={styles.infoDescription}>{student.surname}</p>
                </div>

                <div className={styles.infoBlock}>
                  <h3 className={styles.infoTitle}>Email:</h3>
                  <p className={styles.infoDescription}>{student.email}</p>
                </div>

                <div className={styles.infoBlock}>
                  <h3 className={styles.infoTitle}>Birth date:</h3>
                  <p className={styles.infoDescription}>{student.birth_date}</p>
                </div>
              </div>

              <Table
                columns={columns}
                rows={filteredResults}
                onRowClick={(row) => handleCheckDetails(row.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
