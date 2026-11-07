import styles from './TestsByLevel.module.scss';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getTests } from '../../../services/tests';
import { getLevels } from '../../../services/levels';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';
import { TestsList } from '../components/TestsList';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { usePageMeta } from '../../../hooks/usePageMeta';

export const TestsByLevel = () => {
  usePageMeta({ title: 'Тести рівня', noindex: true });

  const { levelId } = useParams();
  const numericLevelId = Number(levelId);

  const loadData = useCallback(async () => {
    const [tests, levels] = await Promise.all([
      getTests({ levelId: numericLevelId }),
      getLevels(),
    ]);

    return {
      tests,
      level: levels.find((level) => level.id === numericLevelId) ?? null,
    };
  }, [numericLevelId]);

  const { data, loading, error, reload } = useAsyncData(
    Number.isInteger(numericLevelId) ? loadData : null,
  );

  if (loading) {
    return <Loader />;
  }

  if (error || !data) {
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
        <h1 className={styles.pageTitle}>Тести рівня</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / LEVEL</span>
            {data.level && <div className={styles.level}>{data.level.code}</div>}

            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>
                Перевірте свої знання англійської мови
              </h2>

              <p className={styles.heroDescription}>
                Оберіть тест і дізнайтеся свій поточний рівень англійської мови.
              </p>
            </div>
          </section>

          <TestsList
            tests={data.tests}
            emptyMessage='Для цього рівня поки немає тестів.'
          />
        </div>
      </div>
    </div>
  );
};
