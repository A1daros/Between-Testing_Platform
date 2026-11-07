import styles from './Overview.module.scss';
import {
  loadCountPendingStudents,
  loadCountStudents,
} from '../../../services/profile';
import { loadCountTests } from '../../../services/tests';
import {
  loadAttemptResults,
  loadRecentResults,
} from '../../../services/results';
import { formatDate } from '../../../utils/formatDate';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncData } from '../../../hooks/useAsyncData';
import { StatCard } from '../components/StatCard';
import { Loader } from '../../shared/components/Loader';
import { ErrorState } from '../../shared/components/ErrorState';

const loadOverview = async () => {
  const [totalTests, totalStudents, attempts, recentResults, pendingStudents] =
    await Promise.all([
      loadCountTests(),
      loadCountStudents(),
      loadAttemptResults(),
      loadRecentResults(),
      loadCountPendingStudents(),
    ]);

  return { totalTests, totalStudents, attempts, recentResults, pendingStudents };
};

const today = () =>
  new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const Overview = () => {
  const { profile } = useAuth();
  const { data, loading, error, reload } = useAsyncData(loadOverview);

  if (loading) {
    return <Loader />;
  }

  if (error || !data) {
    return <ErrorState message='Не вдалося завантажити дані.' onAction={reload} />;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / OVERVIEW</h2>

      <div className={styles.greetingRow}>
        <p className={styles.greeting}>Вітаємо, {profile?.display_name}</p>
        <span className={styles.dateBadge}>{today()}</span>
      </div>

      <p className={styles.greetingDescription}>
        Стежте за проходженням тестів, схвалюйте нових учнів і керуйте
        навчальним контентом. Ось що відбувається на платформі сьогодні.
      </p>

      <div className={styles.container}>
        <ul className={styles.list}>
          <StatCard
            label='Тести'
            value={data.totalTests}
            iconPath='/img/admin_ds/tests.svg'
          />
          <StatCard
            label='Учні'
            value={data.totalStudents}
            iconPath='/img/admin_ds/students.svg'
          />
          <StatCard
            label='Спроби'
            value={data.attempts}
            iconPath='/img/admin_ds/attempts.svg'
          />
          <StatCard
            label='Очікують схвалення'
            value={data.pendingStudents}
            iconPath='/img/admin_ds/pending.svg'
          />
        </ul>

        <div className={styles.recent}>
          <h3 className={styles.recentTitle}>Останні результати</h3>

          <ul className={styles.recentList}>
            {data.recentResults.map((result) => (
              <li key={result.id} className={styles.recentItem}>
                <div className={styles.studentInfo}>
                  <div className={styles.infoCard}>
                    <span className={styles.label}>Учень:</span>
                    <p className={styles.studentDescription}>
                      {result.profiles?.display_name || '—'}
                    </p>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.label}>Тест:</span>
                    <p className={styles.studentDescription}>
                      {result.tests.title || '—'}
                    </p>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.label}>Бал:</span>
                    <p className={styles.studentDescription}>
                      {result.score} / {result.total}
                    </p>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.label}>Дата:</span>
                    <p className={styles.studentDescription}>
                      {formatDate(result.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
