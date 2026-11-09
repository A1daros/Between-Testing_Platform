import type { FormEvent, ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  removeTestAudio,
  uploadTestAudio,
  validateAudioFile,
} from '../../../../../services/audio';
import type { TestFormData } from '../../../../../types/testForm';
import { captureError } from '../../../../../utils/captureError';
import { useTestForm } from './useTestForm';

vi.mock('../../../../../services/audio', () => ({
  removeTestAudio: vi.fn(),
  uploadTestAudio: vi.fn(),
  validateAudioFile: vi.fn(),
}));
vi.mock('../../../../../utils/captureError', () => ({ captureError: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

const submitEvent = {
  preventDefault: () => {},
} as FormEvent<HTMLFormElement>;

const validForm: TestFormData = {
  title: 'Test',
  description: '',
  levelId: '1',
  timerEnabled: false,
  timerType: null,
  timerDuration: null,
  parts: [
    {
      id: 1,
      uiId: '1',
      title: 'Listening',
      instruction: '',
      points: 2,
      audioPath: 'parts/old.mp3',
      audioFile: null,
    },
  ],
  questions: [
    {
      id: 5,
      uiId: '5',
      partUiId: '1',
      question: 'Question',
      description: '',
      answers: [
        { id: 7, text: 'A', isCorrect: true },
        { id: 8, text: 'B', isCorrect: false },
      ],
    },
  ],
};

const renderForm = (
  initial: TestFormData | null = validForm,
  onSubmit = vi.fn().mockResolvedValue(undefined),
) => ({
  onSubmit,
  ...renderHook(() => useTestForm(initial ?? undefined, onSubmit), { wrapper }),
});

describe('useTestForm', () => {
  beforeEach(() => {
    vi.mocked(validateAudioFile).mockReturnValue(null);
    vi.mocked(removeTestAudio).mockResolvedValue(undefined);
    vi.mocked(uploadTestAudio).mockResolvedValue('parts/new.mp3');
  });

  it('adds a question with four answers and the first one correct', () => {
    const { result } = renderForm(null);

    act(() => result.current.addQuestion());

    const [question] = result.current.form.questions;

    expect(question.answers).toHaveLength(4);
    expect(question.answers.filter((answer) => answer.isCorrect)).toHaveLength(1);
    expect(question.answers[0].isCorrect).toBe(true);
  });

  it('keeps exactly one correct answer', () => {
    const { result } = renderForm();

    act(() => result.current.selectCorrectAnswer('5', 1));

    expect(
      result.current.form.questions[0].answers.map((answer) => answer.isCorrect),
    ).toEqual([false, true]);
  });

  it('clears timer settings when the timer is turned off', () => {
    const { result } = renderForm();

    act(() => result.current.toggleTimer(true));
    act(() => result.current.setTimerType('test'));
    act(() => result.current.setTimerDuration(60));
    act(() => result.current.toggleTimer(false));

    expect(result.current.form).toMatchObject({
      timerEnabled: false,
      timerType: null,
      timerDuration: null,
    });
  });

  it('detaches questions from a removed part', () => {
    const { result } = renderForm();

    act(() => result.current.removePart('1'));

    expect(result.current.form.parts).toEqual([]);
    expect(result.current.form.questions[0].partUiId).toBeNull();
  });

  it('refuses an invalid audio file', () => {
    vi.mocked(validateAudioFile).mockReturnValue('Файл занадто великий');
    const { result } = renderForm();

    act(() => result.current.selectPartAudio('1', new File(['x'], 'a.mp3')));

    expect(result.current.errorMessage).toBe('Файл занадто великий');
    expect(result.current.form.parts[0].audioFile).toBeNull();
  });

  it('does not submit invalid questions', async () => {
    const { result, onSubmit } = renderForm(null);

    await act(() => result.current.handleSubmit(submitEvent));

    expect(result.current.errorMessage).toBe('Додайте хоча б одне питання.');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sends ids and ui links so the test is updated in place', async () => {
    const { result, onSubmit } = renderForm();

    await act(() => result.current.handleSubmit(submitEvent));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        levelId: '1',
        parts: [
          {
            id: 1,
            uiId: '1',
            title: 'Listening',
            instruction: '',
            points: 2,
            audioPath: 'parts/old.mp3',
          },
        ],
        questions: [
          {
            id: 5,
            partId: '1',
            question: 'Question',
            description: '',
            answers: validForm.questions[0].answers,
          },
        ],
      }),
    );
    expect(removeTestAudio).toHaveBeenCalledWith([]);
  });

  it('uploads a new file and removes the replaced one after saving', async () => {
    const { result, onSubmit } = renderForm();
    const file = new File(['x'], 'new.mp3');

    act(() => result.current.selectPartAudio('1', file));
    await act(() => result.current.handleSubmit(submitEvent));

    expect(uploadTestAudio).toHaveBeenCalledWith(file);

    const [payload] = onSubmit.mock.calls[0];

    expect(payload.parts[0].audioPath).toBe('parts/new.mp3');
    expect(payload.parts[0]).not.toHaveProperty('audioFile');
    expect(removeTestAudio).toHaveBeenCalledWith(['parts/old.mp3']);
  });

  it('keeps the test saved when removing an old file fails', async () => {
    const failure = new Error('storage');

    vi.mocked(removeTestAudio).mockRejectedValue(failure);
    const { result } = renderForm();

    await act(() => result.current.handleSubmit(submitEvent));

    expect(captureError).toHaveBeenCalledWith(failure);
    expect(result.current.errorMessage).toBe('');
  });

  it('cleans up uploads and keeps old audio when saving fails', async () => {
    const failure = new Error('save failed');
    const { result } = renderForm(
      validForm,
      vi.fn().mockRejectedValue(failure),
    );

    act(() => result.current.selectPartAudio('1', new File(['x'], 'new.mp3')));
    await act(() => result.current.handleSubmit(submitEvent));

    expect(removeTestAudio).toHaveBeenCalledTimes(1);
    expect(removeTestAudio).toHaveBeenCalledWith(['parts/new.mp3']);
    expect(result.current.errorMessage).toBe(
      'Не вдалося зберегти тест. Спробуйте ще раз.',
    );
    expect(result.current.isSubmitting).toBe(false);
    expect(captureError).toHaveBeenCalledWith(failure);
  });
});
