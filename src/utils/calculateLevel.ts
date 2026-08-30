import type { QuestionWithAnswers } from '../types/database';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2'];
const PASS_THRESHOLD = 3;

export function calculateLevel(
  questions: QuestionWithAnswers[],
  userAnswers: Record<number, number>,
): string {
  let result = 'Begineer A1';

  for (const levelCode of LEVEL_ORDER) {
    const levelQuestions = questions.filter(
      (question) => question.levels?.code === levelCode,
    );
    const correctCount = levelQuestions.filter((question) => {
      const correctAnswer = question.answers.find(
        (answer) => answer.is_correct,
      );

      return correctAnswer && userAnswers[question.id] === correctAnswer.id;
    }).length;

    if (correctCount >= PASS_THRESHOLD) {
      result = levelCode;
    } else {
      break;
    }
  }

  return result;
}
