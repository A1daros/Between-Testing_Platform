import styles from './QuizPage.module.scss';
import { useCallback, useRef, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import type { QuizResultState } from '../../types/quiz';
import { useQuiz } from '../../hooks/useQuiz';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Loader } from '../shared/components/Loader';
import { ErrorState } from '../shared/components/ErrorState';
import { AnswerList } from '../shared/components/AnswerList';
import { QuizProgress } from '../shared/components/QuizProgress';
import { QuizNavigation } from '../shared/components/QuizNavigation';
import { getQuestionsWithAnswersByTestId } from '../../services/questions';
import { saveQuizResult } from '../../services/results';
import { Timer } from './components/Timer';
import { AudioPlayer } from './components/AudioPlayer';
import { MAX_AUDIO_PLAYS } from '../../constants/quiz';
import { ROUTES } from '../../constants/routes';
import { padNumber } from '../../utils/padNumber';

const NO_QUESTIONS: QuestionWithAnswers[] = [];

export const QuizPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const numericTestId = Number(testId);
  const isValidTestId = Number.isInteger(numericTestId) && numericTestId > 0;

  const loadQuestions = useCallback(
    () => getQuestionsWithAnswersByTestId(numericTestId),
    [numericTestId],
  );

  const {
    data,
    loading,
    error: loadError,
    reload,
  } = useAsyncData(isValidTestId ? loadQuestions : null);

  const questions = data ?? NO_QUESTIONS;

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [audioPlays, setAudioPlays] = useState<Record<number, number>>({});

  const isSavingRef = useRef(false);
  const navigate = useNavigate();

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  } = useQuiz(questions);

  usePageMeta({ title: currentQuestion?.tests.title ?? 'Тест', noindex: true });

  const test = questions[0]?.tests;
  const timerType = test?.timer_enabled ? test.timer_type : null;
  const timerDuration = test?.timer_duration ?? 0;

  const sendResults = useCallback(async () => {
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      const result = await saveQuizResult({
        testId: numericTestId,
        userAnswers,
      });

      const state: QuizResultState = {
        score: result.score,
        totalScore: result.total,
      };

      navigate(
        generatePath(ROUTES.testResult, { testId: String(numericTestId) }),
        { state, replace: true },
      );
    } catch (error) {
      console.error('Failed to save quiz results:', error);
      setSaveError(
        'Не вдалося зберегти результати. Перевірте підключення до інтернету й надішліть відповіді ще раз.',
      );
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [numericTestId, userAnswers, navigate]);

  const finishQuiz = () => {
    handleFinishQuiz();
    sendResults();
  };

  const isLastQuestion = currentQuestionIndex === total - 1;

  const handleTimerExpire = () => {
    if (timerType === 'test' || isLastQuestion) {
      finishQuiz();
      return;
    }

    handleNextQuestion();
  };

  const handleAudioPlayStart = (partId: number) => {
    setAudioPlays((prev) => ({ ...prev, [partId]: (prev[partId] ?? 0) + 1 }));
  };

  if (loading || isSaving) {
    return <Loader />;
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState message='Не вдалося завантажити тест.' onAction={reload} />
        </div>
      </div>
    );
  }

  if (saveError) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState
            message={saveError}
            actionLabel='Надіслати ще раз'
            onAction={sendResults}
          />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState message='Питання не знайдено.' />
        </div>
      </div>
    );
  }

  const currentPart = currentQuestion.test_parts;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <section className={styles.quizSection}>
            <div className={styles.sectionTop}>
              <span className={styles.sectionLabel}>BETWEEN / TEST</span>

              <span className={styles.questionCounter}>
                {padNumber(currentQuestionIndex + 1)} / {padNumber(total)}
              </span>
            </div>

            <div className={styles.sectionContent}>
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

              {timerType && timerDuration > 0 && (
                <Timer
                  key={timerType === 'test' ? numericTestId : currentQuestion.id}
                  durationSeconds={timerDuration}
                  onExpire={handleTimerExpire}
                />
              )}

            </div>

            <QuizProgress current={currentQuestionIndex + 1} total={total} />
          </section>

          <section className={styles.questionSection}>
            <div className={styles.partHeader}>
              <span className={styles.partNumber}>ПИТАННЯ</span>

              {currentPart?.title && (
                <span className={styles.partTitle}>{currentPart.title}</span>
              )}
            </div>

            {currentPart?.instruction && (
              <p className={styles.instruction}>{currentPart.instruction}</p>
            )}

            {currentPart?.audio_path && (
              <AudioPlayer
                key={currentPart.id}
                path={currentPart.audio_path}
                maxPlays={MAX_AUDIO_PLAYS}
                playsUsed={audioPlays[currentPart.id] ?? 0}
                onPlayStart={() => handleAudioPlayStart(currentPart.id)}
              />
            )}

            <div>
              {currentQuestion.description && (
                <p className={styles.questionDescription}>
                  {currentQuestion.description}
                </p>
              )}

              <h2 className={styles.question}>{currentQuestion.question}</h2>
            </div>

            <AnswerList
              answers={currentQuestion.answers}
              selectedAnswerId={selectedAnswerId}
              onSelect={handleChooseAnswer}
            />
          </section>

          <QuizNavigation
            isFirst={currentQuestionIndex === 0}
            isLast={isLastQuestion}
            canGoNext={selectedAnswerId !== null}
            showBack={timerType !== 'question'}
            onPrev={handlePrevQuestion}
            onNext={handleNextQuestion}
            onFinish={finishQuiz}
          />
        </div>
      </div>
    </div>
  );
};
