import styles from './PlacementTest.module.scss';
import { useCallback, useState } from 'react';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';
import { AnswerList } from '../../shared/components/AnswerList';
import { QuizProgress } from '../../shared/components/QuizProgress';
import { QuizNavigation } from '../../shared/components/QuizNavigation';
import { SCHOOL_INSTAGRAM_URL } from '../../../constants/school';
import { useQuiz } from '../../../hooks/useQuiz';
import { useAsyncData } from '../../../hooks/useAsyncData';
import {
  calculatePlacementLevel,
  getPlacementQuestions,
} from '../../../services/placement';
import type {
  PlacementQuestion,
  PlacementResult,
} from '../../../types/database';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { ROUTES } from '../../../constants/routes';
import { padNumber } from '../../../utils/padNumber';
import { captureError } from '../../../utils/captureError';

const NO_QUESTIONS: PlacementQuestion[] = [];

export const PlacementTest = () => {
  usePageMeta({
    title: 'Тест на визначення рівня англійської',
    description:
      'Безкоштовний онлайн-тест від школи BETWEEN без реєстрації: дізнайтеся свій орієнтовний рівень англійської від A1 до B2.',
    path: ROUTES.placementTest,
  });

  const {
    data,
    loading,
    error: loadError,
    reload,
  } = useAsyncData(getPlacementQuestions);

  const questions = data ?? NO_QUESTIONS;

  const [placementResult, setPlacementResult] =
    useState<PlacementResult | null>(null);
  const [resultError, setResultError] = useState('');

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    isFinished,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  } = useQuiz(questions);

  const loadResult = useCallback(async () => {
    setResultError('');

    try {
      setPlacementResult(await calculatePlacementLevel(userAnswers));
    } catch (error) {
      captureError(error);
      setResultError(
        'Не вдалося розрахувати ваш рівень. Будь ласка, спробуйте ще раз.',
      );
    }
  }, [userAnswers]);

  const finishQuiz = () => {
    handleFinishQuiz();
    loadResult();
  };

  if (loading) {
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

  if (!currentQuestion) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState message='Питань не знайдено.' />
        </div>
      </div>
    );
  }

  if (isFinished && resultError) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState message={resultError} onAction={loadResult} />
        </div>
      </div>
    );
  }

  if (isFinished && !placementResult) {
    return <Loader />;
  }

  if (isFinished && placementResult) {
    const { level_code: levelCode, level_title: levelTitle } = placementResult;

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <section className={styles.resultSection}>
              <div className={styles.resultHeader}>
                <span className={styles.sectionLabel}>BETWEEN / PLACEMENT</span>

                <span className={styles.resultStatus}>ТЕСТ ЗАВЕРШЕНО</span>
              </div>

              <div className={styles.resultContent}>
                <span className={styles.resultNumber}>01</span>

                <h1 className={styles.resultTitle}>Тест завершено!</h1>

                <p className={styles.resultDescription}>
                  За результатами тестування ми визначили ваш приблизний рівень
                  англійської.
                </p>
              </div>

              <div className={styles.levelResult}>
                <span className={styles.levelLabel}>
                  ВАШ ОРІЄНТОВНИЙ РІВЕНЬ
                </span>

                <div className={styles.levelBadge}>
                  <span className={styles.levelCode}>{levelCode}</span>
                </div>

                <h2 className={styles.levelName}>
                  {levelTitle} {levelCode}
                </h2>
              </div>

              <div className={styles.philosophy}>
                <div className={styles.philosophyNumber}>02</div>

                <div className={styles.philosophyContent}>
                  <p>
                    Усе найважливіше відбувається саме між — між страхом і
                    впевненістю, між «колись» і «зараз».
                  </p>

                  <p>
                    Саме тому ми називаємося <strong>BETWEEN</strong>. Ми не
                    вчимо англійської заради англійської. Ми допомагаємо зробити
                    той самий крок, після якого світ стає ближчим.
                  </p>
                </div>
              </div>

              <div className={styles.resultActions}>
                <a
                  href={SCHOOL_INSTAGRAM_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.button}
                >
                  Зроби цей крок →
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.quizHeader}>
            <div className={styles.headerTop}>
              <span className={styles.sectionLabel}>BETWEEN / PLACEMENT</span>

              <span className={styles.questionCounter}>
                {padNumber(currentQuestionIndex + 1)} / {padNumber(total)}
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

              <QuizProgress current={currentQuestionIndex + 1} total={total} />
            </div>
          </header>

          <section className={styles.questionSection}>
            <div className={styles.partHeader}>
              <span className={styles.partNumber}>ПИТАННЯ</span>

              <span className={styles.partTitle}>Тест на рівень</span>
            </div>

            <div className={styles.questionContent}>
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
            isLast={currentQuestionIndex === total - 1}
            canGoNext={selectedAnswerId !== null}
            onPrev={handlePrevQuestion}
            onNext={handleNextQuestion}
            onFinish={finishQuiz}
          />
        </div>
      </div>
    </div>
  );
};
