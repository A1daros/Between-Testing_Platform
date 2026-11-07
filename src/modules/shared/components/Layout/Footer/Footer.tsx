import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import {
  CONTACTS_SECTION_ID,
  ROUTES,
} from '../../../../../constants/routes';
import { SCHOOL_INSTAGRAM_URL } from '../../../../../constants/constants';

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
        <div className={styles.footerContent}>
          <Link to={ROUTES.home} aria-label='На головну'>
            <img
              src='/img/icons/logo.svg'
              alt='BETWEEN'
              className={styles.logo}
            />
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.list}>
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
            <li>
              <Link
                to={{ pathname: ROUTES.home, hash: CONTACTS_SECTION_ID }}
                className={styles.link}
              >
                Контакти
              </Link>
            </li>
            <li>
              <span className={styles.copyright}>© {CURRENT_YEAR} BETWEEN</span>
            </li>
          </ul>
        </nav>

        <div className={styles.backTop}>
          <span className={styles.buttonTopText}>Повернутися на початок</span>
          <button
            className={styles.backTopButton}
            onClick={scrollTop}
            aria-label='Повернуться на початок'
          >
            <div className={styles.iconWrapper}>
              <img
                src='/img/icons/back-up.svg'
                alt=''
                aria-hidden='true'
                className={styles.icon}
              />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};
