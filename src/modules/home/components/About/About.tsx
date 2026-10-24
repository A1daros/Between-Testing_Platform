import { useNavigate } from 'react-router-dom';
import styles from './About.module.scss';

export const About = () => {
  const navigate = useNavigate();

  return (
    <article className={styles.page}>
      <h2 className={styles.title}>Що ми пропонуємо</h2>

      <div className={styles.wrapper}>
        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Навчайтеся</h3>
          <p className={styles.sectionDescription}>
            Вивчайте матеріали відповідно до свого рівня.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Практикуйтеся</h3>
          <p className={styles.sectionDescription}>
            Проходьте тести й виконуйте тренувальні вправи.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Відстежуйте свій прогрес</h3>
          <p className={styles.sectionDescription}>
            Перевіряйте результати тестування та відстежуйте свій розвиток.
          </p>
        </section>

        <section className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Покращуйте свою англійську</h3>
          <p className={styles.sectionDescription}>
            Поступово переходьте на наступний рівень.
          </p>
        </section>
      </div>

      <div className={styles.about}>
        <h3 className={styles.aboutTitle}>Вивчайте англійську з BETWEEN</h3>

        <p className={styles.aboutDescription}>
          Платформа BETWEEN допомагає вивчати англійську структуровано,
          зрозуміло й послідовно. Тут ви знайдете навчальні матеріали, практичні
          вправи та тести, які допоможуть розвивати навички й перевіряти знання.
          Просувайтеся крок за кроком і вдосконалюйте англійську разом із
          BETWEEN.
        </p>

        <div className={styles.buttonBlock}>
          <button
            onClick={() => navigate('/about-school')}
            className={styles.ctaButton}
          >
            Про школу
          </button>
        </div>
      </div>
    </article>
  );
};
