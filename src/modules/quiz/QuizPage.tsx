import styles from './QuizPage.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import { useQuiz } from '../../hooks/useQuiz';
import {
  getQuestionsWithAnswersByTestId,
  saveQuizResult,
} from '../../services/quiz';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';

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
    score,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
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

    if (currentQuestionIndex !== total) {
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
          total,
          userAnswers,
        });

        navigate(`/tests/${testId}/results`, {
          state: { score, total, userAnswers },
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
  }, [currentQuestionIndex, total, testId, userAnswers, navigate, score, user]);

  const currentAnswers = currentQuestion?.answers ?? [];

  if (loading || isSaving) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>{errorMessage}</div>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <p>No questions found.</p>
          </div>
        </div>
      </main>
    );
  }

  const progress = ((currentQuestionIndex + 1) / total) * 100;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.quizHeader}>
            <div className={styles.headerTop}>
              <span className={styles.sectionLabel}>BETWEEN / TEST</span>

              <span className={styles.questionCounter}>
                {String(currentQuestionIndex + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')}
              </span>
            </div>

            <div className={styles.headerContent}>
              <div>
                <h1 className={styles.testTitle}>
                  {currentQuestion.tests.title}
                </h1>

                {currentQuestion.tests.description && (
                  <p className={styles.testDescription}>
                    {currentQuestion.tests.description}
                  </p>
                )}
              </div>

              <div className={styles.progressWrapper}>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </header>

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

              <h2 className={styles.question}>{currentQuestion.question}</h2>
            </div>

            <div className={styles.answers}>
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
                  >
                    <span className={styles.answerNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className={styles.answerText}>
                      {answer.answer_text}
                    </span>

                    <span className={styles.answerIndicator}>
                      {isSelected ? '×' : '→'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <footer className={styles.navigation}>
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
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex === total - 1
                ? 'Finish quiz'
                : 'Next question →'}
            </button>
          </footer>
        </div>
      </div>
    </main>
  );
};
