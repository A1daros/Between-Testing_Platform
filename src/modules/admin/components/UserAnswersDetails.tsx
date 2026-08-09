import { useEffect, useState } from 'react';
import type { ResultDetails } from '../../../types/database';
import { useParams } from 'react-router-dom';
import { getResultDetails } from '../../../services/quiz';

export const UserAnswersDetails = () => {
  const [resultDetails, setResultDetails] = useState<ResultDetails[]>([]);

  const { resultId } = useParams();

  useEffect(() => {
    const loadResultAnswers = async () => {
      if (!resultId) {
        return;
      }

      try {
        const data = await getResultDetails(Number(resultId));

        setResultDetails(data);
      } catch (error) {
        console.error('Failed to load student result answers', error);
      }
    };

    loadResultAnswers();
  }, [resultId]);

  if (!resultDetails.length) {
    return <p>Loading student result answers...</p>;
  }

  return (
    <div>
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
