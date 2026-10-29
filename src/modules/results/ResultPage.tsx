import styles from './ResultPage.module.scss';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';

export const ResultPage = () => {
  usePageMeta({ title: 'Результат тесту', noindex: true });

  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  if (!location.state) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorText}>Не знайдено жодного результату</h2>

          <button
            type='button'
            className={styles.button}
            onClick={() => navigate('/')}
          >
            Повернутись на головну →
          </button>
        </div>
      </div>
    );
  }

  const { score, totalScore } = location.state;

  const percentage = totalScore ? Math.round((score / totalScore) * 100) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Результат тесту</h1>

        <div className={styles.wrapper}>
          <section className={styles.resultSection}>
            <div className={styles.resultHeader}>
              <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

              <span className={styles.resultStatus}>ТЕСТ ЗАВЕРШЕНО</span>
            </div>

            <div className={styles.introWrapper}>
              <div className={styles.resultIntro}>
                <div className={styles.introContent}>
                  <h2 className={styles.introTitle}>КВІЗ ЗАВЕРШЕНО!</h2>

                  <p className={styles.introDescription}>
                    Ваш тест завершено. Ось ваш результат.
                  </p>
                </div>
              </div>

              <div className={styles.scoreSection}>
                <span className={styles.scoreLabel}>ВАШ РЕЗУЛЬТАТ</span>

                <div
                  className={styles.scoreValue}
                  aria-label={`Результат: ${score} з ${totalScore}`}
                >
                  <span className={styles.score}>{score}</span>
                  <span className={styles.divider} aria-hidden='true'>
                    /
                  </span>
                  <span className={styles.total}>{totalScore}</span>
                </div>

                <span className={styles.percentage}>{percentage}%</span>
              </div>
            </div>

            <div className={styles.resultMessage}>
              <div className={styles.messageContent}>
                <p className={styles.subtext}>
                  Будь-яке випробування — це не лише результат. Це розуміння
                  того, де ви перебуваєте зараз і що чекає попереду.
                </p>

                <p className={styles.subtext}>
                  Ви можете переглянути більше інформації та детальну аналітику
                  на{' '}
                  <Link to='/my-results' className={styles.inlineLink}>
                    ваша сторінка результатів.
                  </Link>
                </p>
              </div>
            </div>

            <footer className={styles.actions}>
              <button
                type='button'
                className={styles.button}
                disabled={!testId}
                onClick={() => {
                  navigate(`/tests/${testId}`);
                }}
              >
                Спробуйте ще раз
              </button>

              <button
                type='button'
                className={styles.secondaryButton}
                onClick={() => {
                  navigate('/');
                }}
              >
                Повернутися на головну
              </button>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
};
