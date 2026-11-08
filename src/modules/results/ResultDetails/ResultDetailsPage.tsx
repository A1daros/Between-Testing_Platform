import styles from './ResultDetailsPage.module.scss';
import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';
import { OutdatedBadge } from '../../shared/components/OutdatedBadge';
import { getResultDetails } from '../../../services/resultAnswers';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { ROUTES } from '../../../constants/routes';
import { buildResultReview } from '../../../utils/buildResultReview';
import { isResultOutdated } from '../../../utils/isResultOutdated';
import { padNumber } from '../../../utils/padNumber';

export const ResultDetailsPage = () => {
  usePageMeta({ title: 'Розбір результату', noindex: true });

  const { resultId } = useParams();
  const numericResultId = Number(resultId);

  const navigate = useNavigate();

  const loadDetails = useCallback(
    () => getResultDetails(numericResultId),
    [numericResultId],
  );

  const { data, loading, error, reload } = useAsyncData(
    Number.isInteger(numericResultId) ? loadDetails : null,
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState
            message='Не вдалося завантажити деталі результату.'
            onAction={reload}
          />
        </div>
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState
            message='Відповідей не знайдено.'
            actionLabel='Повернутися назад'
            onAction={() => navigate(-1)}
          />
        </div>
      </div>
    );
  }

  const { rows, isKeyLocked } = data;
  const test = rows[0].questions.tests;
  const isOutdated = isResultOutdated(
    rows[0].results.created_at,
    test.content_updated_at,
  );
  const reviewItems = buildResultReview(rows);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Розбір результату</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <div className={styles.heroTop}>
              <span className={styles.sectionLabel}>
                BETWEEN / RESULT DETAILS
              </span>

              <button
                type='button'
                className={styles.backButton}
                onClick={() => navigate(-1)}
              >
                Повернутися назад
              </button>
            </div>

            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>{test.title}</h2>

              {test.description && (
                <p className={styles.heroDescription}>{test.description}</p>
              )}

              {isOutdated && <OutdatedBadge />}

              {isKeyLocked && (
                <p className={styles.keyNotice}>
                  Правильні відповіді відкриються після останньої спроби. Поки
                  що тут показано лише ваші відповіді.
                </p>
              )}
            </div>
          </section>

          <section className={styles.answersSection}>
            {reviewItems.map((item) => (
              <div key={item.id}>
                {item.part && (
                  <section className={styles.partSection}>
                    <span className={styles.partNumber} aria-hidden='true'>
                      {padNumber(item.part.number)}
                    </span>

                    <div className={styles.partContent}>
                      <h2 className={styles.partTitle}>{item.part.title}</h2>

                      <p className={styles.partInstruction}>
                        {item.part.instruction}
                      </p>
                    </div>
                  </section>
                )}

                <article className={styles.questionBlock}>
                  <div className={styles.questionMeta}>
                    <span>ЗАПИТАННЯ</span>

                    <span aria-label={`Питання ${item.number}`}>
                      {padNumber(item.number)}
                    </span>
                  </div>

                  <h3 className={styles.question}>{item.question}</h3>

                  <div className={styles.answerGrid}>
                    <div
                      className={`${styles.answerBlock} ${
                        isKeyLocked
                          ? ''
                          : item.isCorrect
                            ? styles.answerCorrect
                            : styles.answerIncorrect
                      }`}
                    >
                      <span className={styles.answerLabel}>ВАША ВІДПОВІДЬ</span>

                      <p className={styles.answerText}>{item.studentAnswer}</p>
                    </div>

                    {!isKeyLocked && (
                      <div
                        className={`${styles.answerBlock} ${styles.correctAnswer}`}
                      >
                        <span className={styles.answerLabel}>
                          ПРАВИЛЬНА ВІДПОВІДЬ
                        </span>

                        <p className={styles.answerText}>
                          {item.correctAnswer ?? '—'}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </section>

          <section className={styles.footer}>
            <Link to={ROUTES.myResults} className={styles.button}>
              Повернутися до моїх результатів
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};
