import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useAuth } from '../../../../../hooks/useAuth';

export const Header = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.link} ${isActive ? styles.isActive : ''} `;

  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  console.log(user?.email);
  console.log(user?.role);
  console.log(profile?.role);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link to='/'>
            <img src='' alt='Page Logo' />
          </Link>

          <div className={styles.authContent}>
            <button onClick={handleSignOut}>Log out</button>

            <button onClick={() => navigate('/login')}>Log in</button>
          </div>
        </div>

        <nav className={styles.nav}>
          <ul>
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
            <li>
              <NavLink to='/my-results' className={getLinkClass}>
                My results
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
