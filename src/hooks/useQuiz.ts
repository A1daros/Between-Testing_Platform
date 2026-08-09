import { useCallback, useMemo, useState } from 'react';
import type { Answer, Question } from '../types/database';

export const useQuiz = (questions: Question[], answers: Answer[]) => {
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

  const calculateScore = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }

    const answersMap = new Map<number, Answer>(
      answers.map((answer) => [answer.id, answer]),
    );

    return questions.reduce((acc, question) => {
      const savedAnswerId = userAnswers[question.id];

      if (!savedAnswerId) {
        return acc;
      }

      const answer = answersMap.get(savedAnswerId);

      return answer?.is_correct ? acc + 1 : acc;
    }, 0);
  }, [answers, questions, userAnswers]);

  return {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    score: calculateScore,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
  };
};
