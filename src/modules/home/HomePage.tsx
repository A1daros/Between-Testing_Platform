import { useEffect, useState } from 'react';
import type { Test } from '../../types/database';
import { getTest } from '../../services/quiz';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await getTest();

        setTests(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadTests();
  }, []);

  return (
    <section id='center'>
      <ul>
        {tests.map((test) => (
          <li key={test.id} style={{ cursor: 'pointer' }}>
            <Link to={`/tests/${test.id}`}>{test.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
