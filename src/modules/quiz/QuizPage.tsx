import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import { useQuiz } from '../../hooks/useQuiz';
import { getQuestionsWithAnswersByTestId } from '../../services/quiz';

export const QuizPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    score,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
  } = useQuiz(questions);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!testId) {
        return;
      }

      try {
        const data = await getQuestionsWithAnswersByTestId(Number(testId));

        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    loadQuestions();
  }, [testId]);

  useEffect(() => {
    if (!testId || total === 0) {
      return;
    }

    if (currentQuestionIndex === total) {
      navigate(`/tests/${testId}/results`, {
        state: {
          score,
          total,
          userAnswers,
        },
        replace: true,
      });
    }
  }, [currentQuestionIndex, total, testId, userAnswers, navigate, score]);

  if (!questions.length) {
    return <p>Loading quiz questions...</p>;
  }

  if (currentQuestionIndex === total) {
    return <p>Redirecting to results...</p>;
  }

  const currentAnswers = currentQuestion?.answers ?? [];

  return (
    <div>
      {currentQuestion && (
        <div>
          <p>
            {currentQuestionIndex + 1} of {total}
          </p>

          <h2>{currentQuestion.question}</h2>

          <div>
            {currentAnswers.map((answer) => (
              <button
                key={answer.id}
                className={selectedAnswerId === answer.id ? 'selected' : ''}
                style={
                  selectedAnswerId === answer.id
                    ? { backgroundColor: 'aquamarine' }
                    : undefined
                }
                onClick={() => handleChooseAnswer(answer)}
              >
                {answer.answer_text}
              </button>
            ))}
          </div>

          <div className='buttons'>
            <button
              disabled={currentQuestionIndex === 0}
              onClick={handlePrevQuestion}
            >
              Go back
            </button>

            <button disabled={!selectedAnswerId} onClick={handleNextQuestion}>
              {currentQuestionIndex === total - 1
                ? 'Finish quiz'
                : 'Next question'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
