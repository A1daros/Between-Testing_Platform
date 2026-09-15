import { useMemo, useState } from 'react';
import type { Answer, QuestionWithAnswers } from '../types/database';

export const useQuiz = (questions: QuestionWithAnswers[]) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const currentQuestion = questions[currentQuestionIndex];

  const total = questions.length;
  const totalScore = questions.reduce(
    (sum, question) => sum + (question.test_parts?.points ?? 1),
    0,
  );

  const selectedAnswerId = currentQuestion
    ? (userAnswers[currentQuestion.id] ?? null)
    : null;

  const handleChooseAnswer = (answer: Answer) => {
    if (!currentQuestion) {
      return;
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer.id,
    }));
  };

  const handleChoosePlacementAnswer = (answer: Answer) => {
    const questionId = questions[currentQuestionIndex]?.id;
    if (questionId) {
      setUserAnswers((prev) => ({ ...prev, [questionId]: answer.id }));
    }
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, total - 1));
  };

  const handleFinishQuiz = () => {
    setIsFinished(true);
  };

  const score = useMemo(() => {
    return questions.reduce((sum, question) => {
      const savedAnswerId = userAnswers[question.id];
      const points = question.test_parts?.points ?? 1;

      if (!savedAnswerId) {
        return sum;
      }

      const selectedAnswer = question.answers.find(
        (answer) => answer.id === savedAnswerId,
      );

      return selectedAnswer?.is_correct ? sum + points : sum;
    }, 0);
  }, [questions, userAnswers]);

  return {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    isFinished,
    total,
    score,
    totalScore,
    handleChooseAnswer,
    handleChoosePlacementAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  };
};
