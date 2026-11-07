import { useEffect, useState } from 'react';
import styles from './TestsByLevel.module.scss';
import type { Level, Test } from '../../../types/database';
import { getTestsByLevelId } from '../../../services/tests';
import { getLevels } from '../../../services/levels';
import { Loader } from '../../shared/components/Loader';
import { Link, generatePath, useParams } from 'react-router-dom';
import { getDurationLabel } from '../../../utils/getDurationLabel';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { ROUTES } from '../../../constants/routes';
import { QUESTION_FORMS, pluralize } from '../../../utils/pluralize';

export const TestsByLevel = () => {
  usePageMeta({ title: 'Тести рівня', noindex: true });

  const [testsByLevel, setTestsByLevel] = useState<Test[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { levelId } = useParams();

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const [testsData, levelsData] = await Promise.all([
          getTestsByLevelId(Number(levelId)),
          getLevels(),
        ]);

        if (!cancelled) {
          setTestsByLevel(testsData);
          setLevels(levelsData);
        }
      } catch (error) {
        console.error('Failed to load tests by level:', error);

        if (!cancelled) {
          setErrorMessage('Не вдалось завантажити тести!');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [levelId]);

  const currentLevel = levels.find((level) => String(level.id) === levelId);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
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
            {currentLevel && (
              <div className={styles.level}>{currentLevel.code}</div>
            )}

            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>
                Перевірте свої знання англійської мови
              </h2>

              <p className={styles.heroDescription}>
                Оберіть тест і дізнайтеся свій поточний рівень англійської мови.
              </p>
            </div>
          </section>

          <section className={styles.testsSection}>
            <div className={styles.testsHeader}>
              <span className={styles.testsLabel}>ДОСТУПНІ ТЕСТИ</span>

              <span className={styles.testsCount}>
                {String(testsByLevel.length).padStart(2, '0')}
              </span>
            </div>

            {testsByLevel.length > 0 ? (
              <ul className={styles.testsList}>
                {testsByLevel.map((test, index) => {
                  const testTitle = test.title ?? 'Тест без назви';
                  const testId = `test-title-${test.id}`;
                  const questionCount = Array.isArray(test.questions)
                    ? (test.questions[0]?.count ?? 0)
                    : 0;

                  return (
                    <li key={test.id} className={styles.testItem}>
                      <Link
                        to={generatePath(ROUTES.quiz, {
                          testId: String(test.id),
                        })}
                        className={styles.testCard}
                        aria-labelledby={testId}
                      >
                        <div className={styles.testCardHeader}>
                          <span className={styles.testNumber}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 id={testId} className={styles.testTitle}>
                            {testTitle}
                          </h3>
                        </div>

                        {test.description && (
                          <p className={styles.testDescription}>
                            {test.description}
                          </p>
                        )}

                        <div className={styles.testInfo}>
                          <div className={styles.metaBox}>
                            <span className={styles.metaBadge}>
                              {getDurationLabel(test)}
                            </span>
                            <span
                              className={styles.metaBadge}
                            >
                              {questionCount}{' '}
                              {pluralize(questionCount, QUESTION_FORMS)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.errorCard}>
                <p className={styles.errorText}>
                  Для цього рівня поки немає тестів.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
