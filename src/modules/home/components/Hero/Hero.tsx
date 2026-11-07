import styles from './Hero.module.scss';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../constants/routes';

export const Hero = () => {
  return (
    <section className={styles.hero}>
      <span className={styles.label}>BETWEEN / ENGLISH SCHOOL</span>

      <h1 className={styles.title}>
        Англійська без <span className={styles.accent}>страху</span> помилки
      </h1>

      <div className={styles.bottom}>
        <p className={styles.description}>
          Школа англійської BETWEEN для дітей і підлітків 7–17 років. Визначте
          свій рівень за коротким тестом — реєстрація не потрібна.
        </p>

        <div className={styles.actions}>
          <Link className={styles.primaryButton} to={ROUTES.placementTest}>
            Визначити рівень
          </Link>
          <Link className={styles.linkButton} to={ROUTES.aboutSchool}>
            Про школу
          </Link>
        </div>
      </div>
    </section>
  );
};
