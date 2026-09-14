import styles from './AdminDashboard.module.scss';
import { NavLink, Outlet } from 'react-router-dom';

export const AdminDashboard = () => {
  return (
    <div>
      <div className={styles.sidebar}>
        <nav className={styles.nav}>
          <NavLink to={`/admin/overview`} className={styles.link}>
            Overview
          </NavLink>
          <NavLink to={`/admin/tests`} className={styles.link}>
            Tests
          </NavLink>
          <NavLink to={`/admin/results`} className={styles.link}>
            Results
          </NavLink>
          <NavLink to={`/admin/students`} className={styles.link}>
            Students
          </NavLink>
        </nav>

        <div className={styles.mainbar}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
