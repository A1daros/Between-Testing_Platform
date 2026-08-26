import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useAuth } from '../../../../../hooks/useAuth';

export const Header = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.isActive : ''} `;

  const { signOut, user, profile, loading } = useAuth();

  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (loading) {
    return null;
  }

  console.log(user?.email);
  console.log(user?.role);
  console.log(profile?.role);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link to='/'>
            <img className={styles.logo} src='./img/icons/logo.svg' alt='Page Logo' />
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.list}>
            {!user ? (
              <li>
                <NavLink to='/login' className={getLinkClass}>
                  Sign in
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink
                  to='/'
                  onClick={handleSignOut}
                  className={getLinkClass}
                >
                  Log out
                </NavLink>
              </li>
            )}

            <li>
              <NavLink to='/' className={getLinkClass}>
                Home
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
          </ul>
        </nav>
      </div>
    </header>
  );
};
