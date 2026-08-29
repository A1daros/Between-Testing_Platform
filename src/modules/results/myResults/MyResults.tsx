import styles from './MyResults.module.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Results } from '../../../types/database';
import { getResultsByUserId } from '../../../services/quiz';
import { Loader } from '../../Loader';

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
        <div className={styles.container}>
          <div className={styles.error}>
            <span className={styles.sectionLabel}>BETWEEN / RESULTS</span>

            <h1 className={styles.errorTitle}>{errorMessage}</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / MY RESULTS</span>

            <div className={styles.heroContent}>
              <h1 className={styles.pageTitle}>My results</h1>

              <p className={styles.pageDescription}>
                Your test history and learning progress.
              </p>
            </div>

            <div className={styles.heroMeta}>
              <span>COMPLETED TESTS</span>

              <span>{String(results.length).padStart(2, '0')}</span>
            </div>
          </header>

          {results.length > 0 ? (
            <section className={styles.resultsSection}>
              <div className={styles.listHeader}>
                <span>TEST</span>
                <span>SCORE</span>
                <span>DATE</span>
                <span />
              </div>

              <div className={styles.resultsList}>
                {results.map((result, index) => {
                  const date = new Date(result.created_at);

                  return (
                    <article key={result.id} className={styles.resultItem}>
                      <span className={styles.resultNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className={styles.testInfo}>
                        <h2 className={styles.testTitle}>
                          {result.test?.title ?? 'Unknown test'}
                        </h2>

                        <span className={styles.testType}>
                          {result.test?.title ?? 'TEST'}
                        </span>
                      </div>

                      <div className={styles.score}>
                        <span>{result.score}</span>

                        <span className={styles.scoreDivider}>/</span>

                        <span className={styles.scoreTotal}>
                          {result.total}
                        </span>
                      </div>

                      <time
                        className={styles.date}
                        dateTime={result.created_at}
                      >
                        {date.toLocaleDateString()}
                        <span>
                          {date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </time>

                      <Link
                        to={`/my-results/${result.id}`}
                        className={styles.resultLink}
                      >
                        <span>View</span>

                        <span className={styles.arrow}>→</span>
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
                Choose a test →
              </Link>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};
