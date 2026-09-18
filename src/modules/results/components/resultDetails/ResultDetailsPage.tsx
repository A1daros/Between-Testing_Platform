import styles from './ResultDetailsPage.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResultDetails } from '../../../../types/database';
import { Loader } from '../../../Loader';
import { getResultDetails } from '../../../../services/resultAnswers';

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
        <div className={styles.errorCard}>
          <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

          <h2 className={styles.errorText}>{errorMessage}</h2>
        </div>
      </main>
    );
  }

  if (!resultDetails.length) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCard}>
          <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

          <h2 className={styles.errorText}>No result details found</h2>

          <button
            type='button'
            className={styles.button}
            onClick={() => navigate(-1)}
          >
            Go back →
          </button>
        </div>
      </main>
    );
  }

  const test = resultDetails[0]?.questions?.tests;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}></h1>

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
                ← Go back
              </button>
            </div>

            <div>
              <div className={styles.heroContent}>
                <h2 className={styles.heroTitle}>{test.title}</h2>

                {test?.description && (
                  <p className={styles.heroDescription}>{test.description}</p>
                )}
              </div>
            </div>
          </section>

          <section className={styles.answersSection}>
            {resultDetails.map((item, index) => {
              const correctAnswer = item.questions.answers?.find(
                (answer) => answer.is_correct,
              );

              const prevItem = resultDetails[index - 1];
              const isNewPart =
                item.questions.part_id !== prevItem?.questions?.part_id;

              const isCorrect = item.answers.id === correctAnswer?.id;
              const partNumber = resultDetails
                .slice(0, index + 1)
                .filter((currentItem, currentIndex) => {
                  const previousItem = resultDetails[currentIndex - 1];

                  return (
                    currentItem.questions.part_id !==
                      previousItem?.questions?.part_id &&
                    Boolean(currentItem.questions?.test_parts)
                  );
                }).length;

              return (
                <div key={item.id}>
                  {isNewPart && item.questions?.test_parts && (
                    <section className={styles.partSection}>
                      <span className={styles.partNumber} aria-hidden='true'>
                        {String(partNumber).padStart(2, '0')}
                      </span>

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

                      <span aria-label={`Question number ${index + 1}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
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

          <section className={styles.footer}>
            <button
              type='button'
              className={styles.button}
              onClick={() => navigate('/my-results')}
            >
              Back to my results
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};
