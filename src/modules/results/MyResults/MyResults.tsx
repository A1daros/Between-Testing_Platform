import styles from './MyResults.module.scss';
import { useCallback } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';
import { OutdatedBadge } from '../../shared/components/OutdatedBadge';
import { getResultsByUserId } from '../../../services/results';
import { ROUTES } from '../../../constants/routes';
import { formatDate, formatTime } from '../../../utils/formatDate';
import { padNumber } from '../../../utils/padNumber';
import { isResultOutdated } from '../../../utils/isResultOutdated';
import { getTestTypeLabel } from '../../../constants/testTypes';

export const MyResults = () => {
  usePageMeta({ title: 'Мої результати', noindex: true });

  const { user } = useAuth();
  const userId = user?.id;

  const loadResults = useCallback(
    () => getResultsByUserId(userId as string),
    [userId],
  );

  const {
    data: results,
    loading,
    error,
    reload,
  } = useAsyncData(userId ? loadResults : null);

  if (loading) {
    return <Loader />;
  }

  if (error || !results) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState
            message='Не вдалося завантажити результати.'
            onAction={reload}
          />
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
                {padNumber(results.length)}
              </span>
            </div>
          </section>

          {results.length > 0 ? (
            <section className={styles.resultsSection}>
              <div className={styles.resultsList}>
                {results.map((result, index) => {
                  const testTitle = result.tests?.title ?? 'Невідомий тест';

                  return (
                    <article key={result.id} className={styles.resultItem}>
                      <span className={styles.resultNumber}>
                        {padNumber(index + 1)}
                      </span>

                      <div className={styles.testInfo}>
                        <h3 className={styles.testTitle}>{testTitle}</h3>

                        <span className={styles.testType}>
                          {getTestTypeLabel(result.tests?.test_type)}
                        </span>

                        {isResultOutdated(
                          result.created_at,
                          result.tests?.content_updated_at,
                        ) && <OutdatedBadge />}
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
                        {formatDate(result.created_at)}
                        <span>{formatTime(result.created_at)}</span>
                      </time>

                      <Link
                        to={generatePath(ROUTES.myResultDetails, {
                          resultId: String(result.id),
                        })}
                        className={styles.resultLink}
                        aria-label={`Переглянути результат: ${testTitle}`}
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
