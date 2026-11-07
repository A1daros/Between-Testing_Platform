import styles from './TestsPage.module.scss';
import { Loader } from '../shared/components/Loader';
import { ErrorState } from '../shared/components/ErrorState';
import { TestsList } from './components/TestsList';
import { SectionHeader } from '../shared/components/SectionHeader';
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
        <SectionHeader
          as='h1'
          label='BETWEEN / TESTS'
          title='Знайдіть свій тест'
          description='Перевірте свої знання англійської: оберіть тест і дізнайтеся свій поточний рівень.'
        />

        <div className={styles.wrapper}>
          <TestsList
            tests={tests}
            emptyMessage='Поки що немає доступних тестів.'
          />
        </div>
      </div>
    </div>
  );
};
