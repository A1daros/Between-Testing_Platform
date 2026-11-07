import styles from './Results.module.scss';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../components/SearchInput';
import { Pagination } from '../components/Pagination';
import { ResultsList } from './components/ResultsList';
import type { AdminResultsSort } from '../../../types/database';
import { getAdminResults } from '../../../services/results';
import { ADMIN_ROUTES } from '../../../constants/routes';
import { getAdminPath } from '../../../utils/getAdminPath';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const SORT_OPTIONS: { value: AdminResultsSort; label: string }[] = [
  { value: 'test', label: 'Сортувати за тестом' },
  { value: 'student', label: 'Сортувати за учнем' },
  { value: 'date', label: 'Сортувати за датою' },
];

export const Results = () => {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<AdminResultsSort>('date');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);

  const navigate = useNavigate();

  const loadResults = useCallback(
    () =>
      getAdminResults({
        query: debouncedQuery,
        sort: sortBy,
        page,
        pageSize: PAGE_SIZE,
      }),
    [debouncedQuery, sortBy, page],
  );

  const { data, loading, error, reload } = useAsyncData(loadResults);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleSortChange = (sort: AdminResultsSort) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleCheckDetails = (resultId: number) => {
    navigate(getAdminPath(ADMIN_ROUTES.resultDetails, { resultId }));
  };

  if (loading && !data) {
    return <Loader />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message='Не вдалося завантажити результати.'
        onAction={reload}
      />
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
            onChange={handleQueryChange}
          />

          <div className={styles.searchSection}>
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type='button'
                className={`${styles.searchInfo} ${sortBy === value ? styles.activeSort : ''}`}
                aria-pressed={sortBy === value}
                onClick={() => handleSortChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <ResultsList results={data.items} onOpenDetails={handleCheckDetails} />
        <Pagination
          page={page}
          totalPages={Math.ceil(data.total / PAGE_SIZE)}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
