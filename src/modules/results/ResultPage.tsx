import styles from './ResultPage.module.scss';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

export const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  if (!location.state) {
    return (
      <main className={styles.page}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorText}>No result data found</h2>

          <button
            type='button'
            className={styles.button}
            onClick={() => navigate('/')}
          >
            Back to home →
          </button>
        </div>
      </main>
    );
  }

  const { score, totalScore } = location.state;

  const percentage = totalScore ? Math.round((score / totalScore) * 100) : 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}></h1>

        <div className={styles.wrapper}>
          <section className={styles.resultSection}>
            <div className={styles.resultHeader}>
              <span className={styles.sectionLabel}>BETWEEN / RESULT</span>

              <span className={styles.resultStatus}>TEST COMPLETED</span>
            </div>

            <div className={styles.introWrapper}>
              <div className={styles.resultIntro}>
                <div className={styles.introContent}>
                  <h2 className={styles.introTitle}>Quiz completed!</h2>

                  <p className={styles.introDescription}>
                    Your test has been completed. Here is your result.
                  </p>
                </div>
              </div>

              <div className={styles.scoreSection}>
                <span className={styles.scoreLabel}>YOUR SCORE</span>

                <div
                  className={styles.scoreValue}
                  aria-label={`Score: ${score} out of ${totalScore}`}
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
                  Every test is not just about the result. It is about
                  understanding where you are now and what comes next.
                </p>

                <p className={styles.subtext}>
                  You can view more information and detailed analytics on {' '}
                  <Link to='/my-results' className={styles.inlineLink}>
                    your results page.
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
                Try again
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
