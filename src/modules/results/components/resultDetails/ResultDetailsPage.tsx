import styles from './ResultDetailsPage.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResultDetails } from '../../../../services/quiz';
import type { ResultDetails } from '../../../../types/database';
import { Loader } from '../../../Loader';

export const ResultDetailsPage = () => {
  const [resultDetails, setResultDetails] = useState<ResultDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { resultId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
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

  if (!resultId) {
    return;
  }

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

            <h1 className={styles.errorTitle}>{errorMessage}</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!resultDetails.length) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

            <h1 className={styles.emptyTitle}>No result details found</h1>

            <button
              type='button'
              className={styles.button}
              onClick={() => navigate(-1)}
            >
              Go back →
            </button>
          </div>
        </div>
      </main>
    );
  }

  const test = resultDetails[0].questions.tests;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.heroSection}>
            <div className={styles.heroTop}>
              <span className={styles.sectionLabel}>
                BETWEEN / RESULT DETAILS
              </span>

              <button
                type='button'
                className={styles.backButton}
                onClick={() => navigate(-1)}
              >
                ← Go back
              </button>
            </div>

            <div className={styles.heroContent}>
              <span className={styles.resultNumber}>01</span>

              <div>
                <h1 className={styles.pageTitle}>{test.title}</h1>

                <p className={styles.pageDescription}>{test.description}</p>
              </div>
            </div>
          </header>

          <section className={styles.answersSection}>
            {resultDetails.map((item, index) => {
              const correctAnswer = item.questions.answers?.find(
                (answer) => answer.is_correct,
              );

              const prevItem = resultDetails[index - 1];

              const isNewPart =
                item.questions.part_id !== prevItem?.questions.part_id;

              const isCorrect = item.answers.id === correctAnswer?.id;

              return (
                <div key={item.id}>
                  {isNewPart && item.questions.test_parts && (
                    <section className={styles.partSection}>
                      <div className={styles.partNumber}>
                        {String(
                          resultDetails
                            .slice(0, index)
                            .filter(
                              (currentItem, currentIndex) =>
                                currentItem.questions.part_id !==
                                resultDetails[currentIndex - 1]?.questions
                                  .part_id,
                            ).length + 1,
                        ).padStart(2, '0')}
                      </div>

                      <div className={styles.partContent}>
                        <h2 className={styles.partTitle}>
                          {item.questions.test_parts.title}
                        </h2>

                        <p className={styles.partInstruction}>
                          {item.questions.test_parts.instruction}
                        </p>
                      </div>
                    </section>
                  )}

                  <article className={styles.questionBlock}>
                    <div className={styles.questionMeta}>
                      <span>QUESTION</span>

                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <h3 className={styles.question}>
                      {item.questions.question}
                    </h3>

                    <div className={styles.answerGrid}>
                      <div
                        className={`${styles.answerBlock} ${
                          isCorrect
                            ? styles.answerCorrect
                            : styles.answerIncorrect
                        }`}
                      >
                        <span className={styles.answerLabel}>YOUR ANSWER</span>

                        <p className={styles.answerText}>
                          {item.answers.answer_text}
                        </p>
                      </div>

                      <div
                        className={`${styles.answerBlock} ${styles.correctAnswer}`}
                      >
                        <span className={styles.answerLabel}>
                          CORRECT ANSWER
                        </span>

                        <p className={styles.answerText}>
                          {correctAnswer?.answer_text ?? '—'}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </section>

          <footer className={styles.footer}>
            <button
              type='button'
              className={styles.button}
              onClick={() => navigate('/my-results')}
            >
              Back to my results →
            </button>
          </footer>
        </div>
      </div>
    </main>
  );
};
