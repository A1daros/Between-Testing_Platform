import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionWithAnswers } from '../../types/database';
import { useQuiz } from '../../hooks/useQuiz';
import {
  getQuestionsWithAnswersByTestId,
  saveQuizResult,
} from '../../services/quiz';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';

export const QuizPage = () => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();

  const navigate = useNavigate();

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

      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getQuestionsWithAnswersByTestId(Number(testId));

        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setErrorMessage('Failed to load quiz!');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [testId]);

  useEffect(() => {
    if (!testId || total === 0) {
      return;
    }

    if (currentQuestionIndex !== total) {
      return;
    }

    if (!user?.id || isSavingRef.current) {
      return;
    }

    const sendResults = async () => {
      isSavingRef.current = true;

      setIsSaving(true);
      setErrorMessage('');

      try {
        await saveQuizResult({
          testId: Number(testId),
          userId: user.id,
          score,
          total,
          userAnswers,
        });

        navigate(`/tests/${testId}/results`, {
          state: { score, total, userAnswers },
          replace: true,
        });
      } catch (error) {
        console.error('Failed to save quiz results:', error);
        setErrorMessage('Failed to save results!');

        isSavingRef.current = false;

        setIsSaving(false);
      }
    };

    sendResults();
  }, [currentQuestionIndex, total, testId, userAnswers, navigate, score, user]);

  const currentAnswers = currentQuestion?.answers ?? [];

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!questions.length) {
    return <p>No questions found!</p>;
  }

  if (isSaving) {
    return <Loader />;
  }

  return (
    <div>
      {currentQuestion && (
        <div>
          <div>
            <h1>{currentQuestion.tests.title}</h1>
            <h2>{currentQuestion.tests.description}</h2>

            <h3>{currentQuestion.test_parts?.title}</h3>
            <p>{currentQuestion.test_parts?.instruction}</p>
          </div>

          <div>
            <h2>{currentQuestion.title}</h2>

            <p>
              {currentQuestionIndex + 1} / {total}
            </p>
          </div>

          <div>
            {currentQuestion.description !== null && (
              <p>{currentQuestion.description}</p>
            )}

            <h3>{currentQuestion.question}</h3>
          </div>

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
