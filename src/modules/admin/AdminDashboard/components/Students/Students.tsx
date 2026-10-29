import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '../common/SearchInput/SearchInput';
import type {
  ProfileStatus,
  StudentProfile,
} from '../../../../../types/database';
import { loadStudents, setProfileStatus } from '../../../../../services/profile';
import { StudentList } from './components/StudentsList/StudentsList';
import { useNavigate } from 'react-router-dom';
import styles from './Students.module.scss';
import type { SortOrder } from '../Tests/types/admin';
import { Loader } from '../../../../Loader';

type StatusFilter = 'all' | ProfileStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'pending', label: 'Очікують' },
  { value: 'approved', label: 'Схвалені' },
  { value: 'rejected', label: 'Відхилені' },
];

export const Students = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [query, setQuery] = useState('');

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');

  const navigate = useNavigate();

  const handleCheckDetails = (id: string) => {
    navigate(`/admin/students/student-details/${id}`);
  };

  const handleChangeStatus = async (
    studentId: string,
    status: ProfileStatus,
  ) => {
    setUpdatingId(studentId);
    setStatusError('');

    try {
      const updatedStatus = await setProfileStatus(studentId, status);

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, status: updatedStatus }
            : student,
        ),
      );
    } catch (error) {
      console.error('Failed to change student status', error);
      setStatusError('Не вдалося змінити статус. Спробуйте ще раз.');
    } finally {
      setUpdatingId(null);
    }
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
        setErrorMessage('не вдалося завантажити учнів');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredSudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const name = student.display_name ?? '';

      const matchesStatus =
        statusFilter === 'all' || student.status === statusFilter;

      return matchesStatus && name.toLowerCase().includes(query.toLowerCase());
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
  }, [students, query, sortOrder, statusFilter]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.container}>
        <h2 className={styles.errorTitle}>Помилка: {errorMessage}</h2>
        <p className={styles.errorDescription}>Спробуйте пізніше.</p>
        <button
          className={styles.errorButton}
          onClick={() => window.location.reload()}
        >
          Оновити сторінку
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
            placeholder='Пошук учня...'
            value={query}
            onChange={setQuery}
          />

          <div className={styles.searchSection}>
            <button className={styles.searchInfo} onClick={toggleSortOrder}>
              Сортування: {sortOrder === 'asc' ? 'А-Я' : 'Я-А'}
            </button>
          </div>
        </div>

        <div className={styles.filters} role='group' aria-label='Фільтр за статусом'>
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type='button'
              className={`${styles.searchInfo} ${
                statusFilter === value ? styles.filterActive : ''
              }`}
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {statusError && (
        <p className={styles.statusError} role='alert'>
          {statusError}
        </p>
      )}

      <div>
        <StudentList
          students={filteredSudents}
          checkDetails={handleCheckDetails}
          onChangeStatus={handleChangeStatus}
          updatingId={updatingId}
        />
      </div>
    </div>
  );
};
