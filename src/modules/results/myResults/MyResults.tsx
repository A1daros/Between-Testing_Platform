import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Results } from '../../../types/database';
import { getResultsByUserId } from '../../../services/quiz';
import { Loader } from '../../Loader';

export const MyResults = () => {
  const [results, setResults] = useState<Results[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadResults = async () => {
      if (!user) {
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getResultsByUserId(user.id);

        setResults(data);
      } catch (error) {
        console.error('Failed to load results', error);
        setErrorMessage('Failed to load results!');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <div>
      <button onClick={() => navigate('/')}>Go home</button>

      {results.map((result) => {
        const date = new Date(result.created_at);

        return (
          <div key={result.id}>
            <h3>{result?.test.title ?? 'Unknown test'}</h3>

            <p>
              {result.score} / {result.total}
            </p>

            <p>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </p>

            <Link to={`/my-results/${result.id}`}>View details</Link>
          </div>
        );
      })}
    </div>
  );
};
