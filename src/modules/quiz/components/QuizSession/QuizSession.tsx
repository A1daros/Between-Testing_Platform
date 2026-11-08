import styles from './QuizSession.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import type { QuestionWithAnswers, QuizAttempt } from '../../../../types/database';
import { useQuiz } from '../../../../hooks/useQuiz';
import { Loader } from '../../../shared/components/Loader';
import { ErrorState } from '../../../shared/components/ErrorState';
import { AnswerList } from '../../../shared/components/AnswerList';
import { QuizProgress } from '../../../shared/components/QuizProgress';
import { QuizNavigation } from '../../../shared/components/QuizNavigation';
import {
  registerAudioPlay,
  saveQuizProgress,
  submitQuizAttempt,
} from '../../../../services/quizAttempts';
import { MAX_AUDIO_PLAYS } from '../../../../constants/quiz';
import { ROUTES } from '../../../../constants/routes';
import { getQuizResultState } from '../../../../utils/getQuizResultState';
import { padNumber } from '../../../../utils/padNumber';
import { Timer } from '../Timer';
import { AudioPlayer } from '../AudioPlayer';

type QuizSessionProps = {
  testId: number;
  questions: QuestionWithAnswers[];
  attempt: QuizAttempt;
};

export const QuizSession = ({
  testId,
  questions,
  attempt,
}: QuizSessionProps) => {
  const initialIndex = Math.min(attempt.question_index, questions.length - 1);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [audioPlays, setAudioPlays] = useState(attempt.audio_plays);

  const isSavingRef = useRef(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const lastSavedRef = useRef(JSON.stringify([attempt.answers, initialIndex]));
  const sendResultsRef = useRef<() => void>(() => {});

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
  } = useQuiz(questions, {
    initialAnswers: attempt.answers,
    initialIndex,
  });

  const test = questions[0]?.tests;
  const hasTestTimer = attempt.seconds_left !== null;
  const hasQuestionTimer = attempt.question_seconds_left !== null;

  const sendResults = useCallback(async () => {
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      await saveQueueRef.current;

      const result = await submitQuizAttempt(attempt.id, userAnswers);

      navigate(generatePath(ROUTES.testResult, { testId: String(testId) }), {
        state: getQuizResultState(result),
        replace: true,
      });
    } catch (error) {
      console.error('Failed to save quiz results:', error);
      setSaveError(
        'Не вдалося зберегти результати. Перевірте підключення до інтернету й надішліть відповіді ще раз.',
      );
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [attempt.id, testId, userAnswers, navigate]);

  useEffect(() => {
    sendResultsRef.current = sendResults;
  }, [sendResults]);

  useEffect(() => {
    const snapshot = JSON.stringify([userAnswers, currentQuestionIndex]);

    if (snapshot === lastSavedRef.current || isSavingRef.current) {
      return;
    }

    lastSavedRef.current = snapshot;

    saveQueueRef.current = saveQueueRef.current
      .then(() =>
        saveQuizProgress(attempt.id, userAnswers, currentQuestionIndex),
      )
      .then((status) => {
        if (status !== 'active') {
          sendResultsRef.current();
        }
      })
      .catch((error) => {
        console.error('Failed to save quiz progress:', error);
      });
  }, [attempt.id, userAnswers, currentQuestionIndex]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (isSavingRef.current) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('beforeunload', warnBeforeLeaving);

    return () => {
      window.removeEventListener('beforeunload', warnBeforeLeaving);
    };
  }, []);

  const finishQuiz = () => {
    handleFinishQuiz();
    sendResults();
  };

  const isLastQuestion = currentQuestionIndex === total - 1;

  const handleTimerExpire = () => {
    if (hasTestTimer || isLastQuestion) {
      finishQuiz();
      return;
    }

    handleNextQuestion();
  };

  const handleAudioPlayStart = async (partId: number) => {
    const playsUsed = await registerAudioPlay(attempt.id, partId);

    setAudioPlays((prev) => ({ ...prev, [partId]: playsUsed }));
  };

  if (isSaving) {
    return <Loader />;
  }

  if (saveError) {
    return (
      <ErrorState
        message={saveError}
        actionLabel='Надіслати ще раз'
        onAction={sendResults}
      />
    );
  }

  if (!currentQuestion || !test) {
    return <ErrorState message='Питання не знайдено.' />;
  }

  const currentPart = currentQuestion.test_parts;
  const questionSeconds =
    currentQuestionIndex === initialIndex && attempt.question_seconds_left
      ? attempt.question_seconds_left
      : (test.timer_duration ?? 0);

  return (
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
            <h1 className={styles.testTitle}>{test.title}</h1>

            {test.description && (
              <p className={styles.testDescription}>{test.description}</p>
            )}
          </div>

          {hasTestTimer && attempt.seconds_left !== null && (
            <Timer
              key={attempt.id}
              durationSeconds={attempt.seconds_left}
              onExpire={handleTimerExpire}
            />
          )}

          {hasQuestionTimer && questionSeconds > 0 && (
            <Timer
              key={currentQuestion.id}
              durationSeconds={questionSeconds}
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
        showBack={!hasQuestionTimer}
        onPrev={handlePrevQuestion}
        onNext={handleNextQuestion}
        onFinish={finishQuiz}
      />
    </div>
  );
};
