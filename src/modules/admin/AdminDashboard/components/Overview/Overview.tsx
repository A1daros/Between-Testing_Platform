import { useEffect, useState } from 'react';
import styles from './Overview.module.scss';
import type { Results, Test } from '../../../../../types/database';
import {
  loadCountPendingStudents,
  loadCountStudents,
} from '../../../../../services/profile';
import { getTests } from '../../../../../services/tests';
import {
  loadAttemptResults,
  loadRecentResults,
} from '../../../../../services/results';
import { StatCard } from '../common/StatCard';
import { useAuth } from '../../../../../hooks/useAuth';
import { Loader } from '../../../../Loader';

export const Overview = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [attemptResults, setAttemptResults] = useState<number>(0);
  const [recentResults, setRecentResults] = useState<Results[]>([]);
  const [pendingStudents, setPendingStudents] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { profile } = useAuth();

  const testsIcon = '/img/admin_ds/tests.svg';
  const studentsIcon = '/img/admin_ds/students.svg';
  const attemptsIcon = '/img/admin_ds/attempts.svg';
  const pendingIcon = '/img/admin_ds/pending.svg';

  const today = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [
          testsData,
          totalStudentsData,
          attemptResultsData,
          recentResultsData,
          pendingStudentsData,
        ] = await Promise.all([
          getTests(),
          loadCountStudents(),
          loadAttemptResults(),
          loadRecentResults(),
          loadCountPendingStudents(),
        ]);

        setTests(testsData);
        setTotalStudents(totalStudentsData);
        setAttemptResults(attemptResultsData);
        setRecentResults(recentResultsData);
        setPendingStudents(pendingStudentsData);
      } catch (error) {
        console.error('Failed to load data!', error);
        setErrorMessage('не вдалося завантажити дані');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.container}>
        <h2 className={styles.errorTitle}>Помилка: {errorMessage}</h2>
        <p className={styles.errorDescription}>Спробуйте пізніше.</p>
        <button
          className={styles.errorButton}
          onClick={() => window.location.reload()}
        >
          Оновити сторінку
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / OVERVIEW</h2>

      <div className={styles.greetingRow}>
        <p className={styles.greeting}>Вітаємо, {profile?.display_name}</p>
        <span className={styles.dateBadge}>{today}</span>
      </div>

      <p className={styles.greetingDescription}>
        Стежте за проходженням тестів, схвалюйте нових учнів і керуйте
        навчальним контентом. Ось що відбувається на платформі сьогодні.
      </p>

      <div className={styles.container}>
        <ul className={styles.list}>
          <StatCard label='Тести' value={tests.length} iconPath={testsIcon} />
          <StatCard
            label='Учні'
            value={totalStudents}
            iconPath={studentsIcon}
          />
          <StatCard
            label='Спроби'
            value={attemptResults}
            iconPath={attemptsIcon}
          />
          <StatCard
            label='Очікують схвалення'
            value={pendingStudents}
            iconPath={pendingIcon}
          />
        </ul>

        <div className={styles.recent}>
          <h3 className={styles.recentTitle}>Останні результати</h3>

          <ul className={styles.recentList}>
            {recentResults.map((student) => {
              const date = new Date(student.created_at);
              const formattedDate = date.toLocaleDateString();

              return (
                <li key={student.id} className={styles.recentItem}>
                  <div className={styles.studentInfo}>
                    <div className={styles.infoCard}>
                      <span className={styles.label}>Учень:</span>
                      <p className={styles.studentDescription}>
                        {student.profiles?.display_name || student.id}
                      </p>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.label}>Тест:</span>
                      <p className={styles.studentDescription}>
                        {student.tests.title || '—'}
                      </p>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.label}>Бал:</span>
                      <p className={styles.studentDescription}>
                        {student.score} / {student.total}
                      </p>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.label}>Дата:</span>
                      <p className={styles.studentDescription}>
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
