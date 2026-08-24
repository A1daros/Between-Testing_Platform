import { Link, NavLink } from 'react-router-dom';
import styles from './Footer.module.scss';

export const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <Link to='/'>
            <img src='' alt='Page Logo' />
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.list}>
            <NavLink
              to='/www.linkedin.com/in/anatolii-lutai-dev'
              className={styles.link}
            >
              LinkedIn
            </NavLink>
            <NavLink to='/contacts' className={styles.link}>
              Contacts
            </NavLink>
            <NavLink to='/' className={styles.link}>
              All rights are reserved!
            </NavLink>
          </ul>
        </nav>

        <div className={styles.backTop}>
          <span className={styles.buttonTopText}>Back to top</span>
          <button
            className={styles.backTopButton}
            onClick={scrollTop}
            aria-label='Back to top'
          >
            <div className={styles.iconWrapper}>
              <img
                src='./img/icons/back-up.svg'
                alt='Back to top'
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
