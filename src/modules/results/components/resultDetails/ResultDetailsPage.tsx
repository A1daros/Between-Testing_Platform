import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResultDetails } from '../../../../services/quiz';
import type { ResultDetails } from '../../../../types/database';

export const ResultDetailsPage = () => {
  const [resultDetails, setResultDetails] = useState<ResultDetails[]>([]);

  const { resultId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const loadResultDetails = async () => {
      try {
        const data = await getResultDetails(Number(resultId));

        setResultDetails(data);
      } catch (error) {
        console.error('Failed to load result answers', error);
      }
    };

    loadResultDetails();
  }, [resultId]);

  if (!resultId) {
    return;
  }

  if (!resultDetails.length) {
    return <p>Loading student result answers...</p>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>Go back</button>

      {resultDetails.map((item) => {
        const correctAnswer = item.questions.answers?.find(
          (answer) => answer.is_correct,
        );

        return (
          <div key={item.id}>
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
