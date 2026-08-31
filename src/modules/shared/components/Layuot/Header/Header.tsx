import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useAuth } from '../../../../../hooks/useAuth';
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
    navigate('/');
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
            to='/'
            aria-label='Home page'
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              className={styles.logo}
              src='./img/icons/logo.svg'
              alt='Page Logo'
            />
          </Link>
        </div>

        <nav
          id='primary-nav'
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
          aria-controls='primary-nav'
        >
          <ul className={styles.list} onClick={() => setIsMenuOpen(false)}>
            <li>
              <NavLink to='/' end className={getLinkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to='/about-school' className={getLinkClass}>
                About school
              </NavLink>
            </li>
            <li>
              <NavLink to='/tests' className={getLinkClass}>
                Tests
              </NavLink>
            </li>

            {profile?.role === 'student' ? (
              <li>
                <NavLink to='/my-results' className={getLinkClass}>
                  My results
                </NavLink>
              </li>
            ) : profile?.role === 'admin' ? (
              <li>
                <NavLink to='/admin' className={getLinkClass}>
                  Admin dashboard
                </NavLink>
              </li>
            ) : null}

            {user && (
              <li>
                <NavLink to={`/profile/${user?.id}`} className={getLinkClass}>
                  Profile
                </NavLink>
              </li>
            )}

            {!user ? (
              <li>
                <NavLink to='/login' className={getLinkClass}>
                  Sign in
                </NavLink>
              </li>
            ) : (
              <li>
                <button onClick={handleSignOut} className={styles.logoutBtn}>
                  Log out
                </button>
              </li>
            )}
          </ul>
        </nav>

        <button
          className={`${styles.burger} ${isMenuOpen ? styles.burgerActive : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label='Toggle menu'
          aria-expanded={isMenuOpen}
        >
          <span></span>
        </button>
      </div>
    </header>
  );
};
