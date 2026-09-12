import { useEffect, useState } from 'react';
import styles from './StudentDetails.module.scss';
import type { StudentDetails } from '../../../../../../../types/database';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStudentDetails } from '../../../../../../../services/profile';

export const StudentDetailsOverview = () => {
  const [studentDetails, setStudentDetails] = useState<StudentDetails[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { studentId } = useParams();
  const navigate = useNavigate();

  const handleCheckDetails = (id: number) => {
    navigate(`/admin/results/result-details/${id}`);
  };

  useEffect(() => {
    if (!studentId) return;

    const loadStudentDetailsData = async () => {
      try {
        const data = await loadStudentDetails(studentId);

        setStudentDetails(data);
      } catch (error) {
        console.error('Failed to load student details:', error);
        setErrorMessage('Failed to load student details!');
      }
    };

    loadStudentDetailsData();
  }, [studentId]);

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

            <h1 className={styles.emptyTitle}>No student details found</h1>

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
    <main>
      <div>
        <div>
          <span>BETWEEN / STUDENT DETAILS</span>
          <button
            type='button'
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ← Go back
          </button>

          <div>
            {studentDetails.map((student) => {
              const mappedStudent = student.results;

              return (
                <div key={student.id}>
                  <h2>Name: {student.name}</h2>
                  <h2>Surname: {student.surname}</h2>
                  <h2>Email: {student.email}</h2>
                  <h2>Birth date: {student.birth_date}</h2>

                  <table>
                    <thead>
                      <tr>
                        <td>Test</td>
                        <td>Score</td>
                        <td>Date</td>
                      </tr>
                    </thead>

                    <tbody>
                      {mappedStudent.map((student) => {
                        const date = new Date(student.created_at);

                        return (
                          <tr
                            key={student.id}
                            onClick={() => handleCheckDetails(student.id)}
                          >
                            <td>{student.tests?.title}</td>
                            <td>
                              {student.score} / {student.total}
                            </td>
                            <td>{date.toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
