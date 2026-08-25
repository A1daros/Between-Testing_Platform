import { useEffect, useState } from 'react';
import styles from './TestsByLevel.module.scss';
import type { Test } from '../../../types/database';
import { getTestsByLevelId } from '../../../services/quiz';
import { Loader } from '../../Loader';
import { Link, useParams } from 'react-router-dom';

export const TestsByLevel = () => {
  const [testsByLevel, setTestsByLevel] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { levelId } = useParams();

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await getTestsByLevelId(Number(levelId));

        setTestsByLevel(data);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Failed to load Home Page!');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [levelId]);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ul>
          {testsByLevel.map((test) => (
            <li key={test.id} style={{ cursor: 'pointer' }}>
              <Link to={`/tests/level/${test.level_id}`}>{test.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
