import { useEffect, useState } from 'react';
import { getResultsByTestId } from '../../services/quiz';
import type { Results } from '../../types/database';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';

export const AdminPage = () => {
  const [results, setResults] = useState<Results[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { testId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getResultsByTestId(Number(testId));

        setResults(data);
      } catch (error) {
        console.error('Failed to load student results', error);
        setErrorMessage('Failed to load student results!');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [testId]);

  if (!user) {
    return;
  }

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <div>
      {results.map((result) => {
        const date = new Date(result.created_at);

        return (
          <div key={result.id}>
            <h3>{result.profiles?.display_name}</h3>

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
