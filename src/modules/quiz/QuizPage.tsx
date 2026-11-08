import styles from './QuizPage.module.scss';
import { useCallback, useEffect, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Loader } from '../shared/components/Loader';
import { ErrorState } from '../shared/components/ErrorState';
import { getQuestionsWithAnswersByTestId } from '../../services/questions';
import { getQuizAttempt, startQuizAttempt } from '../../services/quizAttempts';
import { ROUTES } from '../../constants/routes';
import { getQuizResultState } from '../../utils/getQuizResultState';
import { QuizSession } from './components/QuizSession';
import { QuizStart } from './components/QuizStart';
import { captureError } from '../../utils/captureError';

export const QuizPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const numericTestId = Number(testId);
  const isValidTestId = Number.isInteger(numericTestId) && numericTestId > 0;

  const navigate = useNavigate();

  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const loadQuiz = useCallback(async () => {
    const [questions, attemptState] = await Promise.all([
      getQuestionsWithAnswersByTestId(numericTestId),
      getQuizAttempt(numericTestId),
    ]);

    return { questions, attemptState };
  }, [numericTestId]);

  const { data, loading, error, reload, setData } = useAsyncData(
    isValidTestId ? loadQuiz : null,
  );

  const test = data?.questions[0]?.tests;
  const expiredResult = data?.attemptState.expired_result ?? null;

  usePageMeta({ title: test?.title ?? 'Тест', noindex: true });

  useEffect(() => {
    if (!expiredResult) {
      return;
    }

    navigate(
      generatePath(ROUTES.testResult, { testId: String(numericTestId) }),
      { state: getQuizResultState(expiredResult), replace: true },
    );
  }, [expiredResult, navigate, numericTestId]);

  const handleStart = async () => {
    setIsStarting(true);
    setStartError('');

    try {
      const attemptState = await startQuizAttempt(numericTestId);

      setData((prev) => prev && { ...prev, attemptState });
    } catch (startAttemptError) {
      captureError(startAttemptError);
      setStartError('Не вдалося почати тест. Спробуйте ще раз.');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading || expiredResult) {
    return <Loader />;
  }

  const renderContent = () => {
    if (error) {
      return (
        <ErrorState message='Не вдалося завантажити тест.' onAction={reload} />
      );
    }

    if (!data || !test) {
      return <ErrorState message='Питання не знайдено.' />;
    }

    const { attempt, attempts_used, attempts_allowed } = data.attemptState;

    if (attempt) {
      return (
        <QuizSession
          key={attempt.id}
          testId={numericTestId}
          questions={data.questions}
          attempt={attempt}
        />
      );
    }

    return (
      <QuizStart
        test={test}
        questionCount={data.questions.length}
        attemptsUsed={attempts_used}
        attemptsAllowed={attempts_allowed}
        isStarting={isStarting}
        errorMessage={startError}
        onStart={handleStart}
      />
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>{renderContent()}</div>
    </div>
  );
};
