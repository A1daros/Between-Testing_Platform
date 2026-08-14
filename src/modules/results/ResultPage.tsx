import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { saveResult, saveResultAnswers } from '../../services/quiz';
import { useAuth } from '../../hooks/useAuth';

export const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const { user } = useAuth();

  if (!location.state) {
    return <p>No result data found</p>;
  }

  const { score, total, userAnswers } = location.state;

  const handleSaveResult = async () => {
    if (!user) {
      return;
    }

    try {
      const result = await saveResult({
        test_id: Number(testId),
        user_id: user.id,
        score,
        total,
      });

      console.log(result.id);

      const resultAnswers = Object.entries(userAnswers).map(
        ([questionId, answerId]) => ({
          result_id: result.id,
          question_id: Number(questionId),
          answer_id: Number(answerId),
        }),
      );

      await saveResultAnswers(resultAnswers);

      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Quiz completed!</h2>

      <button onClick={handleSaveResult}>Save results</button>

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
