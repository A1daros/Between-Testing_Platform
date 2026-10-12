import { useState } from 'react';

type WithId = { id: number };

export const useQuiz = <TQuestion extends WithId>(questions: TQuestion[]) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

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
