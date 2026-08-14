import { useEffect, useState } from 'react';
import { getResultsByTestId } from '../../services/quiz';
import type { Results } from '../../types/database';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AdminPage = () => {
  const [results, setResults] = useState<Results[]>([]);

  const { testId } = useParams();

  const { user } = useAuth();

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

  if (!user) {
    return;
  }

  if (!results.length) {
    return <p>Loading student results...</p>;
  }

  return (
    <div>
      {results.map((result) => {
        const date = new Date(result.created_at);

        return (
          <div key={result.id}>
            <h3>{user?.user_metadata.display_name}</h3>

            <p>
              {result.score} / {result.total}
            </p>

            <p>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </p>

            <Link to={`/admin/result-details/${result.id}`}>View details</Link>
          </div>
        );
      })}
    </div>
  );
};
