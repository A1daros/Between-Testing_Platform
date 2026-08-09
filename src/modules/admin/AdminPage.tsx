import { useEffect, useState } from 'react';
import { getResultsByTestId } from '../../services/quiz';
import type { Results } from '../../types/database';
import { useParams } from 'react-router-dom';

export const AdminPage = () => {
  const [results, setResults] = useState<Results[]>([]);

  const { testId } = useParams();

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await getResultsByTestId(Number(testId));

        setResults(data);
      } catch (error) {
        console.error('Failed to load student results', error);
      }
    };

    loadResults();
  }, [testId]);

  if (!results.length) {
    return <p>Loading student results...</p>;
  }

  console.log('testId', testId);

  return (
    <div>
      {results.map((result) => (
        <div key={result.id}>
          <h3>{result.student_name}</h3>

          <p>
            {result.score} / {result.total}
          </p>
        </div>
      ))}
    </div>
  );
};
