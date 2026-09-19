import styles from './ResultDetails.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResultDetails } from '../../../../../../../types/database';
import { Loader } from '../../../../../../Loader';
import { getResultDetails } from '../../../../../../../services/resultAnswers';

export const ResultDetailsOverview = () => {
  const [resultDetails, setResultDetails] = useState<ResultDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { resultId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (!resultId) {
      return;
    }

    const loadResultDetails = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getResultDetails(Number(resultId));

        setResultDetails(data);
      } catch (error) {
        console.error('Failed to load result answers:', error);
        setErrorMessage('Failed to load result details!');
      } finally {
        setLoading(false);
      }
    };

    loadResultDetails();
  }, [resultId]);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage || !resultDetails.length) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorBlock}>
          <h2>{errorMessage || 'No result details found'}</h2>
          <button
            type='button'
            className={styles.btnSecondary}
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }
  const test = resultDetails[0].questions.tests;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.adminHeader}>
        <div>
          <span className={styles.badge}>Admin / Result Details</span>
          <h2 className={styles.pageTitle}>{test.title}</h2>
          {test.description && (
            <p className={styles.pageDescription}>{test.description}</p>
          )}
        </div>
        <button
          type='button'
          className={styles.btnSecondary}
          onClick={() => navigate(-1)}
        >
          Back to List
        </button>
      </div>

      <div className={styles.questionsList}>
        {resultDetails.map((item, index) => {
          const correctAnswer = item.questions.answers?.find(
            (ans) => ans.is_correct,
          );
          const isCorrect = item.answers.id === correctAnswer?.id;

          const prevItem = resultDetails[index - 1];
          const isNewPart =
            item.questions.part_id !== prevItem?.questions.part_id;

          return (
            <div key={item.id} className={styles.itemWrapper}>
              {isNewPart && item.questions.test_parts && (
                <div className={styles.partDivider}>
                  <h3>{item.questions.test_parts.title}</h3>
                  {item.questions.test_parts.instruction && (
                    <p>{item.questions.test_parts.instruction}</p>
                  )}
                </div>
              )}

              <div
                className={`${styles.questionCard} ${isCorrect ? styles.correct : styles.incorrect}`}
              >
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>
                    Question {index + 1}
                  </span>
                  <span className={styles.statusBadge}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <p className={styles.questionText}>{item.questions.question}</p>

                <div className={styles.answersGrid}>
                  <div className={styles.answerBox}>
                    <span className={styles.boxLabel}>Student's Answer:</span>
                    <p className={styles.boxText}>{item.answers.answer_text}</p>
                  </div>

                  <div className={styles.answerBox}>
                    <span className={styles.boxLabel}>Correct Answer:</span>
                    <p className={styles.boxText}>
                      {correctAnswer?.answer_text ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
