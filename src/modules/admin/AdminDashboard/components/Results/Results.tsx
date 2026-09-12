import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '../common/SearchInput/SearchInput';
import { ResultsList } from './components/ResultsList/ResultsList';
import styles from './Results.module.scss';
import type { Results } from '../../../../../types/database';
import { loadAllStudentsResults } from '../../../../../services/profile';
import { useNavigate, useParams } from 'react-router-dom';

export const ResultsOverview = () => {
  const [query, setQuery] = useState('');
  const [allStudentResults, setAllStudentResults] = useState<Results[]>([]);

  const { resultId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadAllStudentsResults();

        setAllStudentResults(data);

        console.log(data);
      } catch (error) {
        console.error('Failed to load all student results', error);
      }
    };

    loadData();
  }, [resultId]);

  const handleCheckDetails = (id: number) => {
    navigate(`/admin/results/result-details/${id}`);
  };

  const filteredSudents = useMemo(() => {
    return allStudentResults.filter((student) => {
      const name = student.profiles?.display_name || '';
      const test = student.tests.title || '';

      return (
        name.toLowerCase().includes(query.toLowerCase()) ||
        test.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [allStudentResults, query]);

  const handleSearchByTest = () => {
    setAllStudentResults((result) =>
      [...result].sort((a, b) => {
        const testA = a.tests.title ?? '';
        const testB = b.tests.title ?? '';

        return testA.localeCompare(testB);
      }),
    );
  };

  const handleSearchByStudent = () => {
    setAllStudentResults((results) =>
      [...results].sort((a, b) => {
        const studentA = a.profiles?.display_name ?? '';
        const studentB = b.profiles?.display_name ?? '';

        return studentA.localeCompare(studentB);
      }),
    );
  };

  const handleSearchByDate = () => {
    setAllStudentResults((result) =>
      [...result].sort((a, b) => {
        const latestDate = a.created_at ?? null;
        const oldDate = b.created_at ?? null;

        return oldDate.localeCompare(latestDate);
      }),
    );
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN/RESULTS</h2>
      <div className={styles.container}>
        <div className={styles.serchSystems}>
          <SearchInput
            title='Search by Student name or Test title'
            value={query}
            onChange={setQuery}
          />
          <button className={styles.searchInfo} onClick={handleSearchByTest}>
            Search by test
          </button>
          <button className={styles.searchInfo} onClick={handleSearchByStudent}>
            Search by student
          </button>
          <button className={styles.searchInfo} onClick={handleSearchByDate}>
            Search by date
          </button>
        </div>

        <ResultsList
          allStudentResults={filteredSudents}
          checkDetails={handleCheckDetails}
        />
      </div>
    </div>
  );
};
