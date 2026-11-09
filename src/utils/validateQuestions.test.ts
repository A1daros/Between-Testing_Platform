import { describe, expect, it } from 'vitest';
import type { UIQuestion } from '../types/testForm';
import { validateQuestions } from './validateQuestions';

const question = (fields: Partial<UIQuestion> = {}): UIQuestion => ({
  uiId: 'q',
  partUiId: null,
  question: 'Question',
  description: '',
  answers: [
    { text: 'Right', isCorrect: true },
    { text: 'Wrong', isCorrect: false },
  ],
  ...fields,
});

describe('validateQuestions', () => {
  it('needs at least one question', () => {
    expect(validateQuestions([])).toBe('Додайте хоча б одне питання.');
  });

  it('accepts valid questions', () => {
    expect(validateQuestions([question(), question()])).toBeNull();
  });

  it('refuses blank question text and names the question', () => {
    expect(validateQuestions([question(), question({ question: '  ' })])).toBe(
      'Питання 2 не має тексту.',
    );
  });

  it('refuses a blank answer', () => {
    expect(
      validateQuestions([
        question({
          answers: [
            { text: 'Right', isCorrect: true },
            { text: ' ', isCorrect: false },
          ],
        }),
      ]),
    ).toBe('Питання 1 має порожню відповідь.');
  });

  it('needs a correct answer', () => {
    expect(
      validateQuestions([
        question({ answers: [{ text: 'Only', isCorrect: false }] }),
      ]),
    ).toBe('У питанні 1 не вибрано правильну відповідь.');
  });
});
