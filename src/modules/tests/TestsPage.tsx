import { useEffect, useState } from 'react';
import styles from './TestsPage.module.scss';
import type { Test } from '../../types/database';
import { getTests } from '../../services/quiz';
import { Loader } from '../Loader';
import { Link } from 'react-router-dom';

export const TextsPage = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getTests();

        setTests(data);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Failed to load Home Page!');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

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
          {tests.map((test) => (
            <li key={test.id} style={{ cursor: 'pointer' }}>
              <Link to={`/tests/${test.id}`}>{test.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
