import { useNavigate } from 'react-router-dom';
import styles from './About.module.scss';

export const About = () => {
  const navigate = useNavigate();

  return (
    <article className={styles.page}>
      <h2 className={styles.title}>What you can do here</h2>

      <div className={styles.wrapper}>
        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Learn</h3>
          <p className={styles.sectionDescription}>
            Learn materials based on your level.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Practice</h3>
          <p className={styles.sectionDescription}>
            Take tests and practice exercises.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Track your progress</h3>
          <p className={styles.sectionDescription}>
            Check results and track progress.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Improve your English</h3>
          <p className={styles.sectionDescription}>
            Gradually move to the next level.
          </p>
        </section>
      </div>

      <div className={styles.about}>
        <h3 className={styles.aboutTitle}>Learn English with Between</h3>

        <p className={styles.aboutDescription}>
          Between English Hub is designed to make learning English structured,
          clear, and consistent. The platform provides learning materials,
          practical exercises, and tests to help you build your skills and check
          your knowledge along the way. Progress step by step, practice
          regularly, and improve your English with Between.
        </p>

        <div className={styles.buttonBlock}>
          <button
            onClick={() => navigate('/about-school')}
            className={styles.ctaButton}
          >
            Explore school
          </button>
        </div>
      </div>
    </article>
  );
};
