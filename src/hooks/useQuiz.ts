import { useCallback, useMemo, useState } from 'react';
import type { Answer, QuestionWithAnswers } from '../types/database';

export const useQuiz = (questions: QuestionWithAnswers[]) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const total = questions.length;

  const selectedAnswerId = currentQuestion
    ? (userAnswers[currentQuestion.id] ?? null)
    : null;

  const handleChooseAnswer = useCallback(
    (answer: Answer) => {
      if (!currentQuestion) {
        return;
      }

      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer.id,
      }));
    },
    [currentQuestion],
  );

  const handlePrevQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, total));
  }, [total]);

  const score = useMemo(() => {
    return questions.reduce((score, question) => {
      const savedAnswerId = userAnswers[question.id];

      if (!savedAnswerId) {
        return score;
      }

      const selectedAnswer = question.answers.find(
        (answer) => answer.id === savedAnswerId,
      );

      return selectedAnswer?.is_correct ? score + 1 : score;
    }, 0);
  }, [questions, userAnswers]);

  return {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    score,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
  };
};
