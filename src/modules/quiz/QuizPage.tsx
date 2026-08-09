import { useEffect, useState } from 'react';
import type { Answer, Question } from '../../types/database';
import {
  getAnswersByQuestionId,
  getQuestionsByTestId,
} from '../../services/quiz';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../../hooks/useQuiz';

export const QuizPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, Answer[]>
  >({});

  const allAnswersFlattened = Object.values(answersByQuestion).flat();

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
  } = useQuiz(questions, allAnswersFlattened);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!testId) {
        return;
      }

      try {
        const data = await getQuestionsByTestId(Number(testId));

        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    loadQuestions();
  }, [testId]);

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    if (answersByQuestion[currentQuestion.id]) {
      return;
    }

    const loadAnswers = async () => {
      try {
        const data = await getAnswersByQuestionId(Number(currentQuestion.id));

        setAnswersByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: data,
        }));
      } catch (error) {
        console.log(error);
      }
    };

    loadAnswers();
  }, [currentQuestion, answersByQuestion]);

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

  const currentAnswers = currentQuestion
    ? answersByQuestion[currentQuestion.id] || []
    : [];

  if (currentQuestionIndex === total) {
    return <p>Redirecting to results...</p>;
  }

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
