import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '../common/SearchInput/SearchInput';
import { ResultsList } from './components/ResultsList/ResultsList';
import styles from './Results.module.scss';
import type { Results } from '../../../../../types/database';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAllStudentsResults } from '../../../../../services/results';
import type { SortType } from '../Tests/types/admin';

export const ResultsOverview = () => {
  const [query, setQuery] = useState('');
  const [allStudentResults, setAllStudentResults] = useState<Results[]>([]);
  const [sortBy, setSortBy] = useState<SortType>('default');

  const { resultId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadAllStudentsResults();

        setAllStudentResults(data);
      } catch (error) {
        console.error('Failed to load all student results', error);
      }
    };

    loadData();
  }, [resultId]);

  const handleCheckDetails = (id: number) => {
    navigate(`/admin/results/result-details/${id}`);
  };

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = allStudentResults.filter((student) => {
      const name = student.profiles?.display_name ?? '';
      const test = student.tests.title ?? '';

      return (
        name.toLowerCase().includes(query.toLowerCase()) ||
        test.toLowerCase().includes(query.toLowerCase())
      );
    });

    if (sortBy === 'default') {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'test') {
        const testA = a.tests.title ?? '';
        const testB = b.tests.title ?? '';

        return testA.localeCompare(testB);
      }

      if (sortBy === 'student') {
        const studentA = a.profiles?.display_name ?? '';
        const studentB = b.profiles?.display_name ?? '';

        return studentA.localeCompare(studentB);
      }

      if (sortBy === 'date') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;

        return timeB - timeA;
      }

      return 0;
    });
  }, [allStudentResults, query, sortBy]);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / RESULTS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Search for students or tests...'
            value={query}
            onChange={setQuery}
          />

          <div className={styles.searchSection}>
            <button
              className={`${styles.searchInfo} ${sortBy === 'test' ? styles.activeSort : ''}`}
              onClick={() => setSortBy('test')}
            >
              Sort by test
            </button>
            <button
              className={`${styles.searchInfo} ${sortBy === 'student' ? styles.activeSort : ''}`}
              onClick={() => setSortBy('student')}
            >
              Sort by student
            </button>
            <button
              className={`${styles.searchInfo} ${sortBy === 'date' ? styles.activeSort : ''}`}
              onClick={() => setSortBy('date')}
            >
              Sort by date
            </button>
          </div>
        </div>
      </div>

      <div>
        <ResultsList
          allStudentResults={filteredAndSortedStudents}
          checkDetails={handleCheckDetails}
        />
      </div>
    </div>
  );
};
