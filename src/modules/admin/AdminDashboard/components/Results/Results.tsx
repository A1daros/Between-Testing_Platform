import { useEffect, useState } from 'react';
import { SearchInput } from '../common/SearchInput/SearchInput';
import { ResultsList } from './components/ResultsList/ResultsList';
import { Pagination } from '../common/Pagination';
import styles from './Results.module.scss';
import type {
  AdminResultsSort,
  Results,
} from '../../../../../types/database';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { getAdminResults } from '../../../../../services/results';
import { ADMIN_ROUTES, ROUTES } from '../../../../../constants/routes';
import { Loader } from '../../../../Loader';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const ResultsOverview = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<AdminResultsSort>('date');
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<Results[]>([]);
  const [total, setTotal] = useState(0);

  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { resultId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const data = await getAdminResults({
          query: debouncedQuery,
          sort: sortBy,
          page,
          pageSize: PAGE_SIZE,
        });

        if (!cancelled) {
          setResults(data.items);
          setTotal(data.total);
          setErrorMessage('');
        }
      } catch (error) {
        console.error('Failed to load all student results', error);

        if (!cancelled) {
          setErrorMessage('не вдалося завантажити результати');
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, sortBy, page, resultId]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSortChange = (sort: AdminResultsSort) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleCheckDetails = (id: number) => {
    navigate(
      `${ROUTES.admin}/${generatePath(ADMIN_ROUTES.resultDetails, {
        resultId: String(id),
      })}`,
    );
  };

  if (initialLoading) {
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
      <h2 className={styles.title}>BETWEEN / RESULTS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Пошук за учнем або тестом...'
            value={query}
            onChange={setQuery}
          />

          <div className={styles.searchSection}>
            <button
              className={`${styles.searchInfo} ${sortBy === 'test' ? styles.activeSort : ''}`}
              onClick={() => handleSortChange('test')}
            >
              Сортувати за тестом
            </button>
            <button
              className={`${styles.searchInfo} ${sortBy === 'student' ? styles.activeSort : ''}`}
              onClick={() => handleSortChange('student')}
            >
              Сортувати за учнем
            </button>
            <button
              className={`${styles.searchInfo} ${sortBy === 'date' ? styles.activeSort : ''}`}
              onClick={() => handleSortChange('date')}
            >
              Сортувати за датою
            </button>
          </div>
        </div>
      </div>

      <div>
        <ResultsList
          allStudentResults={results}
          checkDetails={handleCheckDetails}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
