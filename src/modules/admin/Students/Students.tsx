import styles from './Students.module.scss';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { StudentsList } from './components/StudentsList';
import type { ProfileStatus } from '../../../types/database';
import type { SortOrder } from '../types/sort';
import { loadStudents, setProfileStatus } from '../../../services/profile';
import { ADMIN_ROUTES } from '../../../constants/routes';
import { getAdminPath } from '../../../utils/getAdminPath';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';
import { Alert } from '../../shared/components/Alert';

type StatusFilter = 'all' | ProfileStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'pending', label: 'Очікують' },
  { value: 'approved', label: 'Схвалені' },
  { value: 'rejected', label: 'Відхилені' },
];

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Сортування: нові спочатку',
  asc: 'Сортування: А-Я',
  desc: 'Сортування: Я-А',
};

const NEXT_SORT_ORDER: Record<SortOrder, SortOrder> = {
  newest: 'asc',
  asc: 'desc',
  desc: 'newest',
};

export const Students = () => {
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');

  const navigate = useNavigate();

  const {
    data: students,
    loading,
    error,
    reload,
    setData: setStudents,
  } = useAsyncData(loadStudents);

  const handleCheckDetails = (studentId: string) => {
    navigate(getAdminPath(ADMIN_ROUTES.studentDetails, { studentId }));
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
        prev?.map((student) =>
          student.id === studentId
            ? { ...student, status: updatedStatus }
            : student,
        ),
      );
    } catch (changeError) {
      console.error('Failed to change student status:', changeError);
      setStatusError('Не вдалося змінити статус. Спробуйте ще раз.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = (students ?? []).filter((student) => {
      const matchesStatus =
        statusFilter === 'all' || student.status === statusFilter;
      const matchesQuery = (student.display_name ?? '')
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });

    if (sortOrder === 'newest') {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const comparison = (a.display_name ?? '').localeCompare(
        b.display_name ?? '',
        'uk',
      );

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [students, query, sortOrder, statusFilter]);

  if (loading) {
    return <Loader />;
  }

  if (error || !students) {
    return (
      <ErrorState message='Не вдалося завантажити учнів.' onAction={reload} />
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
            <button
              type='button'
              className={styles.searchInfo}
              onClick={() => setSortOrder((prev) => NEXT_SORT_ORDER[prev])}
            >
              {SORT_LABELS[sortOrder]}
            </button>
          </div>
        </div>

        <div
          className={styles.filters}
          role='group'
          aria-label='Фільтр за статусом'
        >
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type='button'
              className={`${styles.searchInfo} ${statusFilter === value ? styles.filterActive : ''}`}
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {statusError && <Alert>{statusError}</Alert>}

      <StudentsList
        students={filteredStudents}
        onOpenDetails={handleCheckDetails}
        onChangeStatus={handleChangeStatus}
        updatingId={updatingId}
      />
    </div>
  );
};
