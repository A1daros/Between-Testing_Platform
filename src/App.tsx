import { useEffect, useState } from 'react';
import './App.css';
import type { Test } from './types/database';
import { getTests } from './services/quiz';

export const App = () => {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await getTests();

        setTests(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadTests();
  }, []);

  return (
    <>
      <section id='center'>
        {tests.map((test) => (
          <div key={test.id}>
            <h2>
              {test.title} {test.level}
            </h2>

            <p>{test.description}</p>
          </div>
        ))}
      </section>

      <div className='ticks'></div>
      <section id='spacer'></section>
    </>
  );
};
