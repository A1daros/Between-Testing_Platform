import { Link, NavLink } from 'react-router-dom';
import styles from './Footer.module.scss';

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
          <Link to='/' aria-label='Go to home page'>
            <img
              src='./img/icons/logo.svg'
              alt='Page Logo'
              className={styles.logo}
            />
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.list}>
            <li>
              <a
                href='https://linkedin.com'
                className={styles.link}
                target='_blank'
                rel='noopener noreferrer'
              >
                LinkedIn
              </a>
            </li>
            <li>
              <NavLink to='/contacts' className={styles.link}>
                Contacts
              </NavLink>
            </li>
            <li>
              <NavLink to='/' className={styles.link}>
                Rights
              </NavLink>
            </li>
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
