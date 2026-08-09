import { useEffect, useState } from 'react';
import { getResultsByTestId } from '../../services/quiz';
import type { Results } from '../../types/database';
import { useNavigate, useParams } from 'react-router-dom';

export const AdminPage = () => {
  const [results, setResults] = useState<Results[]>([]);

  const { testId } = useParams();
  const navigate = useNavigate();

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

  return (
    <div>
      {results.map((result) => (
        <div key={result.id}>
          <h3>{result.student_name}</h3>

          <p>
            {result.score} / {result.total}
          </p>

          <button onClick={() => navigate(`/admin/result-details/${result.id}`)}>
            Show details
          </button>
        </div>
      ))}
    </div>
  );
};
