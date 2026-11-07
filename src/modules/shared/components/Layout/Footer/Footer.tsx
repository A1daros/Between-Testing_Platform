import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import {
  CONTACTS_SECTION_ID,
  ROUTES,
} from '../../../../../constants/routes';
import {
  SCHOOL_EMAIL,
  SCHOOL_INSTAGRAM_URL,
  SCHOOL_PHONE,
  SCHOOL_PHONE_LABEL,
} from '../../../../../constants/school';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  const scrollTop = () =>
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <Link to={ROUTES.home} aria-label='На головну'>
              <img
                src='/img/icons/logo.svg'
                alt='BETWEEN'
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>
              Школа англійської мови. Простір, де зникає страх помилки.
            </p>
          </div>

          <nav className={styles.column} aria-label='Навігація у футері'>
            <h2 className={styles.columnTitle}>Навігація</h2>
            <ul className={styles.list}>
              <li>
                <Link to={ROUTES.home} className={styles.link}>
                  Головна
                </Link>
              </li>
              <li>
                <Link to={ROUTES.aboutSchool} className={styles.link}>
                  Про школу
                </Link>
              </li>
              <li>
                <Link to={ROUTES.tests} className={styles.link}>
                  Тестування
                </Link>
              </li>
              <li>
                <Link
                  to={{ pathname: ROUTES.home, hash: CONTACTS_SECTION_ID }}
                  className={styles.link}
                >
                  Контакти
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Контакти</h2>
            <ul className={styles.list}>
              <li>
                <a href={`tel:${SCHOOL_PHONE}`} className={styles.link}>
                  {SCHOOL_PHONE_LABEL}
                </a>
              </li>
              <li>
                <a href={`mailto:${SCHOOL_EMAIL}`} className={styles.link}>
                  {SCHOOL_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={SCHOOL_INSTAGRAM_URL}
                  className={styles.link}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h2 className={styles.columnTitle}>Документи</h2>
            <ul className={styles.list}>
              <li>
                <Link to={ROUTES.privacy} className={styles.link}>
                  Конфіденційність
                </Link>
              </li>
              <li>
                <Link to={ROUTES.terms} className={styles.link}>
                  Умови
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className={styles.wordmark} aria-hidden='true'>
          BETWEEN
        </p>

        <div className={styles.bottom}>
          <span className={styles.copyright}>© {CURRENT_YEAR} BETWEEN</span>

          <button
            type='button'
            className={styles.backTopButton}
            onClick={scrollTop}
          >
            Нагору <span aria-hidden='true'>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
