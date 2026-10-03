import type { UIQuestion } from "../modules/admin/AdminDashboard/components/Tests/types/testForm";

export const validateQuestions = (questions: UIQuestion[]): string | null => {
  if (questions.length === 0) {
    return 'Add at least one question.';
  }

  for (const [index, question] of questions.entries()) {
    const number = index + 1;

    if (question.question.trim() === '') {
      return `Question ${number} has no text.`;
    }

    if (question.answers.some((answer) => answer.text.trim() === '')) {
      return `Question ${number} has an empty answer.`;
    }

    if (!question.answers.some((answer) => answer.isCorrect)) {
      return `Question ${number} has no correct answer selected.`;
    }
  }

  return null;
};
