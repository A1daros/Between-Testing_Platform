import styles from './ResultDetails.module.scss';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../../../shared/components/Loader';
import { ErrorState } from '../../../shared/components/ErrorState';
import { OutdatedBadge } from '../../../shared/components/OutdatedBadge';
import { getResultDetails } from '../../../../services/resultAnswers';
import { useAsyncData } from '../../../../hooks/useAsyncData';
import { buildResultReview } from '../../../../utils/buildResultReview';
import { isResultOutdated } from '../../../../utils/isResultOutdated';

export const ResultDetails = () => {
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
      <ErrorState message='Не вдалося завантажити результат.' onAction={reload} />
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <ErrorState
        message='Результат не знайдено.'
        actionLabel='Назад'
        onAction={() => navigate(-1)}
      />
    );
  }

  const { rows } = data;
  const test = rows[0].questions.tests;
  const reviewItems = buildResultReview(rows);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.adminHeader}>
        <div>
          <span className={styles.badge}>Адмінка / Розбір результату</span>
          <h2 className={styles.pageTitle}>{test.title}</h2>
          {test.description && (
            <p className={styles.pageDescription}>{test.description}</p>
          )}
          {isResultOutdated(
            rows[0].results.created_at,
            test.content_updated_at,
          ) && <OutdatedBadge />}
        </div>
        <button
          type='button'
          className={styles.btnSecondary}
          onClick={() => navigate(-1)}
        >
          До списку
        </button>
      </div>

      <div className={styles.questionsList}>
        {reviewItems.map((item) => (
          <div key={item.id} className={styles.itemWrapper}>
            {item.part && (
              <div className={styles.partDivider}>
                <h3>{item.part.title}</h3>
                {item.part.instruction && <p>{item.part.instruction}</p>}
              </div>
            )}

            <div
              className={`${styles.questionCard} ${item.isCorrect ? styles.correct : styles.incorrect}`}
            >
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>
                  Питання {item.number}
                </span>
                <span className={styles.statusBadge}>
                  {item.isCorrect ? 'Правильно' : 'Неправильно'}
                </span>
              </div>

              <p className={styles.questionText}>{item.question}</p>

              <div className={styles.answersGrid}>
                <div className={styles.answerBox}>
                  <span className={styles.boxLabel}>Відповідь учня:</span>
                  <p className={styles.boxText}>{item.studentAnswer}</p>
                </div>

                <div className={styles.answerBox}>
                  <span className={styles.boxLabel}>Правильна відповідь:</span>
                  <p className={styles.boxText}>{item.correctAnswer ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
