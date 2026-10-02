import { useEffect, useState } from 'react';
import styles from './TestsByLevel.module.scss';
import type { Level, Test } from '../../../types/database';
import { getTestsByLevelId } from '../../../services/tests';
import { getLevelsById } from '../../../services/levels';
import { Loader } from '../../Loader';
import { Link, useParams } from 'react-router-dom';
import { getDurationLabel } from '../../../utils/getDurationLabel';

export const TestsByLevel = () => {
  const [testsByLevel, setTestsByLevel] = useState<Test[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { levelId } = useParams();

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await getTestsByLevelId(Number(levelId));

        setTestsByLevel(data);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [levelId]);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const data = await getLevelsById();

        setLevels(data);
      } catch (error) {
        console.error('Failed to load levels:', error);
        setErrorMessage('Failed to load levels');
      } finally {
        setLoading(false);
      }
    };

    loadLevels();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}></h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / LEVEL</span>
            {levels
              .filter((level) => String(level.id) === String(levelId))
              .map((level) => (
                <div key={level.id} className={styles.level}>
                  {level.code}
                </div>
              ))}

            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>Check your English skills</h2>

              <p className={styles.heroDescription}>
                Choose a test and discover your current level of English.
              </p>
            </div>
          </section>

          <section className={styles.testsSection}>
            <div className={styles.testsHeader}>
              <span className={styles.testsLabel}>AVAILABLE TESTS</span>

              <span className={styles.testsCount}>
                {String(testsByLevel.length).padStart(2, '0')}
              </span>
            </div>

            {testsByLevel.length > 0 ? (
              <ul className={styles.testsList}>
                {testsByLevel.map((test, index) => {
                  const testTitle = test.title ?? 'Untitled Test';
                  const testId = `test-title-${test.id}`;
                  const questionCount = Array.isArray(test.questions)
                    ? (test.questions[0]?.count ?? 0)
                    : 0;

                  return (
                    <li key={test.id} className={styles.testItem}>
                      <Link
                        to={`/tests/${test.id}`}
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
                            <span
                              className={styles.metaBadge}
                              aria-label={`Duration: ${test.timer_duration ?? 'unlimited'} seconds`}
                            >
                              ⏱{' '}
                              {test.timer_duration !== null
                                ? `${test.timer_duration}s `
                                : ''}
                              {getDurationLabel(test)}
                            </span>
                            <span
                              className={styles.metaBadge}
                              aria-label={`${questionCount} questions`}
                            >
                              ❓ {questionCount} questions
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
                  No tests available for this level yet.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
