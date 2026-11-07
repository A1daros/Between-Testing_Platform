import styles from './Header.module.scss';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../hooks/useAuth';
import { useEscapeKey } from '../../../../../hooks/useEscapeKey';
import { ROUTES } from '../../../../../constants/routes';

const getLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.link} ${isActive ? styles.isActive : ''}`;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { signOut, user, profile, loading } = useAuth();

  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  useEscapeKey(isMenuOpen, closeMenu);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    closeMenu();

    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }

    navigate(ROUTES.home);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link to={ROUTES.home} aria-label='На головну' onClick={closeMenu}>
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
          <ul className={styles.list} onClick={closeMenu}>
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

            {profile?.role === 'student' && (
              <li>
                <NavLink to={ROUTES.myResults} className={getLinkClass}>
                  Мої результати
                </NavLink>
              </li>
            )}

            {profile?.role === 'admin' && (
              <li>
                <NavLink to={ROUTES.admin} className={getLinkClass}>
                  Адмін панель
                </NavLink>
              </li>
            )}

            {!loading && user && (
              <li>
                <NavLink to={ROUTES.profile} className={getLinkClass}>
                  Профіль
                </NavLink>
              </li>
            )}

            {!loading && !user && (
              <li>
                <NavLink to={ROUTES.login} className={getLinkClass}>
                  Увійти
                </NavLink>
              </li>
            )}

            {!loading && user && (
              <li>
                <button
                  type='button'
                  onClick={handleSignOut}
                  className={styles.logoutBtn}
                >
                  Вийти
                </button>
              </li>
            )}
          </ul>
        </nav>

        <button
          type='button'
          className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ''}`}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
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
