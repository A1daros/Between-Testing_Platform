import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SaveResult } from '../../services/quiz';
import { useState } from 'react';

export const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const [query, setQuery] = useState('');

  if (!location.state) {
    return <p>No result data found</p>;
  }

  const { score, total } = location.state;

  const handleSaveResult = async () => {
    try {
      await SaveResult({
        test_id: Number(testId),
        student_name: query,
        score,
        total,
      });

      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Quiz completed!</h2>

      <input
        type='text'
        placeholder='Enter your name'
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <button onClick={handleSaveResult} disabled={!query.trim()}>
        Save results
      </button>

      <p>
        Your score is {score} out of {total}!
      </p>

      <div className='buttons'>
        <button
          disabled={!testId}
          onClick={() => {
            navigate(`/tests/${testId}`);
          }}
        >
          Try again
        </button>

        <button
          onClick={() => {
            navigate('/');
          }}
        >
          Back to home
        </button>
      </div>
    </div>
  );
};
