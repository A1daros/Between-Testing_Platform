import styles from './Tests.module.scss';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestsList } from './components/TestsList';
import { SearchInput } from '../components/SearchInput';
import { deleteTest, getTests } from '../../../services/tests';
import { ADMIN_ROUTES } from '../../../constants/routes';
import { getAdminPath } from '../../../utils/getAdminPath';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';
import { Alert } from '../../shared/components/Alert';
import { Modal } from '../../shared/components/Modal';

const loadAllTests = () => getTests({ includePlacement: true });

export const Tests = () => {
  const [query, setQuery] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const navigate = useNavigate();

  const {
    data: tests,
    loading,
    error,
    reload,
    setData: setTests,
  } = useAsyncData(loadAllTests);

  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (tests ?? []).filter((test) =>
      (test.title ?? '').toLowerCase().includes(normalizedQuery),
    );
  }, [tests, query]);

  const handleOpenConfirm = (testId: number) => {
    setDeleteError('');
    setDeleteId(testId);
  };

  const handleCloseConfirm = () => {
    if (!isDeleting) {
      setDeleteId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteTest(deleteId);

      setTests((prev) => prev?.filter((test) => test.id !== deleteId));
      setDeleteId(null);
    } catch (deleteTestError) {
      console.error('Failed to delete test:', deleteTestError);
      setDeleteError('Не вдалося видалити тест. Спробуйте ще раз.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !tests) {
    return (
      <ErrorState message='Не вдалося завантажити тести.' onAction={reload} />
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / TESTS</h2>
      <div className={styles.infoSection}>
        <div className={styles.searchSystems}>
          <SearchInput
            placeholder='Пошук тесту...'
            value={query}
            onChange={setQuery}
          />

          <button
            type='button'
            onClick={() => navigate(getAdminPath(ADMIN_ROUTES.testCreate))}
            className={styles.actionButton}
          >
            Додати тест
          </button>
        </div>
      </div>

      {deleteId !== null && (
        <Modal labelledBy='delete-test-title' onClose={handleCloseConfirm}>
          <div className={styles.confirmBox}>
            <p id='delete-test-title' className={styles.warningMessage}>
              Видалити цей тест? Результати учнів за ним також буде видалено.
            </p>

            {deleteError && <Alert>{deleteError}</Alert>}

            <div className={styles.buttons}>
              <button
                type='button'
                className={styles.confirmButton}
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Видалення...' : 'Так, видалити'}
              </button>
              <button
                type='button'
                className={styles.nonConfirmButton}
                disabled={isDeleting}
                onClick={handleCloseConfirm}
              >
                Скасувати
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className={styles.container}>
        <TestsList tests={filteredTests} onDeleteClick={handleOpenConfirm} />
      </div>
    </div>
  );
};
