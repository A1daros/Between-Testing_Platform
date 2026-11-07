import { Link, NavLink, generatePath, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useAuth } from '../../../../../hooks/useAuth';
import { ROUTES } from '../../../../../constants/routes';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.isActive : ''} `.trim();

  const { signOut, user, profile, loading } = useAuth();

  const navigate = useNavigate();

  const handleSignOut = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    signOut();
    setIsMenuOpen(false);
    navigate(ROUTES.home);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  if (loading) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link
            to={ROUTES.home}
            aria-label='На головну'
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              className={styles.logo}
              src='/img/icons/logo.svg'
              alt='BETWEEN'
            />
          </Link>
        </div>

        <nav
          id='primary-nav'
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
        >
          <ul className={styles.list} onClick={() => setIsMenuOpen(false)}>
            <li>
              <NavLink to={ROUTES.home} end className={getLinkClass}>
                Головна
              </NavLink>
            </li>
            <li>
              <NavLink to={ROUTES.aboutSchool} className={getLinkClass}>
                Про школу
              </NavLink>
            </li>
            <li>
              <NavLink to={ROUTES.tests} className={getLinkClass}>
                Тестування
              </NavLink>
            </li>

            {profile?.role === 'student' ? (
              <li>
                <NavLink to={ROUTES.myResults} className={getLinkClass}>
                  Мої результати
                </NavLink>
              </li>
            ) : profile?.role === 'admin' ? (
              <li>
                <NavLink to={ROUTES.admin} className={getLinkClass}>
                  Адмін панель
                </NavLink>
              </li>
            ) : null}

            {user && (
              <li>
                <NavLink
                  to={generatePath(ROUTES.profile, { userId: user.id })}
                  className={getLinkClass}
                >
                  Профіль
                </NavLink>
              </li>
            )}

            {!user ? (
              <li>
                <NavLink to={ROUTES.login} className={getLinkClass}>
                  Увійти
                </NavLink>
              </li>
            ) : (
              <li>
                <button onClick={handleSignOut} className={styles.logoutBtn}>
                  Вийти
                </button>
              </li>
            )}
          </ul>
        </nav>

        <button
          type='button'
          className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label='Меню'
          aria-controls='primary-nav'
          aria-expanded={isMenuOpen}
        >
          <span></span>
        </button>
      </div>
    </header>
  );
};
