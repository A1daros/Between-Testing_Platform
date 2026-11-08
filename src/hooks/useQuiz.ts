import { useState } from 'react';

type WithId = { id: number };

type UseQuizOptions = {
  initialAnswers?: Record<number, number>;
  initialIndex?: number;
};

export const useQuiz = <TQuestion extends WithId>(
  questions: TQuestion[],
  { initialAnswers = {}, initialIndex = 0 }: UseQuizOptions = {},
) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialIndex);
  const [isFinished, setIsFinished] = useState(false);

  const [userAnswers, setUserAnswers] =
    useState<Record<number, number>>(initialAnswers);

  const currentQuestion = questions[currentQuestionIndex];

  const total = questions.length;

  const selectedAnswerId = currentQuestion
    ? (userAnswers[currentQuestion.id] ?? null)
    : null;

  const handleChooseAnswer = (answer: WithId) => {
    if (!currentQuestion) {
      return;
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer.id,
    }));
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

  return {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    userAnswers,
    isFinished,
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
    handleFinishQuiz,
  };
};
