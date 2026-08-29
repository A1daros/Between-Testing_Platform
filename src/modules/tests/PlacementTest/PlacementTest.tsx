import styles from './PlacementTest.module.scss';
import { useEffect, useState } from 'react';
import type { Level, QuestionWithAnswers } from '../../../types/database';
import { getLevelsById, getPlacementTest } from '../../../services/quiz';
import { Loader } from '../../Loader';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../../hooks/useQuiz';
import { calculateLevel } from '../../../utils/calculateLevel';

export const PlacementTest = () => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    isFinished,
    total,
    handleChoosePlacementAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  } = useQuiz(questions);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [questionsData, levelsData] = await Promise.all([
          getPlacementTest(),
          getLevelsById(),
        ]);
        setQuestions(questionsData);
        setLevels(levelsData);
      } catch (error) {
        console.error('Failed to load quiz data!', error);
        setErrorMessage('Failed to load quiz!');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
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

  if (isFinished) {
    const getLevelName = (code: string) => {
      const level = levels.find((level) => level.code === code);
      return `${level?.title} ${code}`;
    };

    const level = calculateLevel(questions, userAnswers);
    const levelName = getLevelName(level);

    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <section className={styles.resultSection}>
              <div className={styles.resultHeader}>
                <span className={styles.sectionLabel}>BETWEEN / PLACEMENT</span>

                <span className={styles.resultStatus}>TEST COMPLETED</span>
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
                  YOUR APPROXIMATE LEVEL
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
                <button
                  type='button'
                  className={styles.button}
                  onClick={() => navigate('/register')}
                >
                  Зроби цей крок →
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  const currentAnswers = currentQuestion?.answers ?? [];

  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / total) * 100;

  return (
    <main className={styles.page}>
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
              <span className={styles.partNumber}>QUESTION</span>

              <span className={styles.partTitle}>Placement test</span>
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
                    onClick={() => handleChoosePlacementAnswer(answer)}
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

            {currentQuestionIndex === total - 1 ? (
              <button
                type='button'
                className={styles.nextButton}
                disabled={!selectedAnswerId}
                onClick={handleFinishQuiz}
              >
                Finish test →
              </button>
            ) : (
              <button
                type='button'
                className={styles.nextButton}
                disabled={!selectedAnswerId}
                onClick={handleNextQuestion}
              >
                Next question →
              </button>
            )}
          </footer>
        </div>
      </div>
    </main>
  );
};
