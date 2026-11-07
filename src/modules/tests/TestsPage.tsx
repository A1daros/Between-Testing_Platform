import styles from './TestsPage.module.scss';
import { Loader } from '../shared/components/Loader';
import { ErrorState } from '../shared/components/ErrorState';
import { TestsList } from './components/TestsList';
import { getTests } from '../../services/tests';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePageMeta } from '../../hooks/usePageMeta';

const loadTests = () => getTests();

export const TestsPage = () => {
  usePageMeta({ title: 'Тести', noindex: true });

  const { data: tests, loading, error, reload } = useAsyncData(loadTests);

  if (loading) {
    return <Loader />;
  }

  if (error || !tests) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState message='Не вдалося завантажити тести.' onAction={reload} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Знайдіть свій тест</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / TESTS</span>
            <h2 className={styles.sectionTitle}>
              Перевірте свої знання англійської мови
            </h2>

            <p className={styles.sectionDescription}>
              Оберіть тест і дізнайтеся свій поточний рівень англійської мови.
            </p>
          </section>

          <TestsList
            tests={tests}
            emptyMessage='Поки що немає доступних тестів.'
          />
        </div>
      </div>
    </div>
  );
};
