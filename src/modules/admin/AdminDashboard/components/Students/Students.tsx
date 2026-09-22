import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '../common/SearchInput/SearchInput';
import type { StudentProfile } from '../../../../../types/database';
import { loadStudents } from '../../../../../services/profile';
import { StudentList } from './components/StudentsList/StudentsList';
import { useNavigate } from 'react-router-dom';
import styles from './Students.module.scss';
import type { SortOrder } from '../Tests/types/admin';
import { Loader } from '../../../../Loader';

export const Students = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [query, setQuery] = useState('');

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleCheckDetails = (id: string) => {
    navigate(`/admin/students/student-details/${id}`);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const data = await loadStudents();

        setStudents(data);
      } catch (error) {
        console.error('Failed to load students', error);
        setErrorMessage('Failed to load students!');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredSudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const name = student.display_name ?? '';

      return name.toLowerCase().includes(query.toLowerCase());
    });

    if (sortOrder === 'newest') {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const studentA = a.display_name ?? '';
      const studentB = b.display_name ?? '';

      return sortOrder === 'asc'
        ? studentA.localeCompare(studentB)
        : studentB.localeCompare(studentA);
    });
  }, [students, query, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.container}>
        <h2 className={styles.errorTitle}>Ooops, {errorMessage}</h2>
        <p className={styles.errorDescription}>Try again later!</p>
        <button className={styles.errorButton} onClick={() => {}}>
          Reload!
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / STUDENTS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Search for students...'
            value={query}
            onChange={setQuery}
          />

          <div className={styles.searchSection}>
            <button className={styles.searchInfo} onClick={toggleSortOrder}>
              Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <StudentList
          students={filteredSudents}
          checkDetails={handleCheckDetails}
        />
      </div>
    </div>
  );
};
