import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import { useQuiz } from '../../hooks/useQuiz';
import {
  getQuestionsWithAnswersByTestId,
  saveQuizResult,
} from '../../services/quiz';
import { useAuth } from '../../hooks/useAuth';

export const QuizPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const isSavingRef = useRef<boolean>(false);

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
      if (
        !testId ||
        !user?.id ||
        total === 0 ||
        currentQuestionIndex !== total ||
        isSavingRef.current
      ) {
        return;
      }

      const sendResults = async () => {
        isSavingRef.current = true;

        try {
          await saveQuizResult({
            testId: Number(testId),
            userId: user.id,
            score,
            total,
            userAnswers: userAnswers,
          });

          navigate(`/tests/${testId}/results`, {
            state: { score, total, userAnswers },
            replace: true,
          });
        } catch (error) {
          console.error('Failed to save quiz results:', error);

          isSavingRef.current = false;
        }
      };

      sendResults();
    }
  }, [currentQuestionIndex, total, testId, userAnswers, navigate, score, user]);

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
