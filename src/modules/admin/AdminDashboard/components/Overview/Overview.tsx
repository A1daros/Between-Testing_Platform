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

export const Overview = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [attemptResults, setAttemptResults] = useState<number>(0);
  const [recentResults, setRecentResults] = useState<Results[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
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
        console.error(error);
      }
    };

    loadData();
  }, []);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN/ADMIN</h2>

      <div className={styles.container}>
        <ul className={styles.list}>
          <StatCard label='Tests' value={tests.length} />
          <StatCard label='Students' value={totalStudents} />
          <StatCard label='Attempts' value={attemptResults} />
          <StatCard label='Pending' value={0} />
        </ul>

        <div className={styles.recent}>
          <h3 className={styles.recentTitle}>Recent results</h3>

          <ul className={styles.recentList}>
            {recentResults.map((student) => {
              return (
                <li key={student.id} className={styles.recentItem}>
                  <div className={styles.studentInfo}>
                    <div>
                      <span className={styles.label}>Student Name:</span>
                      <p className={styles.studentName}>
                        {student.profiles?.display_name || student.id}
                      </p>
                    </div>

                    <div>
                      <span className={styles.label}>Test title:</span>
                      <p>{student.tests.title || 'Not valid'}</p>
                    </div>

                    <div>
                      <span className={styles.label}>Student Score:</span>
                      <p>
                        {student.score} / {student.total}
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
