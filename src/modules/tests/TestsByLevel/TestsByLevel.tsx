import { useEffect, useState } from 'react';
import styles from './TestsByLevel.module.scss';
import type { Level, Test } from '../../../types/database';
import { getLevelsById, getTestsByLevelId } from '../../../services/quiz';
import { Loader } from '../../Loader';
import { Link, useParams } from 'react-router-dom';

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
          <div className={styles.error}>{errorMessage}</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / LEVEL</span>
            {levels
              .filter((level) => String(level.id) === String(levelId))
              .map((level) => (
                <div key={level.id} className={styles.level}>{level.code}</div>
              ))}

            <div className={styles.heroContent}>
              <h1 className={styles.pageTitle}>Choose your test</h1>

              <p className={styles.pageDescription}>
                Select a test to check your English knowledge.
              </p>
            </div>
          </header>

          <section className={styles.testsSection}>
            <div className={styles.testsHeader}>
              <span className={styles.testsLabel}>AVAILABLE TESTS</span>

              <span className={styles.testsCount}>
                {String(testsByLevel.length).padStart(1, '0')}
              </span>
            </div>

            {testsByLevel.length > 0 ? (
              <ul className={styles.testsList}>
                {testsByLevel.map((test, index) => (
                  <li key={test.id} className={styles.testItem}>
                    <Link to={`/tests/${test.id}`} className={styles.testLink}>
                      <span className={styles.testNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className={styles.testTitle}>{test.title}</span>

                      <span className={styles.testArrow}>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
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
