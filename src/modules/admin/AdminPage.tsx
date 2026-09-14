import { AdminDashboard } from './AdminDashboard';
import styles from './AdminPage.module.scss';

export const AdminPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AdminDashboard />
      </div>
    </div>
  );
};
