import styles from './NotFoundPage.module.scss';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { usePageMeta } from '../../hooks/usePageMeta';

export const NotFoundPage = () => {
  usePageMeta({ title: 'Сторінку не знайдено', noindex: true });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.section}>
          <span className={styles.label}>BETWEEN / 404</span>

          <h1 className={styles.title}>Сторінку не знайдено</h1>

          <p className={styles.description}>
            Можливо, посилання застаріло або в адресі є помилка.
          </p>

          <div className={styles.actions}>
            <Link to={ROUTES.home} className={styles.button}>
              На головну
            </Link>

            <Link to={ROUTES.placementTest} className={styles.secondaryButton}>
              Визначити свій рівень
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
