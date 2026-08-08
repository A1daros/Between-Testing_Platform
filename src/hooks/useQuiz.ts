import { useState } from 'react';
import type { Answer, Question } from '../types/database';

export const useQuiz = (questions: Question[], answers: Answer[]) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const total = questions.length;

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

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, total));
  };

  const calculateScore = (): number => {
    return questions.reduce((acc, question) => {
      const savedAnswers = userAnswers[question.id];
      if (!savedAnswers) return acc;

      const answer = answers.find((answer) => answer.id === savedAnswers);
      return answer?.is_correct ? acc + 1 : acc;
    }, 0);
  };

  return {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswerId,
    score: calculateScore(),
    total,
    handleChooseAnswer,
    handlePrevQuestion,
    handleNextQuestion,
  };
};
