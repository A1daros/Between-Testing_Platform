import { useEffect, useMemo, useState } from 'react';
import type { TestWithLevels } from '../../../../../types/database';
import { TestsList } from './components/TestsList/TestsList';
import styles from './Tests.module.scss';
import { getTestsWithLevel } from '../../../../../services/tests';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../common/SearchInput/SearchInput';
import { Loader } from '../../../../Loader';
import { deleteTest } from '../../../../../services/testsForm';

export const Tests = () => {
  const [testsWithLevels, setTestsWithLevels] = useState<TestWithLevels[]>([]);
  const [query, setQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingError, setIsDeletingError] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleAddTest = () => navigate('/admin/tests/create');

  useEffect(() => {
    const loadTests = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await getTestsWithLevel();
        setTestsWithLevels(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('Failed to load test. It can be empty');
      } finally {
        setIsLoading(false);
      }
    };

    loadTests();
  }, []);

  const filteredTests = useMemo(() => {
    return testsWithLevels.filter((test) => {
      const title = test.title.toLowerCase() ?? '';

      return title.includes(query.toLowerCase());
    });
  }, [testsWithLevels, query]);

  const handleOpenConfirm = (id: number) => {
    setActiveDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!activeDeleteId) {
      throw new Error('Test ID is missing');
    }

    try {
      setIsDeleting(true);
      setIsDeletingError('');

      await deleteTest(Number(activeDeleteId));
      setTestsWithLevels((prev) =>
        prev.filter((test) => test.id !== activeDeleteId),
      );

      setShowConfirm(false);
      setActiveDeleteId(null);
    } catch (error) {
      console.error('Failed to delete test:', error);
      setIsDeletingError('Failed to delete test. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return <Loader />;
  }

  if (errorMessage) {
    return <div className={styles.errorMessage}>{errorMessage}</div>;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / TESTS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Search for tests...'
            value={query}
            onChange={setQuery}
          />

          <button onClick={handleAddTest} className={styles.actionButton}>
            Add Test
          </button>
        </div>
      </div>

      {isDeletingError && (
        <div className={styles.errorMessage}>{isDeletingError}</div>
      )}

      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmBox}>
            <p className={styles.warningMessage}>
              Are you sure you want to delete this test?
            </p>

            <div className={styles.buttons}>
              <button
                type='button'
                className={styles.confirmButton}
                onClick={handleConfirmDelete}
              >
                Yes, i`m sure
              </button>
              <button
                type='button'
                className={styles.nonConfirmButton}
                onClick={() => {
                  setShowConfirm(false);
                  setActiveDeleteId(null);
                }}
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <TestsList allTests={filteredTests} onDeleteClick={handleOpenConfirm} />
      </div>
    </div>
  );
};
