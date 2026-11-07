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
        <header className={styles.hero}>
          <span className={styles.sectionLabel}>BETWEEN / LEVEL</span>

          <div className={styles.heroBody}>
            {data.level && (
              <span className={styles.level}>{data.level.code}</span>
            )}

            <div className={styles.heroContent}>
              <h1 className={styles.pageTitle}>
                Тести рівня{data.level ? ` «${data.level.title}»` : ''}
              </h1>

              <p className={styles.heroDescription}>
                Перевірте свої знання англійської: оберіть тест і дізнайтеся
                свій поточний рівень.
              </p>
            </div>
          </div>
        </header>

        <div className={styles.wrapper}>
          <TestsList
            tests={data.tests}
            emptyMessage='Для цього рівня поки немає тестів.'
          />
        </div>
      </div>
    </div>
  );
};
