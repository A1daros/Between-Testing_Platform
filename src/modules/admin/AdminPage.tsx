import { AdminDashboard } from './AdminDashboard';
import styles from './AdminPage.module.scss';
import { usePageMeta } from '../../hooks/usePageMeta';

export const AdminPage = () => {
  usePageMeta({ title: 'Адмінка', noindex: true });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AdminDashboard />
      </div>
    </div>
  );
};
