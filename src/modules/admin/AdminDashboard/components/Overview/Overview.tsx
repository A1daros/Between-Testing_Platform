import { useEffect, useState } from 'react';
import styles from './Overview.module.scss';
import type { Results, Test } from '../../../../../types/database';
import { loadCountStudents } from '../../../../../services/profile';
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

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { profile } = useAuth();

  const testsIcon = '/img/admin_ds/tests.svg';
  const studentsIcon = '/img/admin_ds/students.svg';
  const attemptsIcon = '/img/admin_ds/attempts.svg';
  const pendingIcon = '/img/admin_ds/pending.svg';

  const today = new Date().toLocaleDateString('en-US', {
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
        ] = await Promise.all([
          getTests(),
          loadCountStudents(),
          loadAttemptResults(),
          loadRecentResults(),
        ]);

        setTests(testsData);
        setTotalStudents(totalStudentsData);
        setAttemptResults(attemptResultsData);
        setRecentResults(recentResultsData);
      } catch (error) {
        console.error('Failed to load data!', error);
        setErrorMessage('Failed to load DATA!');
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
        <h2 className={styles.errorTitle}>Ooops, {errorMessage}</h2>
        <p className={styles.errorDescription}>Try again later!</p>
        <button className={styles.errorButton} onClick={() => {}}>
          Reload!
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN / OVERVIEW</h2>

      <div className={styles.greetingRow}>
        <p className={styles.greeting}>Welcome back, {profile?.display_name}</p>
        <span className={styles.dateBadge}>{today}</span>
      </div>

      <p className={styles.greetingDescription}>
        Monitor testing activity, review pending student submissions, and manage
        educational content. Here is what is happening on your platform today.
      </p>

      <div className={styles.container}>
        <ul className={styles.list}>
          <StatCard label='Tests' value={tests.length} iconPath={testsIcon} />
          <StatCard
            label='Students'
            value={totalStudents}
            iconPath={studentsIcon}
          />
          <StatCard
            label='Attempts'
            value={attemptResults}
            iconPath={attemptsIcon}
          />
          <StatCard label='Pending' value={0} iconPath={pendingIcon} />
        </ul>

        <div className={styles.recent}>
          <h3 className={styles.recentTitle}>Recent results</h3>

          <ul className={styles.recentList}>
            {recentResults.map((student) => {
              const date = new Date(student.created_at);
              const formattedDate = date.toLocaleDateString();

              return (
                <li key={student.id} className={styles.recentItem}>
                  <div className={styles.studentInfo}>
                    <div className={styles.infoCard}>
                      <span className={styles.label}>Student Name:</span>
                      <p className={styles.studentDescription}>
                        {student.profiles?.display_name || student.id}
                      </p>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.label}>Test title:</span>
                      <p className={styles.studentDescription}>
                        {student.tests.title || 'Not valid'}
                      </p>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.label}>Student Score:</span>
                      <p className={styles.studentDescription}>
                        {student.score} / {student.total}
                      </p>
                    </div>

                    <div className={styles.infoCard}>
                      <span className={styles.label}>Date:</span>
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
