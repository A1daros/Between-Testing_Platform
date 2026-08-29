import { useEffect, useState } from 'react';
import styles from './TestsPage.module.scss';
import type { Test } from '../../types/database';
import { getTests } from '../../services/quiz';
import { Loader } from '../Loader';
import { Link } from 'react-router-dom';

export const TestsPage = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getTests();

        setTests(data);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Failed to load Home Page!');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
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
            <span className={styles.sectionLabel}>BETWEEN / TESTS</span>

            <h1 className={styles.pageTitle}>Find your Test</h1>

            <p className={styles.pageDescription}>
              Choose a test and discover your current level of English.
            </p>
          </header>

          <section className={styles.testsSection}>
            <div className={styles.testsHeader}>
              <span className={styles.testsLabel}>AVAILABLE TESTS</span>

              <span className={styles.testsCount}>
                {String(tests.length).padStart(2, '0')}
              </span>
            </div>

            <ul className={styles.testsList}>
              {tests.map((test, index) => (
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
          </section>
        </div>
      </div>
    </main>
  );
};
