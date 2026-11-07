import styles from './MyResults.module.scss';
import { Link, generatePath } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Result } from '../../../types/database';
import { Loader } from '../../shared/components/Loader';
import { getResultsByUserId } from '../../../services/results';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { ROUTES } from '../../../constants/routes';
import { formatDate, formatTime } from '../../../utils/formatDate';
import { getTestTypeLabel } from '../../../constants/testTypes';

export const MyResults = () => {
  usePageMeta({ title: 'Мої результати', noindex: true });

  const [results, setResults] = useState<Result[]>([]);
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
        setErrorMessage('Не вдалось завантажити результати!');
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
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <div className={styles.errorText}>{errorMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Мої результати</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / MY RESULTS</span>
            <h2 className={styles.sectionTitle}>Відстежуйте свій прогрес</h2>

            <p className={styles.sectionDescription}>
              Ваша історія тестувань і прогрес у навчанні.
            </p>

            <div className={styles.heroMeta}>
              <span>ЗАВЕРШЕНІ ТЕСТИ</span>

              <span className={styles.heroBadge}>
                {String(results.length).padStart(2, '0')}
              </span>
            </div>
          </section>

          {results.length > 0 ? (
            <section className={styles.resultsSection}>
              <div className={styles.resultsList}>
                {results.map((result, index) => {
                  const formattedDate = formatDate(result.created_at);
                  const formattedTime = formatTime(result.created_at);

                  return (
                    <article key={result.id} className={styles.resultItem}>
                      <span className={styles.resultNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className={styles.testInfo}>
                        <h3 className={styles.testTitle}>
                          {result.tests?.title ?? 'Невідомий тест'}
                        </h3>

                        <span className={styles.testType}>
                          {getTestTypeLabel(result.tests?.test_type)}
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
                        to={generatePath(ROUTES.myResultDetails, {
                          resultId: String(result.id),
                        })}
                        className={styles.resultLink}
                        aria-label={`Переглянути результат: ${result.tests?.title ?? 'Невідомий тест'}`}
                      >
                        <span>Переглянути</span>
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
                <h2 className={styles.emptyTitle}>Поки що немає результатів</h2>

                <p className={styles.emptyText}>
                  Пройдіть свій перший тест, щоб побачити результати тут.
                </p>
              </div>

              <Link to={ROUTES.tests} className={styles.button}>
                Виберіть тест <span aria-hidden='true'>→</span>
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
