import { useEffect, useState } from 'react';
import type { Answer, Question } from '../../types/database';
import {
  getAnswersByQuestionId,
  getQuestionsByTestId,
} from '../../services/quiz';
import { useParams } from 'react-router-dom';

export const QuizPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { testId } = useParams();

  const currentQuestion = questions[currentQuestionIndex];

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
    const loadAnswers = async () => {
      if (!currentQuestion) {
        return;
      }

      try {
        const data = await getAnswersByQuestionId(Number(currentQuestion.id));

        setAnswers(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadAnswers();
  }, [currentQuestion]);

  console.log('testId:', testId);

  return (
    <div>
      {currentQuestion && <h2>{currentQuestion.question}</h2>}

      <div>
        {answers.map((answer) => (
          <div key={answer.id}>{answer.answer_text}</div>
        ))}
      </div>
    </div>
  );
};
