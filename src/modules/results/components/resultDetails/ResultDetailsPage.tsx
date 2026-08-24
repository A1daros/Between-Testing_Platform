import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResultDetails } from '../../../../services/quiz';
import type { ResultDetails } from '../../../../types/database';
import { Loader } from '../../../Loader';

export const ResultDetailsPage = () => {
  const [resultDetails, setResultDetails] = useState<ResultDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { resultId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const loadResultDetails = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getResultDetails(Number(resultId));

        setResultDetails(data);
      } catch (error) {
        console.error('Failed to load result answers:', error);
        setErrorMessage('Failed to load result details!');
      } finally {
        setLoading(false);
      }
    };

    loadResultDetails();
  }, [resultId]);

  if (!resultId) {
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
      <button onClick={() => navigate(-1)}>Go back</button>

      {resultDetails.length > 0 && (
        <div>
          <h1>{resultDetails[0].questions.tests.title}</h1>
          <h2>{resultDetails[0].questions.tests.description}</h2>
        </div>
      )}

      {resultDetails.map((item, index) => {
        const correctAnswer = item.questions.answers?.find(
          (answer) => answer.is_correct,
        );

        const prevItem = resultDetails[index - 1];
        const isNewPart =
          item.questions.part_id !== prevItem?.questions.part_id;

        return (
          <div key={item.id}>
            {isNewPart && item.questions.test_parts && (
              <div>
                <h3>{item.questions.test_parts.title}</h3>
                <p>{item.questions.test_parts.instruction}</p>
              </div>
            )}

            <div>
              <h4>Question: {item.questions.question}</h4>
            </div>

            <div>
              <h4>Student answer: {item.answers.answer_text}</h4>
            </div>

            <div>
              <h4>Correct answer: {correctAnswer?.answer_text}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};
