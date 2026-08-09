import { useLocation } from 'react-router-dom';

export const ResultPage = () => {
  const location = useLocation();

  const { score, total } = location.state;

  if (!location.state) {
    return <p>No result data found</p>;
  }

  return (
    <div>
      <h2>Quiz completed!</h2>

      <p>
        Your score is {score} out of {total}!
      </p>
    </div>
  );
};
