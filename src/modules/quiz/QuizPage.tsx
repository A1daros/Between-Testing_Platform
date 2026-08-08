import { useEffect, useState } from 'react';
import type { Answer, Question } from '../../types/database';
import {
  getAnswersByQuestionId,
  getQuestionsByTestId,
} from '../../services/quiz';
import { useParams } from 'react-router-dom';
import { useQuiz } from '../../hooks/useQuiz';

export const QuizPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, Answer[]>
  >({});

  const { testId } = useParams();

  const allAnswersFlattened = Object.values(answersByQuestion).flat();

  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    score,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
  } = useQuiz(questions, allAnswersFlattened);

  const currentAnswers = currentQuestion
    ? answersByQuestion[currentQuestion.id] || []
    : [];

  useEffect(() => {
    const loadQuestions = async () => {
      if (!testId) {
        return;
      }

      try {
        const data = await getQuestionsByTestId(Number(testId));

        setQuestions(data);
      } catch (error) {
        console.log(error);
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

  if (!questions.length) {
    return <p>Loading quiz questions...</p>;
  }

  if (currentQuestionIndex === total) {
    return (
      <div>
        <h2>Quiz completed!</h2>
        <p>
          Your score is {score} out of {total}!
        </p>
      </div>
    );
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
