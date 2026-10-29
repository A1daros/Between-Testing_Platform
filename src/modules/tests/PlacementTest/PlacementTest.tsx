import styles from './PlacementTest.module.scss';
import { useEffect, useState } from 'react';
import { Loader } from '../../Loader';
import { SCHOOL_INSTAGRAM_URL } from '../../../constants/constants';
import { useQuiz } from '../../../hooks/useQuiz';
import { getPlacementTest } from '../../../services/questions';
import type {
  PlacementQuestion,
  PlacementResult,
} from '../../../types/database';
import { calculatePlacementLevel } from '../../../services/placement';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { ROUTES } from '../../../constants/routes';

export const PlacementTest = () => {
  usePageMeta({
    title: 'Тест на визначення рівня англійської',
    description:
      'Безкоштовний онлайн-тест від школи BETWEEN без реєстрації: дізнайтеся свій орієнтовний рівень англійської від A1 до B2.',
    path: ROUTES.placementTest,
  });

  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [placementResult, setPlacementResult] =
    useState<PlacementResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const questionsData = await getPlacementTest();

        setQuestions(questionsData);
      } catch (error) {
        console.error('Failed to load quiz data!', error);
        setErrorMessage('Не вдалось завантажити тест!');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    let isCancelled = false;

    const loadResult = async () => {
      setIsCalculating(true);
      setResultError('');

      try {
        const result = await calculatePlacementLevel(userAnswers);

        if (!isCancelled) {
          setPlacementResult(result);
        }
      } catch (error) {
        console.error('Не вдалося визначити рівень розміщення:', error);

        if (!isCancelled) {
          setResultError(
            'Не вдалося розрахувати ваш рівень. Будь ласка, спробуйте ще раз.',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsCalculating(false);
        }
      }
    };

    loadResult();

    return () => {
      isCancelled = true;
    };
  }, [isFinished, userAnswers]);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>{errorMessage}</div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <p>Питань не знайдено.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished && resultError) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>{resultError}</div>
        </div>
      </div>
    );
  }

  if (isFinished && isCalculating) {
    return <Loader />;
  }

  if (isFinished) {
    const level = placementResult?.level_code;
    const levelName = `${placementResult?.level_title} ${level}`;

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
                  <span className={styles.levelCode}>{level}</span>
                </div>

                <h2 className={styles.levelName}>{levelName}</h2>
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

  const currentAnswers = currentQuestion?.answers ?? [];

  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / total) * 100;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <header className={styles.quizHeader}>
            <div className={styles.headerTop}>
              <span className={styles.sectionLabel}>BETWEEN / PLACEMENT</span>

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
              <span className={styles.partNumber}>ПИТАННЯ</span>

              <span className={styles.partTitle}>Тест на рівень</span>
            </div>

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
              ← Назад
            </button>

            {currentQuestionIndex === total - 1 ? (
              <button
                type='button'
                className={styles.nextButton}
                disabled={!selectedAnswerId}
                onClick={handleFinishQuiz}
              >
                Завершити тест →
              </button>
            ) : (
              <button
                type='button'
                className={styles.nextButton}
                disabled={!selectedAnswerId}
                onClick={handleNextQuestion}
              >
                Наступне питання →
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};
