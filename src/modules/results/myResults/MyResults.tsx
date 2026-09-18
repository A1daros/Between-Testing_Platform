import styles from './MyResults.module.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Results } from '../../../types/database';
import { Loader } from '../../Loader';
import { getResultsByUserId } from '../../../services/results';

export const MyResults = () => {
  const [results, setResults] = useState<Results[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getResultsByUserId(user.id);

        setResults(data);
      } catch (error) {
        console.error('Failed to load results', error);
        setErrorMessage('Failed to load results!');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user]);

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
        <h1 className={styles.pageTitle}>My results</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / MY RESULTS</span>
            <h2 className={styles.sectionTitle}>Track Your Progress</h2>

            <p className={styles.sectionDescription}>
              Your test history and learning progress.
            </p>

            <div className={styles.heroMeta}>
              <span>COMPLETED TESTS</span>

              <span className={styles.heroBadge}>
                {String(results.length).padStart(2, '0')}
              </span>
            </div>
          </section>

          {results.length > 0 ? (
            <section className={styles.resultsSection}>
              <div className={styles.resultsList}>
                {results.map((result, index) => {
                  const date = new Date(result.created_at);
                  const formattedDate = date.toLocaleDateString();
                  const formattedTime = date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <article key={result.id} className={styles.resultItem}>
                      <span className={styles.resultNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className={styles.testInfo}>
                        <h3 className={styles.testTitle}>
                          {result.tests?.title ?? 'Unknown test'}
                        </h3>

                        <span className={styles.testType}>
                          {result.tests?.test_type ?? 'TEST'}
                        </span>
                      </div>

                      <div className={styles.score}>
                        <span>{result.score}</span>
                        <span
                          className={styles.scoreDivider}
                          aria-hidden='true'
                        >
                          /
                        </span>
                        <span className={styles.scoreTotal}>
                          {result.total}
                        </span>
                      </div>

                      <time
                        className={styles.date}
                        dateTime={result.created_at}
                      >
                        {formattedDate}
                        <span>{formattedTime}</span>
                      </time>

                      <Link
                        to={`/my-results/${result.id}`}
                        className={styles.resultLink}
                        aria-label={`View results for ${result.tests?.title ?? 'Unknown test'}`}
                      >
                        <span>View</span>
                        <span className={styles.arrow} aria-hidden='true'>
                          →
                        </span>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className={styles.emptySection}>
              <span className={styles.emptyNumber}>00</span>

              <div>
                <h2 className={styles.emptyTitle}>No results yet</h2>

                <p className={styles.emptyText}>
                  Complete your first test to see your results here.
                </p>
              </div>

              <Link to='/tests' className={styles.button}>
                Choose a test <span aria-hidden='true'>→</span>
              </Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};
