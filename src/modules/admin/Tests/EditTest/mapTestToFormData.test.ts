import { describe, expect, it } from 'vitest';
import type { EditableTest } from '../../../../types/database';
import { mapTestToFormData } from './mapTestToFormData';

const test_ = {
  title: 'Test',
  description: null,
  level_id: 3,
  timer_enabled: true,
  timer_type: 'test',
  timer_duration: 60,
  test_parts: [
    {
      id: 1,
      title: 'Part',
      instruction: 'Do',
      points: 2,
      audio_path: 'parts/a.mp3',
    },
  ],
  questions: [
    {
      id: 5,
      part_id: 1,
      question: 'Q1',
      description: 'Text',
      answers: [{ id: 7, answer_text: 'A', is_correct: true }],
    },
    {
      id: 6,
      part_id: null,
      question: 'Q2',
      description: null,
      answers: [],
    },
  ],
} as unknown as EditableTest;

describe('mapTestToFormData', () => {
  it('keeps database ids, so saving updates rows in place', () => {
    const form = mapTestToFormData(test_);

    expect(form.parts[0]).toMatchObject({ id: 1, uiId: '1' });
    expect(form.questions[0]).toMatchObject({ id: 5, uiId: '5', partUiId: '1' });
    expect(form.questions[0].answers[0]).toEqual({
      id: 7,
      text: 'A',
      isCorrect: true,
    });
  });

  it('turns nulls into values the form inputs accept', () => {
    const form = mapTestToFormData({ ...test_, level_id: null } as EditableTest);

    expect(form.levelId).toBe('');
    expect(form.description).toBe('');
    expect(form.questions[1].description).toBe('');
    expect(form.questions[1].partUiId).toBeNull();
  });

  it('keeps the saved audio and has no new file', () => {
    const [part] = mapTestToFormData(test_).parts;

    expect(part.audioPath).toBe('parts/a.mp3');
    expect(part.audioFile).toBeNull();
  });
});
