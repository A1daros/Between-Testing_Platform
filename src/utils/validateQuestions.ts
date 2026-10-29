import type { UIQuestion } from "../modules/admin/AdminDashboard/components/Tests/types/testForm";

export const validateQuestions = (questions: UIQuestion[]): string | null => {
  if (questions.length === 0) {
    return 'Додайте хоча б одне питання.';
  }

  for (const [index, question] of questions.entries()) {
    const number = index + 1;

    if (question.question.trim() === '') {
      return `Питання ${number} не має тексту.`;
    }

    if (question.answers.some((answer) => answer.text.trim() === '')) {
      return `Питання ${number} має порожню відповідь.`;
    }

    if (!question.answers.some((answer) => answer.isCorrect)) {
      return `У питанні ${number} не вибрано правильну відповідь.`;
    }
  }

  return null;
};
