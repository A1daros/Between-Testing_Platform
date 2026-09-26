import { useEffect, useState } from 'react';
import styles from './TestsPage.module.scss';
import type { Test } from '../../types/database';
import { Loader } from '../Loader';
import { Link } from 'react-router-dom';
import { getTests } from '../../services/tests';

const getDurationLabel = (test: Test) => {
  if (test.timer_type === null) {
    return 'without timer';
  }

  return test.timer_type === 'test' ? 'per test' : 'per question';
};

export const TestsPage = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const testsData = await getTests();

        setTests(testsData);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Failed to load Test page!');
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
        <div className={styles.errorCard}>
          <div className={styles.errorText}>{errorMessage}</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Find your Test</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / TESTS</span>
            <h2 className={styles.sectionTitle}>Check your English skills</h2>

            <p className={styles.sectionDescription}>
              Choose a test and discover your current level of English.
            </p>
          </section>

          <section className={styles.testsSection}>
            <div className={styles.testsHeader}>
              <span className={styles.testsLabel}>AVAILABLE TESTS</span>

              <span className={styles.testsCount}>
                {String(tests.length).padStart(2, '0')}
              </span>
            </div>

            <ul className={styles.testsList}>
              {tests.map((test, index) => {
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
          </section>
        </div>
      </div>
    </main>
  );
};
