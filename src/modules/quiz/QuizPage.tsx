import styles from './QuizPage.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import { useQuiz } from '../../hooks/useQuiz';

import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';
import { getQuestionsWithAnswersByTestId } from '../../services/questions';
import { saveQuizResult } from '../../services/results';
import { Timer } from './components/Timer';
import { AudioPlayer } from './components/AudioPlayer';
import { MAX_AUDIO_PLAYS } from '../../constants/constants';
import { usePageMeta } from '../../hooks/usePageMeta';

export const QuizPage = () => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerType, setTimerType] = useState<'test' | 'question' | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Plays per test part, kept here so they survive moving between questions.
  const [audioPlays, setAudioPlays] = useState<Record<number, number>>({});

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
    isFinished,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  } = useQuiz(questions);

  usePageMeta({ title: currentQuestion?.tests.title ?? 'Тест', noindex: true });

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

        if (data.length > 0) {
          const test = data[0].tests;

          setTimerEnabled(test.timer_enabled);
          setTimerType(test.timer_type);
          setTimerDuration(test.timer_duration ?? 0);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setErrorMessage('Не вдалося завантажити квіз!');
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
        const result = await saveQuizResult({
          testId: Number(testId),
          userAnswers,
        });

        navigate(`/tests/${testId}/results`, {
          state: { score: result.score, totalScore: result.total, userAnswers },
          replace: true,
        });
      } catch (error) {
        console.error('Failed to save quiz results:', error);
        setErrorMessage('Не вдалося зберегти резульати!');

        isSavingRef.current = false;

        setIsSaving(false);
      }
    };

    sendResults();
  }, [isFinished, testId, total, userAnswers, navigate, user]);

  const handleTimerExpire = () => {
    if (timerType === 'test') {
      handleFinishQuiz();
      return;
    }

    if (currentQuestionIndex === total - 1) {
      handleFinishQuiz();
    } else {
      handleNextQuestion();
    }
  };

  const handleAudioPlayStart = (partId: number) => {
    setAudioPlays((prev) => ({ ...prev, [partId]: (prev[partId] ?? 0) + 1 }));
  };

  const currentAnswers = currentQuestion?.answers ?? [];
  const currentPart = currentQuestion?.test_parts ?? null;

  if (loading || isSaving) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <p className={styles.errorText}>Питання не знайдено.</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <Loader />;
  }

  const progress = total > 0 ? ((currentQuestionIndex + 1) / total) * 100 : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Проходження тесту</h1>

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

              {timerEnabled && timerDuration > 0 && (
                <Timer
                  key={timerType === 'test' ? testId : currentQuestion.id}
                  durationSeconds={timerDuration}
                  onExpire={handleTimerExpire}
                />
              )}

              <div className={styles.progressWrapper}>
                <div
                  className={styles.progressTrack}
                  role='progressbar'
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label='Прогрес тесту'
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
                <span className={styles.partNumber}>ПИТАННЯ</span>

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

              {currentPart?.audio_path && (
                // Keyed by part: stays mounted (and keeps playing) while the
                // student moves between questions of the same part.
                <AudioPlayer
                  key={currentPart.id}
                  path={currentPart.audio_path}
                  maxPlays={MAX_AUDIO_PLAYS}
                  playsUsed={audioPlays[currentPart.id] ?? 0}
                  onPlayStart={() => handleAudioPlayStart(currentPart.id)}
                />
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
                aria-label='Варіанти відповіді'
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
            {timerType !== 'question' && (
              <button
                type='button'
                className={styles.backButton}
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
              >
                ← Назад
              </button>
            )}

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
                ? 'Завершити тест'
                : 'Наступне питання →'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
