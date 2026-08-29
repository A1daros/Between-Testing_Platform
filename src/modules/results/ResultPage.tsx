import styles from './ResultPage.module.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  if (!location.state) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

            <h1 className={styles.errorTitle}>No result data found</h1>

            <button
              type='button'
              className={styles.button}
              onClick={() => navigate('/')}
            >
              Back to home →
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { score, total } = location.state;

  const percentage = Math.round((score / total) * 100);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <section className={styles.resultSection}>
            <header className={styles.resultHeader}>
              <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

              <span className={styles.resultStatus}>TEST COMPLETED</span>
            </header>

            <div className={styles.resultIntro}>
              <span className={styles.resultNumber}>01</span>

              <div className={styles.introContent}>
                <h1 className={styles.title}>Quiz completed!</h1>

                <p className={styles.description}>
                  Your test has been completed. Here is your result.
                </p>
              </div>
            </div>

            <div className={styles.scoreSection}>
              <span className={styles.scoreLabel}>YOUR SCORE</span>

              <div className={styles.scoreValue}>
                <span className={styles.score}>{score}</span>

                <span className={styles.divider}>/</span>

                <span className={styles.total}>{total}</span>
              </div>

              <span className={styles.percentage}>{percentage}%</span>
            </div>

            <div className={styles.resultMessage}>
              <span className={styles.messageNumber}>02</span>

              <p>
                Every test is not just about the result. It is about
                understanding where you are now and what comes next.
              </p>
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
                Try again →
              </button>

              <button
                type='button'
                className={styles.secondaryButton}
                onClick={() => {
                  navigate('/');
                }}
              >
                Back to home
              </button>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
};
