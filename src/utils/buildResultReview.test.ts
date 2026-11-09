import { describe, expect, it } from 'vitest';
import type { ResultAnswerDetails } from '../types/database';
import { buildResultReview } from './buildResultReview';

type RowInput = {
  id: number;
  answerId: number;
  correctId: number | null;
  partId?: number | null;
  partTitle?: string;
};

const row = ({
  id,
  answerId,
  correctId,
  partId = null,
  partTitle,
}: RowInput) =>
  ({
    id,
    answer_id: answerId,
    correct_answer_id: correctId,
    answers: { answer_text: `Picked ${answerId}` },
    questions: {
      question: `Question ${id}`,
      part_id: partId,
      test_parts: partTitle ? { title: partTitle, instruction: 'Do' } : null,
      answers: [
        { id: 1, answer_text: 'First' },
        { id: 2, answer_text: 'Second' },
      ],
    },
  }) as unknown as ResultAnswerDetails;

describe('buildResultReview', () => {
  it('compares the student answer with the key', () => {
    const [right, wrong] = buildResultReview([
      row({ id: 1, answerId: 1, correctId: 1 }),
      row({ id: 2, answerId: 2, correctId: 1 }),
    ]);

    expect(right).toMatchObject({
      number: 1,
      isCorrect: true,
      correctAnswer: 'First',
      studentAnswer: 'Picked 1',
    });
    expect(wrong).toMatchObject({
      number: 2,
      isCorrect: false,
      correctAnswer: 'First',
      studentAnswer: 'Picked 2',
    });
  });

  it('shows no correct answer while the key is locked', () => {
    const [item] = buildResultReview([
      row({ id: 1, answerId: 1, correctId: null }),
    ]);

    expect(item.correctAnswer).toBeNull();
    expect(item.isCorrect).toBe(false);
  });

  it('adds a part header only where a new part starts', () => {
    const items = buildResultReview([
      row({ id: 1, answerId: 1, correctId: 1, partId: 10, partTitle: 'One' }),
      row({ id: 2, answerId: 1, correctId: 1, partId: 10, partTitle: 'One' }),
      row({ id: 3, answerId: 1, correctId: 1 }),
      row({ id: 4, answerId: 1, correctId: 1, partId: 20, partTitle: 'Two' }),
    ]);

    expect(items[0].part).toEqual({
      number: 1,
      title: 'One',
      instruction: 'Do',
    });
    expect(items[1].part).toBeNull();
    expect(items[2].part).toBeNull();
    expect(items[3].part).toMatchObject({ number: 2, title: 'Two' });
  });
});
