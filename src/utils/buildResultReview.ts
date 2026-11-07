import type { ResultAnswerDetails } from '../types/database';

export type ResultReviewPart = {
  number: number;
  title: string;
  instruction: string;
};

export type ResultReviewItem = {
  id: number;
  number: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string | null;
  isCorrect: boolean;
  part: ResultReviewPart | null;
};

export const buildResultReview = (
  details: ResultAnswerDetails[],
): ResultReviewItem[] => {
  let partNumber = 0;

  return details.map((item, index) => {
    const previous = details[index - 1];
    const testPart = item.questions.test_parts;
    const isNewPart =
      Boolean(testPart) && item.questions.part_id !== previous?.questions.part_id;

    if (isNewPart) {
      partNumber += 1;
    }

    const correctAnswer = item.questions.answers.find(
      (answer) => answer.id === item.correct_answer_id,
    );

    return {
      id: item.id,
      number: index + 1,
      question: item.questions.question,
      studentAnswer: item.answers.answer_text,
      correctAnswer: correctAnswer?.answer_text ?? null,
      isCorrect: item.answer_id === item.correct_answer_id,
      part:
        isNewPart && testPart
          ? {
              number: partNumber,
              title: testPart.title,
              instruction: testPart.instruction,
            }
          : null,
    };
  });
};
