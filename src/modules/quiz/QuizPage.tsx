import styles from './QuizPage.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import { useQuiz } from '../../hooks/useQuiz';

import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';
import { getQuestionsWithAnswersByTestId } from '../../services/questions';
import { saveQuizResult } from '../../services/results';

export const QuizPage = () => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();

  const navigate = useNavigate();

  const isSavingRef = useRef<boolean>(false);

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    total,
    score,
    totalScore,
    isFinished,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  } = useQuiz(questions);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!testId) {
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getQuestionsWithAnswersByTestId(Number(testId));

        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setErrorMessage('Failed to load quiz!');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [testId]);

  useEffect(() => {
    if (!testId || total === 0) {
      return;
    }

    if (!isFinished) {
      return;
    }

    if (!user?.id || isSavingRef.current) {
      return;
    }

    const sendResults = async () => {
      isSavingRef.current = true;

      setIsSaving(true);
      setErrorMessage('');

      try {
        await saveQuizResult({
          testId: Number(testId),
          userId: user.id,
          score,
          total: totalScore,
          userAnswers,
        });

        navigate(`/tests/${testId}/results`, {
          state: { score, totalScore, userAnswers },
          replace: true,
        });
      } catch (error) {
        console.error('Failed to save quiz results:', error);
        setErrorMessage('Failed to save results!');

        isSavingRef.current = false;

        setIsSaving(false);
      }
    };

    sendResults();
  }, [
    isFinished,
    total,
    totalScore,
    testId,
    userAnswers,
    navigate,
    score,
    user,
  ]);

  const currentAnswers = currentQuestion?.answers ?? [];

  if (loading || isSaving) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorText}>No questions found.</p>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return <Loader />;
  }

  const progress = total > 0 ? ((currentQuestionIndex + 1) / total) * 100 : 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Quiz page</h1>

        <div className={styles.wrapper}>
          <section className={styles.quizSection}>
            <div className={styles.sectionTop}>
              <span className={styles.sectionLabel}>BETWEEN / TEST</span>

              <span className={styles.questionCounter}>
                {String(currentQuestionIndex + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <div className={styles.sectionContent}>
              <div>
                <h2 className={styles.testTitle}>
                  {currentQuestion.tests.title}
                </h2>

                {currentQuestion.tests.description && (
                  <p className={styles.testDescription}>
                    {currentQuestion.tests.description}
                  </p>
                )}
              </div>

              <div className={styles.progressWrapper}>
                <div
                  className={styles.progressTrack}
                  role='progressbar'
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label='Quiz progress'
                >
                  <div
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {!currentQuestion ? (
            <div className={styles.loaderCenter}>
              <Loader />
            </div>
          ) : (
            <section className={styles.questionSection}>
              <div className={styles.partHeader}>
                <span className={styles.partNumber}>QUESTION</span>

                {currentQuestion.test_parts?.title && (
                  <span className={styles.partTitle}>
                    {currentQuestion.test_parts.title}
                  </span>
                )}
              </div>

              {currentQuestion.test_parts?.instruction && (
                <p className={styles.instruction}>
                  {currentQuestion.test_parts.instruction}
                </p>
              )}

              <div className={styles.questionContent}>
                {currentQuestion.description !== null && (
                  <p className={styles.questionDescription}>
                    {currentQuestion.description}
                  </p>
                )}

                <h3 className={styles.question}>{currentQuestion.question}</h3>
              </div>

              <div
                className={styles.answers}
                role='radiogroup'
                aria-label='Answers choices'
              >
                {currentAnswers.map((answer, index) => {
                  const isSelected = selectedAnswerId === answer.id;

                  return (
                    <button
                      key={answer.id}
                      type='button'
                      className={`${styles.answer} ${
                        isSelected ? styles.answerSelected : ''
                      }`}
                      onClick={() => handleChooseAnswer(answer)}
                      aria-checked={isSelected}
                      role='radio'
                    >
                      <span className={styles.answerNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className={styles.answerText}>
                        {answer.answer_text}
                      </span>

                      <span
                        className={styles.answerIndicator}
                        aria-hidden='true'
                      >
                        {isSelected ? '✓' : '→'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className={styles.navigation}>
            <button
              type='button'
              className={styles.backButton}
              disabled={currentQuestionIndex === 0}
              onClick={handlePrevQuestion}
            >
              ← Go back
            </button>

            <button
              type='button'
              className={styles.nextButton}
              disabled={!selectedAnswerId}
              onClick={
                currentQuestionIndex === total - 1
                  ? handleFinishQuiz
                  : handleNextQuestion
              }
            >
              {currentQuestionIndex === total - 1
                ? 'Finish quiz'
                : 'Next question →'}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};
