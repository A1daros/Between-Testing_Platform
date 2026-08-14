import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Results } from '../../../types/database';
import { getResultsByUserId } from '../../../services/quiz';

export const MyResults = () => {
  const [results, setResults] = useState<Results[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        return;
      }

      try {
        const data = await getResultsByUserId(user.id);
        setResults(data);
      } catch (error) {
        console.error('Failed to load results', error);
      }
    };

    loadResults();
  }, [user]);

  return (
    <div>
      <button onClick={() => navigate(-1)}>Go back</button>

      {results.map((result) => {
        const date = new Date(result.created_at);
        return (
          <div key={result.id}>
            <p>{result?.test.title ?? 'Unknown test'}</p>
            <p>
              {result.score} / {result.total}
            </p>
            <p>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </p>
          </div>
        );
      })}
    </div>
  );
};
