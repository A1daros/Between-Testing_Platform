import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  if (!location.state) {
    return <p>No result data found</p>;
  }

  const { score, total } = location.state;

  return (
    <div>
      <h2>Quiz completed!</h2>

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
